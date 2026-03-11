<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { DATE_SCENARIOS, makeRaceKey, getRaceInfo, getRaceStatus, getWin5RaceKeys, parseRaceKey, getActiveEvents } from '../data/scenarios.js'
import { generateHorses, generateResult } from '../data/masterData.js'

const router = useRouter()

const HOURS = Array.from({ length: 10 }, (_, i) => 9 + i) // 9-18

const scenarios = DATE_SCENARIOS

function setDate(idx) { store.setDateIdx(idx) }
function setHour(h)  { store.setVirtualHour(h) }

const currentScenario = computed(() => DATE_SCENARIOS[store.selectedDateIdx])

function gradeOf(grade) {
  if (!grade) return null
  if (grade.includes('GIII')) return 'GIII'
  if (grade.includes('GII'))  return 'GII'
  if (grade.includes('GI'))   return 'GI'
  return null
}

function gradeShort(grade) {
  return grade.replace(/（[^）]+）$/, '').trim() || grade
}

// スケジュール行データ
const scheduleRows = computed(() => {
  const s = currentScenario.value
  if (!s) return []
  return s.venues.map((venueId, seqIdx) => {
    const rounds = Array.from({ length: 12 }, (_, i) => {
      const round = i + 1
      const info  = getRaceInfo(store.selectedDateIdx, seqIdx, round)
      if (!info) return { round, status: null }
      const status = getRaceStatus(info.startHour, store.virtualHour)
      const raceKey = makeRaceKey(store.selectedDateIdx, seqIdx, round)
      return {
        round, status,
        time: info.time,
        grade: info.grade,
        raceKey,
        isCancelled: cancelledRaceKeys.value.has(raceKey),
      }
    })
    return { venueId, venueName: info_venue(venueId), seqIdx, rounds }
  })
})

function info_venue(venueId) {
  const map = { tokyo:'東京', nakayama:'中山', hanshin:'阪神', kyoto:'京都', chukyo:'中京',
                kokura:'小倉', fukushima:'福島', niigata:'新潟', sapporo:'札幌', hakodate:'函館' }
  return map[venueId] ?? venueId
}

function goRace(cell) {
  if (cell.status) router.push('/race/' + cell.raceKey)
}

function cellClass(cell) {
  if (!cell.status) return 'c-empty'
  if (cell.isCancelled) return 'c-cancelled clickable'
  if (cell.status === 'result') return 'c-result clickable'
  if (cell.status === 'closed') return 'c-closed clickable'
  return 'c-open clickable'
}

const openCount = computed(() =>
  scheduleRows.value.flatMap(r => r.rounds).filter(c => c.status === 'open').length
)

// アクティブイベント（仮想時刻までに発生したもの）
const activeEvents = computed(() => getActiveEvents(store.selectedDateIdx, store.virtualHour))

// 競走中止レースのraceKeyセット
const cancelledRaceKeys = computed(() => {
  const s = currentScenario.value
  if (!s?.events) return new Set()
  return new Set(
    s.events
      .filter(e => e.type === 'race_cancel' && e.triggerHour <= store.virtualHour)
      .map(e => makeRaceKey(store.selectedDateIdx, e.venueSeqIdx, e.round))
  )
})

// イベント表示用のラベル変換
const EVENT_TYPE_LABEL = { scratch:'出走取消', exclusion:'除外', jockey_change:'騎乗変更', race_cancel:'競走中止' }
function eventContent(evt) {
  if (evt.type === 'scratch')       return `${evt.horseNo}番 出走取消（${evt.note}）`
  if (evt.type === 'exclusion')     return `${evt.horseNo}番 除外（${evt.note}）`
  if (evt.type === 'jockey_change') return `${evt.horseNo}番 騎手変更 → ${evt.newJockey}（${evt.note}）`
  if (evt.type === 'race_cancel')   return `競走中止（${evt.note}）`
  return evt.note
}
function eventRaceLabel(evt) {
  const s = currentScenario.value
  if (!s) return ''
  const venueName = info_venue(s.venues[evt.venueSeqIdx])
  return `${venueName}${evt.round}R`
}

