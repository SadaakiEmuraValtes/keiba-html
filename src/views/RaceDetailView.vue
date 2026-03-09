<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { races } from '../data/races.js'
import { store } from '../store/index.js'

const route = useRoute()
const router = useRouter()

const race = computed(() => races.find(r => r.id === Number(route.params.id)))

// ---- Bet state ----
const betType = ref('単勝')
const selectedHorses = ref([])
const betAmount = ref(100)

const BET_TYPES = [
  { label: '単勝', count: 1, desc: '1着馬を当てる' },
  { label: '複勝', count: 1, desc: '3着以内を当てる' },
  { label: '馬連', count: 2, desc: '1・2着馬（順不同）' },
  { label: '馬単', count: 2, desc: '1・2着馬（順序通り）' },
  { label: 'ワイド', count: 2, desc: '3着以内2頭（順不同）' },
  { label: '3連複', count: 3, desc: '1〜3着馬（順不同）' },
  { label: '3連単', count: 3, desc: '1〜3着馬（順序通り）' },
]

const currentBetType = computed(() => BET_TYPES.find(b => b.label === betType.value))
const requiredCount = computed(() => currentBetType.value?.count ?? 1)

function selectBetType(type) {
  betType.value = type
  selectedHorses.value = []
}

function toggleHorse(num) {
  const idx = selectedHorses.value.indexOf(num)
  if (idx >= 0) {
    selectedHorses.value.splice(idx, 1)
  } else {
    if (selectedHorses.value.length < requiredCount.value) {
      selectedHorses.value.push(num)
    } else {
      selectedHorses.value.shift()
      selectedHorses.value.push(num)
    }
  }
}

const canBet = computed(() =>
  selectedHorses.value.length === requiredCount.value &&
  betAmount.value >= 100 &&
  betAmount.value <= store.balance &&
  (race.value?.status === 'open')
)

const betMessage = ref('')
const betSuccess = ref(false)

function placeBet() {
  if (!canBet.value) return
  const bet = store.placeBet(
    race.value.id,
    race.value.name,
    betType.value,
    [...selectedHorses.value],
    betAmount.value
  )
  betMessage.value = `✅ 投票完了！ ${betType.value} 馬番: ${selectedHorses.value.join('→')} ¥${betAmount.value.toLocaleString()}`
  betSuccess.value = true
  selectedHorses.value = []
  setTimeout(() => { betMessage.value = ''; betSuccess.value = false }, 4000)
}

function setAmount(v) { betAmount.value = v }
function addAmount(v) { betAmount.value = Math.min(betAmount.value + v, store.balance) }

const oddsClass = (odds) => odds < 5 ? 'odds-low' : odds < 15 ? 'odds-mid' : 'odds-high'

const statusLabel = { upcoming: '発走前', open: '投票受付中', closed: '締切', result: '確定' }
</script>

