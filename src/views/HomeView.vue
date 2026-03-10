<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { DATE_SCENARIOS, makeRaceKey, getRaceInfo, getRaceStatus } from '../data/scenarios.js'

const router = useRouter()

const HOURS = Array.from({ length: 13 }, (_, i) => 9 + i) // 9-21

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
  const m = grade.match(/（(.+?)）$/)
  return m ? m[1] : grade
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
      return {
        round, status,
        time: info.time,
        grade: info.grade,
        raceKey: makeRaceKey(store.selectedDateIdx, seqIdx, round),
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
  if (cell.status === 'result') return 'c-result clickable'
  if (cell.status === 'closed') return 'c-closed clickable'
  return 'c-open clickable'
}

const openCount = computed(() =>
  scheduleRows.value.flatMap(r => r.rounds).filter(c => c.status === 'open').length
)

// 重賞レースリスト (スケジュール下部表示用) ─ startHour昇順
const featuredRaces = computed(() => {
  const s = currentScenario.value
  if (!s) return []
  const list = []
  s.venues.forEach((venueId, seqIdx) => {
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
</script>

<template>
  <div>
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
              <template v-if="cell.status === 'result'">
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
  </div>
</template>

<style scoped>
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
.td-cell { height: 52px; }
.td-venue { background: #f0fdf4; font-weight: 700; font-size: 0.84rem; padding: 4px 8px; white-space: nowrap; border: 1px solid #bbf7d0; color: #166534; }

/* セル状態 */
.c-empty  { background: #f9fafb; }
.c-dash   { color: #d1d5db; }
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
</style>