// 重賞レースリスト (スケジュール下部表示用) ─ startHour昇順
const featuredRaces = computed(() => {
  const s = currentScenario.value
  if (!s) return []
  const list = []
  s.venues.forEach((_, seqIdx) => {
    for (let round = 1; round <= 12; round++) {
      const info = getRaceInfo(store.selectedDateIdx, seqIdx, round)
      if (!info) continue
      const gl = gradeOf(info.grade)
      if (!gl) continue
      list.push({
        ...info,
        gradeLevel: gl,
        status: getRaceStatus(info.startHour, store.virtualHour),
        raceKey: makeRaceKey(store.selectedDateIdx, seqIdx, round),
      })
    }
  })
  return list.sort((a, b) => a.startHour - b.startHour)
})

// ===== WIN5 =====
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

const win5Picks = ref([[], [], [], [], []])
watch(() => store.selectedDateIdx, () => { win5Picks.value = [[], [], [], [], []] })

function toggleWin5Pick(raceIdx, num) {
  const p = [...win5Picks.value[raceIdx]]
  const i = p.indexOf(num)
  if (i >= 0) p.splice(i, 1)
  else p.push(num)
  win5Picks.value = win5Picks.value.map((arr, idx) => idx === raceIdx ? p : arr)
}
function isWin5Picked(raceIdx, num) { return win5Picks.value[raceIdx]?.includes(num) }

function cartesian(arrays) {
  return arrays.reduce((acc, arr) => {
    const res = []
    acc.forEach(a => arr.forEach(b => res.push([...a, b])))
    return res
  }, [[]])
}

const win5TotalCombos = computed(() => {
  if (win5Picks.value.some(p => p.length === 0)) return 0
  return win5Picks.value.reduce((t, p) => t * p.length, 1)
})
const win5AllCombos = computed(() => {
  if (win5TotalCombos.value === 0) return []
  return cartesian(win5Picks.value).map(c => c.join('-'))
})

const win5BetAmount = ref(100)
const WIN5_QUICK_AMOUNTS = [100, 300, 500, 1000, 2000, 5000]
const win5TotalBet = computed(() => win5TotalCombos.value * win5BetAmount.value)
const allWin5Open = computed(() => win5Races.value.length === 5 && win5Races.value.every(r => r.status === 'open'))
const canWin5Bet = computed(() =>
  store.isLoggedIn && allWin5Open.value && win5TotalCombos.value > 0 &&
  win5BetAmount.value >= 100 && win5TotalBet.value <= store.balance
)
const win5BetMsg = ref('')
const win5BetOk  = ref(false)

function placeWin5Bet() {
  if (!canWin5Bet.value) return
  store.placeWin5Bet(win5Keys.value, win5AllCombos.value, win5BetAmount.value)
  win5BetMsg.value = `WIN5 購入完了！${win5TotalCombos.value}通り × ¥${win5BetAmount.value.toLocaleString()} = ¥${win5TotalBet.value.toLocaleString()}`
  win5BetOk.value = true
  win5Picks.value = [[], [], [], [], []]
  setTimeout(() => { win5BetMsg.value = ''; win5BetOk.value = false }, 6000)
}

function win5Numpad(d) {
  if (d === 'C') { win5BetAmount.value = 100; return }
  if (d === '00') { win5BetAmount.value = Math.min(win5BetAmount.value * 100, 999900); return }
  const s = String(win5BetAmount.value / 100)
  const next = parseInt((s === '1' && win5BetAmount.value === 100 ? '' : s) + d, 10) * 100
  if (!isNaN(next) && next >= 100) win5BetAmount.value = Math.min(next, 999900)
}
function win5OddsClass(odds) { return odds < 10 ? 'odds-red' : 'odds-black' }
</script>