<template>
  <div v-if="race">
    <!-- Back button -->
    <button class="btn btn-secondary btn-sm mb-12" @click="router.push('/')">← レース一覧</button>

    <!-- Race header -->
    <div class="race-detail-header card mb-12">
      <div class="race-header-top">
        <h1 class="race-title">{{ race.name }}</h1>
        <span class="badge" :class="'badge-' + race.status">{{ statusLabel[race.status] }}</span>
      </div>
      <div class="race-header-meta">
        <span>🏟 {{ race.venue }}</span>
        <span>📏 {{ race.distance }}</span>
        <span>🕐 {{ race.startTime }}</span>
        <span>{{ race.horses.length }}頭立て</span>
        <span v-if="race.grade" class="badge" :class="'badge-' + race.grade.toLowerCase()">{{ race.grade }}</span>
      </div>
    </div>

    <!-- Result (if settled) -->
    <div v-if="race.result" class="card mb-12">
      <div class="page-title" style="font-size:1rem; margin-bottom:10px;">🏆 レース結果</div>
      <div class="result-box">
        <div class="result-place">
          <div class="place-label">🥇 1着</div>
          <div class="place-num first-place">{{ race.result.first }}番</div>
          <div class="place-horse-name">{{ race.horses.find(h => h.number === race.result.first)?.name }}</div>
        </div>
        <div class="result-place">
          <div class="place-label">🥈 2着</div>
          <div class="place-num second-place">{{ race.result.second }}番</div>
          <div class="place-horse-name">{{ race.horses.find(h => h.number === race.result.second)?.name }}</div>
        </div>
        <div class="result-place">
          <div class="place-label">🥉 3着</div>
          <div class="place-num third-place">{{ race.result.third }}番</div>
          <div class="place-horse-name">{{ race.horses.find(h => h.number === race.result.third)?.name }}</div>
        </div>
      </div>
    </div>

    <!-- Horse table -->
    <div class="card mb-12">
      <div class="section-title mb-8">出走馬一覧</div>
      <div class="table-scroll">
        <table class="horse-table">
          <thead>
            <tr>
              <th>馬番</th>
              <th>馬名</th>
              <th>騎手</th>
              <th>性齢</th>
              <th>体重</th>
              <th>人気</th>
              <th>オッズ</th>
              <template v-if="race.status === 'open'">
                <th>選択</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="horse in [...race.horses].sort((a, b) => a.number - b.number)"
              :key="horse.number"
              :class="{ 'row-selected': selectedHorses.includes(horse.number) }"
            >
              <td>
                <span class="horse-num" :class="horse.popularity <= 3 ? 'pop-' + horse.popularity : 'pop-other'">
                  {{ horse.number }}
                </span>
              </td>
              <td class="horse-name-cell">{{ horse.name }}</td>
              <td>{{ horse.jockey }}</td>
              <td>{{ horse.sex }}{{ horse.age }}</td>
              <td>{{ horse.weight }}kg</td>
              <td>
                <span class="pop-badge" :class="'pop-badge-' + (horse.popularity <= 3 ? horse.popularity : 'other')">
                  {{ horse.popularity }}人気
                </span>
              </td>
              <td>
                <span class="odds-val" :class="oddsClass(horse.odds)">{{ horse.odds.toFixed(1) }}</span>
              </td>
              <template v-if="race.status === 'open'">
                <td>
                  <button
                    class="select-btn"
                    :class="{ selected: selectedHorses.includes(horse.number) }"
                    @click="toggleHorse(horse.number)"
                  >
                    {{ selectedHorses.includes(horse.number) ? '✓ 選択中' : '選択' }}
                  </button>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bet panel (only when open) -->
    <div v-if="race.status === 'open'" class="bet-panel mb-12">
      <div class="section-title mb-12">🎯 投票</div>

      <!-- Bet type tabs -->
      <div class="bet-type-tabs">
        <button
          v-for="bt in BET_TYPES"
          :key="bt.label"
          class="bet-type-tab"
          :class="{ active: betType === bt.label }"
          @click="selectBetType(bt.label)"
        >
          {{ bt.label }}
        </button>
      </div>
      <div class="bet-type-desc text-muted mb-12">{{ currentBetType?.desc }}（{{ requiredCount }}頭選択）</div>

      <!-- Selected horses -->
      <div class="selected-horses mb-12">
        <span class="text-muted" style="font-size:0.82rem;">選択中: </span>
        <span v-if="selectedHorses.length === 0" class="text-muted" style="font-size:0.82rem;">未選択</span>
        <span
          v-for="(num, i) in selectedHorses"
          :key="num"
          class="sel-horse-chip"
        >
          <template v-if="i > 0 && (betType === '馬単' || betType === '3連単')">→ </template>
          <span class="horse-num pop-1" style="width:22px;height:22px;font-size:0.78rem;">{{ num }}</span>
          {{ race.horses.find(h => h.number === num)?.name }}
        </span>
      </div>

      <!-- Amount -->
      <div class="amount-input-row mb-12">
        <label class="text-muted" style="font-size:0.85rem;">購入金額:</label>
        <input
          type="number"
          class="amount-input"
          v-model.number="betAmount"
          min="100"
          step="100"
          :max="store.balance"
        />
        <div class="amount-quick">
          <button @click="setAmount(100)">100</button>
          <button @click="setAmount(500)">500</button>
          <button @click="setAmount(1000)">1000</button>
          <button @click="addAmount(1000)">+1000</button>
          <button @click="setAmount(store.balance)">全額</button>
        </div>
      </div>

      <!-- Estimated payout note -->
      <div class="text-muted mb-12" style="font-size:0.8rem;">
        所持金: <span class="text-gold">{{ store.balance.toLocaleString() }}円</span>
        　投票後残高: <span :class="canBet ? 'text-gold' : 'text-red'">
          {{ (store.balance - betAmount).toLocaleString() }}円
        </span>
      </div>

      <!-- Bet button -->
      <button
        class="btn btn-primary"
        :disabled="!canBet"
        @click="placeBet"
        style="width:100%; font-size:1rem; padding:12px;"
      >
        {{ canBet ? '馬券を購入する' : '馬を選択してください' }}
      </button>

      <!-- Bet message -->
      <div v-if="betMessage" class="bet-message" :class="{ success: betSuccess }">
        {{ betMessage }}
      </div>
    </div>

    <!-- Status messages -->
    <div v-else-if="race.status === 'upcoming'" class="status-msg card">
      🕐 このレースはまだ投票受付前です（{{ race.startTime }} 発走予定）
    </div>
    <div v-else-if="race.status === 'closed'" class="status-msg card">
      🚫 このレースの投票は締め切られました。結果をお待ちください。
    </div>
  </div>

  <div v-else class="card">
    <p>レースが見つかりません。</p>
    <button class="btn btn-secondary mt-12" @click="router.push('/')">← 戻る</button>
  </div>
</template>

<style scoped>
.race-detail-header { }
.race-header-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.race-title { font-size: 1.1rem; font-weight: 800; }
.race-header-meta { display: flex; gap: 12px; font-size: 0.82rem; color: #888; flex-wrap: wrap; align-items: center; }
.section-title { font-size: 0.95rem; font-weight: 700; }
.bet-type-desc { font-size: 0.8rem; margin-top: -8px; }

.table-scroll { overflow-x: auto; }
.horse-name-cell { text-align: left; font-weight: 600; }
.row-selected td { background: #1e0a2a !important; }

.pop-badge { font-size: 0.72rem; padding: 1px 5px; border-radius: 3px; }
.pop-badge-1 { background: #e6394622; color: #f87171; }
.pop-badge-2 { background: #e68a0022; color: #fbbf24; }
.pop-badge-3 { background: #1a7a4a22; color: #4ade80; }
.pop-badge-other { background: #33335566; color: #aab; }

.selected-horses { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; min-height: 30px; }
.sel-horse-chip { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; background: #1e1e3a; padding: 3px 8px; border-radius: 6px; }

.bet-message {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #1a1a30;
  font-size: 0.88rem;
  color: #aab;
}
.bet-message.success { background: #143020; color: #4ade80; border: 1px solid #1a5030; }

.place-horse-name { font-size: 0.82rem; color: #aab; margin-top: 2px; }
.status-msg { font-size: 0.9rem; color: #888; }
</style>
