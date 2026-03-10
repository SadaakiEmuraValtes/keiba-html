<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { getWin5RaceKeys, getRaceInfo, parseRaceKey, getRaceStatus } from '../data/scenarios.js'
import { generateHorses, generateResult } from '../data/masterData.js'

const router = useRouter()

const win5Keys = computed(() => getWin5RaceKeys(store.selectedDateIdx))

const win5Races = computed(() => {
  return win5Keys.value.map((key, idx) => {
    const { dateIdx, venueSeqIdx, round } = parseRaceKey(key)
    const info = getRaceInfo(dateIdx, venueSeqIdx, round)
    if (!info) return null
    const status = getRaceStatus(info.startHour, store.virtualHour)
    const horses = generateHorses(key, info.count)
    const result = status === 'result' ? generateResult(key, info.count, horses) : null
    return { key, info, status, horses, result, raceNo: idx + 1 }
  }).filter(Boolean)
})

// picks[i] = 選択した馬番配列 (レースiに対応)
const picks = ref([[], [], [], [], []])

function togglePick(raceIdx, num) {
  const p = [...picks.value[raceIdx]]
  const i = p.indexOf(num)
  if (i >= 0) p.splice(i, 1)
  else p.push(num)
  picks.value = picks.value.map((arr, idx) => idx === raceIdx ? p : arr)
}

function isPicked(raceIdx, num) {
  return picks.value[raceIdx]?.includes(num)
}

const totalCombos = computed(() => {
  if (picks.value.some(p => p.length === 0)) return 0
  return picks.value.reduce((t, p) => t * p.length, 1)
})

// カート積でコンボ文字列を生成
function cartesian(arrays) {
  return arrays.reduce((acc, arr) => {
    const res = []
    acc.forEach(a => arr.forEach(b => res.push([...a, b])))
    return res
  }, [[]])
}

const allCombos = computed(() => {
  if (totalCombos.value === 0) return []
  return cartesian(picks.value).map(c => c.join('-'))
})

const betAmount = ref(100)
const QUICK_AMOUNTS = [100, 300, 500, 1000, 2000, 5000]
const totalBet = computed(() => totalCombos.value * betAmount.value)

const allOpen = computed(() => win5Races.value.every(r => r.status === 'open'))
const canBet = computed(() =>
  store.isLoggedIn && allOpen.value && totalCombos.value > 0 &&
  betAmount.value >= 100 && totalBet.value <= store.balance
)

const betMessage = ref('')
const betSuccess = ref(false)

function placeBet() {
  if (!canBet.value) return
  store.placeWin5Bet(win5Keys.value, allCombos.value, betAmount.value)
  betMessage.value = `WIN5 購入完了！${totalCombos.value}通り × ¥${betAmount.value.toLocaleString()} = ¥${totalBet.value.toLocaleString()}`
  betSuccess.value = true
  picks.value = [[], [], [], [], []]
  setTimeout(() => { betMessage.value = ''; betSuccess.value = false }, 6000)
}

function numpadPress(d) {
  if (d === 'C') { betAmount.value = 100; return }
  if (d === '00') { betAmount.value = Math.min(betAmount.value * 100, 999900); return }
  const s = String(betAmount.value / 100)
  const next = parseInt((s === '1' && betAmount.value === 100 ? '' : s) + d, 10) * 100
  if (!isNaN(next) && next >= 100) betAmount.value = Math.min(next, 999900)
}

function oddsClass(odds) {
  return odds < 10 ? 'odds-red' : 'odds-black'
}
</script>