<template>
  <div>
    <!-- 免責バナー -->
    <div class="disclaimer-banner">
      ⚠️ 本サイト「KEIBA NET」は架空の競馬投票デモです。実際の競馬・馬券購入とは一切関係ありません。レース名・馬名・騎手名・結果はすべて架空のデータです。
    </div>

    <!-- 日程選択 -->
    <div class="date-selector-section">
      <div class="date-selector-label">開催日程を選択</div>
      <div class="date-tabs">
        <button
          v-for="(sc, idx) in scenarios" :key="idx"
          class="date-tab"
          :class="{ active: store.selectedDateIdx === idx }"
          @click="setDate(idx)"
        >{{ sc.dateLabel }}</button>
      </div>
    </div>

    <!-- 仮想時刻選択 -->
    <div class="time-selector-section">
      <div class="time-label">
        仮想時刻: <strong class="time-val">{{ store.virtualHour }}:00</strong>
        <span v-if="openCount > 0" class="badge badge-open" style="margin-left:12px;">投票受付中 {{ openCount }}R</span>
      </div>
      <div class="time-tabs">
        <button
          v-for="h in HOURS" :key="h"
          class="time-tab"
          :class="{ active: store.virtualHour === h, past: h < store.virtualHour }"
          @click="setHour(h)"
        >{{ h }}時</button>
      </div>
      <div class="time-note text-muted">時刻を進めるとレースが確定し、購入した馬券の払い戻しが自動計算されます</div>
    </div>

    <!-- スケジュール表 -->
    <div class="schedule-wrap">
      <table class="schedule-table">
        <thead>
          <tr>
            <th class="th-venue">競馬場</th>
            <th v-for="r in 12" :key="r" class="th-round">{{ r }}R</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in scheduleRows" :key="row.venueId">
            <td class="td-venue">{{ row.venueName }}</td>
            <td
              v-for="cell in row.rounds" :key="cell.round"
              class="td-cell"
              :class="cellClass(cell)"
              @click="goRace(cell)"
            >
              <span v-if="gradeOf(cell.grade)" class="grade-chip" :class="'gc-' + gradeOf(cell.grade).toLowerCase()">{{ gradeOf(cell.grade) }}</span>
              <template v-if="cell.isCancelled">
                <span class="c-cancel-txt">中止<br><small>{{ cell.time }}</small></span>
              </template>
              <template v-else-if="cell.status === 'result'">
                <span class="c-result-txt">確定<br><small>{{ cell.time }}</small></span>
              </template>
              <template v-else-if="cell.status === 'closed'">
                <span class="c-closed-txt">締切<br><small>{{ cell.time }}</small></span>
              </template>
              <template v-else-if="cell.status === 'open'">
                <span class="c-vote-btn">投票<br><small>{{ cell.time }}</small></span>
              </template>
              <template v-else>
                <span class="c-dash">–</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 凡例 -->
    <div class="legend">
      <span class="legend-item"><span class="ld ld-open"></span>投票受付中（クリックで投票）</span>
      <span class="legend-item"><span class="ld ld-closed"></span>締切（クリックで出馬表）</span>
      <span class="legend-item"><span class="ld ld-result"></span>確定（クリックで結果確認）</span>
    </div>

    <!-- 出走取消・除外・騎乗変更・競走中止イベント一覧 -->
    <div v-if="activeEvents.length" class="event-section mt-16">
      <div class="event-label">お知らせ（出走変更・取消情報）</div>
      <table class="event-table">
        <thead>
          <tr>
            <th class="et-time">発生時刻</th>
            <th class="et-type">種別</th>
            <th class="et-race">対象レース</th>
            <th class="et-content">内容</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="evt in activeEvents" :key="evt.id" :class="'erow-' + evt.type">
            <td class="et-time">{{ evt.triggerHour }}:00</td>
            <td class="et-type"><span class="etype-chip" :class="'etc-' + evt.type">{{ EVENT_TYPE_LABEL[evt.type] }}</span></td>
            <td class="et-race">{{ eventRaceLabel(evt) }}</td>
            <td class="et-content">{{ eventContent(evt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 重賞レース (スケジュール下部・締め切り時刻順) -->
    <div v-if="featuredRaces.length" class="featured-section mt-16">
      <div class="featured-label">重賞レース一覧</div>
      <div class="featured-list">
        <button
          v-for="race in featuredRaces" :key="race.raceKey"
          class="featured-card"
          :class="'fg-' + race.gradeLevel.toLowerCase()"
          @click="router.push('/race/' + race.raceKey)"
        >
          <span class="fg-grade-chip" :class="'fgc-' + race.gradeLevel.toLowerCase()">{{ race.gradeLevel }}</span>
          <span class="fg-venue">{{ race.venueName }}{{ race.round }}R</span>
          <span class="fg-race">{{ gradeShort(race.grade) }}</span>
          <span class="fg-time">{{ race.time }}</span>
          <span class="fg-status" :class="'fs-' + race.status">
            {{ race.status === 'open' ? '受付中' : race.status === 'closed' ? '締切' : race.status === 'result' ? '確定' : '' }}
          </span>
        </button>
      </div>
    </div>

    <!-- ===== WIN5 ===== -->
    <div v-if="win5Keys.length === 5" class="win5-wrap mt-16">
      <div class="win5-hdr">
        <span class="win5-label">WIN5</span>
        <span class="win5-desc">5レースすべての1着馬を当てる特別式。複数頭選択可。</span>
      </div>

      <!-- 5レース横並び -->
      <div class="win5-races-scroll">
        <div class="win5-races-grid">
          <div v-for="(race, ri) in win5Races" :key="race.key" class="win5-race-col">
            <div class="w5-head">
              <span class="w5-no">W{{ race.raceNo }}</span>
              <span class="w5-status" :class="'w5s-'+race.status">
                {{ race.status === 'open' ? '受付中' : race.status === 'closed' ? '締切' : '確定' }}
              </span>
              <div class="w5-venue">{{ race.info.venueName }}{{ race.info.round }}R</div>
              <div class="w5-grade-name">{{ race.info.grade }}</div>
              <div class="w5-time">{{ race.info.time }}</div>
            </div>

            <div v-if="race.result" class="w5-result">
              <span class="w5-result-num">{{ race.result.first }}番</span>
              <span class="w5-result-name">{{ race.horses.find(h => h.number===race.result.first)?.name }}</span>
              <span :class="win5Picks[ri].includes(race.result.first) ? 'w5-hit' : 'w5-miss'">
                {{ win5Picks[ri].includes(race.result.first) ? '✓' : '✗' }}
              </span>
            </div>

            <div class="w5-horses">
              <button
                v-for="h in race.horses" :key="h.number"
                class="w5-btn"
                :class="{
                  'w5-picked':   isWin5Picked(ri, h.number),
                  'w5-winner':   race.result?.first === h.number,
                  'w5-disabled': race.status !== 'open',
                }"
                :disabled="race.status !== 'open'"
                @click="toggleWin5Pick(ri, h.number)"
              >
                <span class="w5-num">{{ h.number }}</span>
                <span class="w5-name">{{ h.name }}</span>
                <span class="w5-odds" :class="win5OddsClass(h.odds)">{{ h.odds.toFixed(1) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 購入パネル -->
      <div v-if="!store.isLoggedIn" class="card mt-8" style="text-align:center;padding:14px;">
        <p class="text-muted mb-8">WIN5投票にはログインが必要です。</p>
        <button class="btn btn-primary btn-sm" @click="router.push('/login')">ログインへ</button>
      </div>
      <div v-else-if="!allWin5Open" class="card mt-8">
        <p class="text-muted" style="font-size:0.82rem;">全5レースが投票受付中のときのみ購入できます。</p>
      </div>
      <div v-else class="card mt-8">
        <div class="w5-combo-row mb-8">
          <span class="w5-combo-label">組み合わせ数:</span>
          <span class="w5-combo-val">{{ win5TotalCombos }}</span>
          <span v-if="win5TotalCombos === 0" class="text-muted" style="font-size:0.75rem;">（各レースから1頭以上選択）</span>
        </div>
        <div class="w5-purchase-top mb-8">
          <div class="numpad-area">
            <div class="numpad-label">1点あたり（100円単位）</div>
            <div class="numpad-display">¥{{ win5BetAmount.toLocaleString() }}</div>
            <div class="numpad-grid">
              <button v-for="d in ['1','2','3','4','5','6','7','8','9','0','00','C']" :key="d" class="numpad-btn" @click="win5Numpad(d)">{{ d }}</button>
            </div>
            <div class="quick-amounts mt-6">
              <button v-for="a in WIN5_QUICK_AMOUNTS" :key="a" class="quick-btn" @click="win5BetAmount=a">{{ a }}</button>
            </div>
          </div>
          <div class="w5-purchase-right">
            <div class="w5-pr-row"><span>1点</span><span>¥{{ win5BetAmount.toLocaleString() }}</span></div>
            <div class="w5-pr-row"><span>点数</span><span>{{ win5TotalCombos }}通り</span></div>
            <div class="w5-pr-total-row"><span>合計</span><span class="w5-pr-total">¥{{ win5TotalBet.toLocaleString() }}</span></div>
            <div class="w5-pr-balance">所持金: <span class="text-gold">¥{{ store.balance.toLocaleString() }}</span></div>
          </div>
        </div>
        <button class="w5-bet-btn" :class="{active: canWin5Bet}" :disabled="!canWin5Bet" @click="placeWin5Bet">
          {{ canWin5Bet
            ? `WIN5 ${win5TotalCombos}通り ¥${win5TotalBet.toLocaleString()} 購入する`
            : win5TotalCombos === 0 ? '各レースから馬を選択してください'
            : win5TotalBet > store.balance ? '残高不足' : '選択してください' }}
        </button>
        <div v-if="win5BetMsg" class="w5-bet-msg" :class="{success: win5BetOk}">{{ win5BetMsg }}</div>
      </div>

      <div class="w5-note mt-8">
        払戻 = 5勝馬のオッズ積 × 30（最低¥100,000/100円）。全レース確定後に自動精算。
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 免責バナー */
.disclaimer-banner {
  background: #fff8f0; border: 1px solid #f59e0b; border-radius: 6px;
  padding: 8px 12px; font-size: 0.76rem; color: #92400e; margin-bottom: 12px;
  line-height: 1.5;
}

/* 日程選択 */
.date-selector-section { margin-bottom: 14px; }
.date-selector-label { font-size: 0.75rem; color: #6b7280; margin-bottom: 6px; }
.date-tabs { display: flex; flex-wrap: wrap; gap: 6px; }
.date-tab {
  padding: 6px 14px; border-radius: 6px; border: 1px solid #e2e8f0;
  background: #fff; color: #374151; font-size: 0.82rem; font-weight: 600; transition: all 0.15s;
}
.date-tab.active { background: #16a34a; border-color: #16a34a; color: #fff; }
.date-tab:hover:not(.active) { background: #f1f5f9; }

/* 時刻選択 */
.time-selector-section { margin-bottom: 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
.time-label { font-size: 0.82rem; color: #374151; margin-bottom: 8px; }
.time-val { color: #d97706; font-size: 1rem; }
.time-tabs { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
.time-tab {
  padding: 5px 10px; border-radius: 5px; border: 1px solid #e2e8f0;
  background: #fff; color: #9ca3af; font-size: 0.78rem; font-weight: 600; transition: all 0.12s;
}
.time-tab.active { background: #d97706; border-color: #d97706; color: #fff; }
.time-tab.past { color: #d1d5db; }
.time-tab:hover:not(.active) { background: #f1f5f9; color: #374151; }
.time-note { font-size: 0.72rem; }

/* スケジュール表 */
.schedule-wrap { overflow-x: auto; margin-bottom: 10px; }
.schedule-table { border-collapse: collapse; font-size: 0.8rem; min-width: 700px; width: 100%; }
.schedule-table th { background: #f0fdf4; color: #166534; padding: 6px 4px; text-align: center; border: 1px solid #bbf7d0; white-space: nowrap; }
.th-venue { min-width: 52px; }
.th-round { min-width: 46px; }
.schedule-table td { border: 1px solid #e2e8f0; padding: 0; text-align: center; vertical-align: middle; }
.td-cell { height: 52px; position: relative; }
.grade-chip {
  position: absolute; top: 2px; right: 2px;
  font-size: 0.58rem; font-weight: 800; padding: 1px 3px; border-radius: 2px; line-height: 1;
  pointer-events: none;
}
.gc-gi   { background: #fef3c7; color: #92400e; }
.gc-gii  { background: #dbeafe; color: #1e40af; }
.gc-giii { background: #ffedd5; color: #9a3412; }
.td-venue { background: #f0fdf4; font-weight: 700; font-size: 0.84rem; padding: 4px 8px; white-space: nowrap; border: 1px solid #bbf7d0; color: #166534; }

/* セル状態 */
.c-empty  { background: #f9fafb; }
.c-dash   { color: #d1d5db; }
.c-cancelled { background: #fef2f2; }
.c-cancelled:hover { filter: brightness(0.97); }
.c-cancel-txt { color: #dc2626; font-size: 0.72rem; line-height: 1.5; font-weight: 700; }
.c-result { background: #eff6ff; }
.c-result:hover { filter: brightness(0.96); }
.c-result-txt { color: #1e40af; font-size: 0.72rem; line-height: 1.5; font-weight: 700; }
.c-closed { background: #f9fafb; }
.c-closed:hover { filter: brightness(0.97); }
.c-closed-txt { color: #9ca3af; font-size: 0.72rem; line-height: 1.5; }
.c-open   { background: #f0fdf4; }
.c-open:hover { filter: brightness(0.97); }
.c-vote-btn { display: inline-block; background: #16a34a; border-radius: 4px; padding: 3px 6px; font-size: 0.74rem; font-weight: 700; color: #fff; line-height: 1.5; }
.clickable { cursor: pointer; }

/* 凡例 */
.legend { display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.75rem; color: #6b7280; margin-bottom: 0; }
.legend-item { display: flex; align-items: center; gap: 4px; }
.ld { display: inline-block; width: 10px; height: 10px; border-radius: 2px; }
.ld-open   { background: #16a34a; }
.ld-closed { background: #d1d5db; }
.ld-result { background: #2563eb; }

/* イベントテーブル */
.event-section { }
.event-label { font-size: 0.75rem; font-weight: 700; color: #6b7280; margin-bottom: 8px; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
.event-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.event-table th { background: #fafafa; color: #6b7280; font-weight: 600; padding: 5px 8px; text-align: left; border: 1px solid #e2e8f0; white-space: nowrap; }
.event-table td { padding: 5px 8px; border: 1px solid #e2e8f0; vertical-align: middle; }
.et-time    { width: 60px; text-align: center; color: #6b7280; }
.et-type    { width: 80px; text-align: center; }
.et-race    { width: 70px; white-space: nowrap; font-weight: 600; color: #374151; }
.et-content { color: #374151; }
.erow-scratch td       { background: #fff8f0; }
.erow-exclusion td     { background: #fff8f0; }
.erow-jockey_change td { background: #f0f9ff; }
.erow-race_cancel td   { background: #fef2f2; }
.etype-chip { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 0.7rem; font-weight: 700; white-space: nowrap; }
.etc-scratch       { background: #fef3c7; color: #92400e; }
.etc-exclusion     { background: #ffedd5; color: #9a3412; }
.etc-jockey_change { background: #dbeafe; color: #1e40af; }
.etc-race_cancel   { background: #fee2e2; color: #dc2626; }

/* 重賞リスト */
.featured-section { }
.featured-label { font-size: 0.75rem; font-weight: 700; color: #6b7280; margin-bottom: 8px; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
.featured-list { display: flex; flex-direction: column; gap: 4px; }
.featured-card {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  border-radius: 7px; border: 1px solid #e2e8f0; background: #fff;
  cursor: pointer; transition: all 0.15s; font-size: 0.82rem; text-align: left;
}
.featured-card:hover { background: #f8fafc; border-color: #cbd5e1; }
.fg-gi   { border-left: 3px solid #d97706; }
.fg-gii  { border-left: 3px solid #2563eb; }
.fg-giii { border-left: 3px solid #ea580c; }

.fg-grade-chip { font-weight: 800; font-size: 0.7rem; padding: 2px 6px; border-radius: 3px; white-space: nowrap; }
.fgc-gi   { background: #fef3c7; color: #92400e; }
.fgc-gii  { background: #dbeafe; color: #1e40af; }
.fgc-giii { background: #ffedd5; color: #9a3412; }

.fg-venue { color: #6b7280; font-size: 0.75rem; white-space: nowrap; }
.fg-race  { font-weight: 700; color: #1a1a1a; flex: 1; }
.fg-time  { font-size: 0.72rem; color: #9ca3af; white-space: nowrap; }
.fg-status { font-size: 0.7rem; padding: 2px 6px; border-radius: 3px; white-space: nowrap; }
.fs-open   { background: #dcfce7; color: #166534; }
.fs-closed { background: #f1f5f9; color: #9ca3af; }
.fs-result { background: #dbeafe; color: #1e40af; }

/* WIN5 */
.win5-wrap { }
.win5-hdr { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; }
.win5-label { font-size: 1rem; font-weight: 800; color: #d97706; background: #fefce8; border: 1px solid #d97706; padding: 3px 10px; border-radius: 5px; }
.win5-desc { font-size: 0.75rem; color: #6b7280; }

.win5-races-scroll { overflow-x: auto; padding-bottom: 6px; }
.win5-races-grid { display: flex; gap: 6px; min-width: 560px; }
.win5-race-col { flex: 1; min-width: 105px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 6px; background: #f8fafc; }

.w5-head { margin-bottom: 6px; }
.w5-no { display: inline-block; background: #d97706; color: #fff; font-weight: 800; font-size: 0.68rem; padding: 1px 5px; border-radius: 3px; }
.w5-status { float: right; font-size: 0.6rem; font-weight: 700; padding: 1px 4px; border-radius: 2px; }
.w5s-open   { background: #dcfce7; color: #166534; }
.w5s-closed { background: #f1f5f9; color: #9ca3af; }
.w5s-result { background: #dbeafe; color: #1e40af; }
.w5-venue { font-size: 0.78rem; font-weight: 700; color: #1a1a1a; margin-top: 3px; }
.w5-grade-name { font-size: 0.63rem; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.w5-time { font-size: 0.6rem; color: #9ca3af; }

.w5-result { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 3px 5px; font-size: 0.65rem; font-weight: 700; color: #166534; margin-bottom: 5px; display: flex; gap: 3px; align-items: center; }
.w5-result-num { font-weight: 800; }
.w5-result-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.w5-hit { color: #16a34a; }
.w5-miss { color: #dc2626; }

.w5-horses { display: flex; flex-direction: column; gap: 2px; }
.w5-btn {
  display: flex; align-items: center; gap: 3px;
  padding: 3px 4px; border-radius: 4px; border: 1px solid #e2e8f0;
  background: #fff; font-size: 0.68rem; cursor: pointer; width: 100%;
  text-align: left; transition: all 0.1s;
}
.w5-btn:hover:not(.w5-disabled) { border-color: #16a34a; background: #f0fdf4; }
.w5-btn.w5-picked { background: #16a34a; border-color: #16a34a; color: #fff; }
.w5-btn.w5-picked .w5-odds { color: #fff !important; }
.w5-btn.w5-winner { border-color: #d97706; outline: 1px solid #d97706; }
.w5-btn.w5-disabled { opacity: 0.6; cursor: default; }
.w5-num { font-weight: 800; font-size: 0.72rem; min-width: 14px; text-align: center; }
.w5-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.w5-odds { font-size: 0.6rem; font-weight: 700; white-space: nowrap; }

.w5-combo-row { display: flex; align-items: center; gap: 8px; }
.w5-combo-label { font-size: 0.82rem; color: #6b7280; }
.w5-combo-val { font-size: 1.1rem; font-weight: 800; color: #16a34a; }

.w5-purchase-top { display: flex; gap: 16px; flex-wrap: wrap; }
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

.w5-purchase-right { flex: 1; min-width: 130px; }
.w5-pr-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: #6b7280; padding: 3px 0; }
.w5-pr-total-row { display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding: 6px 0; margin: 4px 0; }
.w5-pr-total { font-size: 1.05rem; font-weight: 800; color: #16a34a; }
.w5-pr-balance { font-size: 0.75rem; color: #6b7280; }

.w5-bet-btn { width: 100%; padding: 13px; border-radius: 8px; border: none; font-size: 0.95rem; font-weight: 800; background: #e2e8f0; color: #9ca3af; cursor: not-allowed; }
.w5-bet-btn.active { background: #d97706; color: #fff; cursor: pointer; }
.w5-bet-btn.active:hover { background: #b45309; }
.w5-bet-msg { margin-top: 8px; padding: 9px; border-radius: 5px; background: #f1f5f9; font-size: 0.82rem; }
.w5-bet-msg.success { background: #dcfce7; color: #166534; }

.w5-note { font-size: 0.72rem; color: #6b7280; padding: 4px 0; }

.mt-6 { margin-top: 6px; }
</style>