<template>
  <div>
    <div class="page-title">WIN5</div>
    <div class="win5-desc card mb-12">
      <p>選択した日程の5レースすべての1着馬を当てる特別式。全レース一致で高配当！</p>
      <p class="text-muted" style="font-size:0.8rem;margin-top:6px;">※ 各レースで複数頭選択可能。組み合わせ数 × 購入額が合計金額になります。</p>
    </div>

    <div v-if="win5Keys.length === 0" class="card">
      <p class="text-muted">この日程にはWIN5対象レースがありません。</p>
    </div>

    <template v-else>
      <!-- 各レース選択 -->
      <div v-for="(race, ri) in win5Races" :key="race.key" class="race-card card mb-12">
        <div class="race-card-header">
          <span class="race-no">W{{ race.raceNo }}</span>
          <span class="race-label">{{ race.info.venueName }}{{ race.info.round }}R</span>
          <span class="race-grade">{{ race.info.grade }}</span>
          <span class="race-time text-muted">{{ race.info.time }}</span>
          <span class="race-status" :class="'rs-' + race.status">
            {{ race.status === 'open' ? '受付中' : race.status === 'closed' ? '締切' : race.status === 'result' ? '確定' : '' }}
          </span>
          <span class="pick-count" v-if="picks[ri].length > 0">{{ picks[ri].length }}頭選択中</span>
        </div>

        <!-- 結果表示 (確定済み) -->
        <div v-if="race.result" class="result-banner">
          1着: {{ race.result.first }}番 {{ race.horses.find(h=>h.number===race.result.first)?.name }}
          <span :class="picks[ri].includes(race.result.first) ? 'hit-mark' : 'miss-mark'">
            {{ picks[ri].includes(race.result.first) ? '✓ 的中' : '✗ 外れ' }}
          </span>
        </div>

        <!-- 馬一覧 -->
        <div class="horse-pick-grid">
          <button
            v-for="h in race.horses" :key="h.number"
            class="horse-pick-btn"
            :class="{
              'picked': isPicked(ri, h.number),
              'winner': race.result?.first === h.number,
              'disabled': race.status !== 'open',
            }"
            :disabled="race.status !== 'open'"
            @click="togglePick(ri, h.number)"
          >
            <span class="pick-num">{{ h.number }}</span>
            <span class="pick-name">{{ h.name }}</span>
            <span class="pick-odds odds-val" :class="oddsClass(h.odds)">{{ h.odds.toFixed(1) }}</span>
          </button>
        </div>
      </div>

      <!-- 購入パネル (全レース受付中のみ) -->
      <div v-if="!allOpen" class="card mb-12">
        <p class="text-muted">全5レースが投票受付中のときのみ購入できます。</p>
      </div>

      <div v-else class="card mb-12">
        <div v-if="!store.isLoggedIn" style="text-align:center;padding:16px;">
          <p class="text-muted" style="margin-bottom:12px;">投票にはログインが必要です。</p>
          <button class="btn btn-primary" @click="router.push('/login')">ログインへ</button>
        </div>

        <template v-else>
          <div class="combo-summary mb-12">
            <span class="combo-label">組み合わせ数:</span>
            <span class="combo-val">{{ totalCombos }}</span>
            <span class="text-muted" v-if="totalCombos === 0">（各レースから1頭以上選んでください）</span>
          </div>

          <div class="purchase-row-wrap mb-12">
            <div class="numpad-area">
              <div class="numpad-label">1点あたり（100円単位）</div>
              <div class="numpad-display">¥{{ betAmount.toLocaleString() }}</div>
              <div class="numpad-grid">
                <button v-for="d in ['1','2','3','4','5','6','7','8','9','0','00','C']" :key="d" class="numpad-btn" @click="numpadPress(d)">{{ d }}</button>
              </div>
              <div class="quick-amounts mt-6">
                <button v-for="a in QUICK_AMOUNTS" :key="a" class="quick-btn" @click="betAmount=a">{{ a }}</button>
              </div>
            </div>
            <div class="purchase-right">
              <div class="pr-row"><span>1点</span><span>¥{{ betAmount.toLocaleString() }}</span></div>
              <div class="pr-row"><span>点数</span><span>{{ totalCombos }}通り</span></div>
              <div class="pr-total-row"><span>合計</span><span class="pr-total">¥{{ totalBet.toLocaleString() }}</span></div>
              <div class="pr-balance">所持金: <span class="text-gold">¥{{ store.balance.toLocaleString() }}</span></div>
            </div>
          </div>

          <button class="bet-submit-btn" :class="{active:canBet}" :disabled="!canBet" @click="placeBet">
            {{ canBet ? `WIN5 ${totalCombos}通り ¥${totalBet.toLocaleString()} 購入する`
              : totalCombos === 0 ? '各レースから馬を選択してください'
              : totalBet > store.balance ? '残高不足' : '選択してください' }}
          </button>
          <div v-if="betMessage" class="bet-message" :class="{success:betSuccess}">{{ betMessage }}</div>
        </template>
      </div>

      <div class="win5-note card">
        <div class="section-label mb-8">WIN5 について</div>
        <ul class="note-list">
          <li>5つのレース全ての1着馬を的中させると払い戻し。</li>
          <li>各レースで複数頭選択できます（ボックス購入）。</li>
          <li>払戻金は的中馬のオッズの積 × 30倍（最低¥100,000/100円）。</li>
          <li>全レース確定後に自動精算されます。</li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
.win5-desc p { font-size: 0.88rem; color: #374151; }

.race-card { padding: 12px 14px; }
.race-card-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.race-no { background: #d97706; color: #fff; font-weight: 800; font-size: 0.82rem; padding: 3px 8px; border-radius: 4px; }
.race-label { font-weight: 700; font-size: 0.9rem; color: #1a1a1a; }
.race-grade { font-size: 0.78rem; color: #6b7280; }
.race-time { font-size: 0.75rem; }
.race-status { font-size: 0.72rem; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
.rs-open   { background: #dcfce7; color: #166534; }
.rs-closed { background: #f1f5f9; color: #9ca3af; }
.rs-result { background: #dbeafe; color: #1e40af; }
.pick-count { font-size: 0.75rem; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 3px; font-weight: 700; }

.result-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px 12px; font-size: 0.85rem; font-weight: 700; color: #166534; margin-bottom: 8px; }
.hit-mark  { color: #16a34a; margin-left: 8px; }
.miss-mark { color: #dc2626; margin-left: 8px; }

.horse-pick-grid { display: flex; flex-wrap: wrap; gap: 4px; }
.horse-pick-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 8px; border-radius: 6px; border: 1px solid #e2e8f0;
  background: #f8fafc; cursor: pointer; transition: all 0.12s; font-size: 0.78rem;
}
.horse-pick-btn:hover:not(.disabled) { border-color: #16a34a; background: #f0fdf4; }
.horse-pick-btn.picked { background: #16a34a; border-color: #16a34a; color: #fff; }
.horse-pick-btn.picked .odds-val { color: #fff !important; }
.horse-pick-btn.winner { border-color: #d97706; outline: 2px solid #d97706; }
.horse-pick-btn.disabled { opacity: 0.6; cursor: default; }
.pick-num { font-weight: 800; font-size: 0.85rem; min-width: 18px; text-align: center; }
.pick-name { max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pick-odds { font-size: 0.75rem; }

.odds-val { font-weight: 700; }
.odds-red   { color: #dc2626; }
.odds-black { color: #1a1a1a; }

.combo-summary { display: flex; align-items: center; gap: 8px; }
.combo-label { font-size: 0.85rem; color: #6b7280; }
.combo-val { font-size: 1.2rem; font-weight: 800; color: #16a34a; }

.purchase-row-wrap { display: flex; gap: 16px; flex-wrap: wrap; }
.numpad-area { flex-shrink: 0; }
.numpad-label { font-size: 0.72rem; color: #6b7280; margin-bottom: 4px; }
.numpad-display { background: #fefce8; border: 1px solid #d97706; border-radius: 6px; padding: 6px 10px; font-size: 1.1rem; font-weight: 800; text-align: right; color: #92400e; margin-bottom: 6px; min-width: 120px; }
.numpad-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 4px; }
.numpad-btn { padding: 8px 4px; border-radius: 5px; border: 1px solid #e2e8f0; background: #f8fafc; color: #374151; font-size: 0.85rem; font-weight: 700; }
.numpad-btn:last-child { color: #dc2626; }
.numpad-btn:hover { background: #e2e8f0; }
.quick-amounts { display: flex; gap: 4px; flex-wrap: wrap; }
.quick-btn { padding: 3px 7px; border-radius: 4px; border: 1px solid #e2e8f0; background: #f8fafc; color: #374151; font-size: 0.76rem; }
.quick-btn:hover { background: #e2e8f0; }

.purchase-right { flex: 1; min-width: 140px; }
.pr-row { display: flex; justify-content: space-between; font-size: 0.82rem; color: #6b7280; padding: 3px 0; }
.pr-total-row { display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding: 6px 0; margin: 4px 0; }
.pr-total { font-size: 1.1rem; font-weight: 800; color: #16a34a; }
.pr-balance { font-size: 0.78rem; color: #6b7280; }

.bet-submit-btn { width: 100%; padding: 14px; border-radius: 8px; border: none; font-size: 1rem; font-weight: 800; background: #e2e8f0; color: #9ca3af; cursor: not-allowed; }
.bet-submit-btn.active { background: #d97706; color: #fff; cursor: pointer; }
.bet-submit-btn.active:hover { background: #b45309; }
.bet-message { margin-top: 10px; padding: 10px; border-radius: 6px; background: #f1f5f9; font-size: 0.85rem; }
.bet-message.success { background: #dcfce7; color: #166534; }

.note-list { padding-left: 18px; }
.note-list li { font-size: 0.82rem; color: #6b7280; margin-bottom: 4px; }

.mt-6 { margin-top: 6px; }
</style>
