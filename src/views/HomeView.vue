<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { DATE_SCENARIOS, makeRaceKey, getRaceInfo, getRaceStatus } from '../data/scenarios.js'

const router = useRouter()

const HOURS = Array.from({ length: 12 }, (_, i) => 10 + i) // 10-21

const scenarios = DATE_SCENARIOS

function setDate(idx) { store.setDateIdx(idx) }
function setHour(h)  { store.setVirtualHour(h) }

const currentScenario = computed(() => DATE_SCENARIOS[store.selectedDateIdx])

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
      return { round, status, time: info.time, raceKey: makeRaceKey(store.selectedDateIdx, seqIdx, round) }
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
  if (cell.status && cell.status !== null) router.push('/race/' + cell.raceKey)
}

function cellClass(cell) {
  if (!cell.status) return 'c-empty'
  if (cell.status === 'result') return 'c-result'
  if (cell.status === 'closed') return 'c-closed'
  return 'c-open clickable'
}

const openCount = computed(() =>
  scheduleRows.value.flatMap(r => r.rounds).filter(c => c.status === 'open').length
)
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
      <span class="legend-item"><span class="ld ld-closed"></span>締切</span>
      <span class="legend-item"><span class="ld ld-result"></span>確定（クリックで結果確認）</span>
    </div>
  </div>
</template>

<style scoped>
/* 日程選択 */
.date-selector-section { margin-bottom: 14px; }
.date-selector-label { font-size: 0.75rem; color: #888; margin-bottom: 6px; }
.date-tabs { display: flex; flex-wrap: wrap; gap: 6px; }
.date-tab {
  padding: 6px 14px; border-radius: 6px; border: 1px solid #3a3a5a;
  background: #1a1a30; color: #aab; font-size: 0.82rem; font-weight: 600;
  transition: all 0.15s;
}
.date-tab.active { background: #e63946; border-color: #e63946; color: #fff; }
.date-tab:hover:not(.active) { background: #2a2a40; }

/* 時刻選択 */
.time-selector-section { margin-bottom: 16px; background: #12122a; border: 1px solid #2a2a4a; border-radius: 8px; padding: 12px 14px; }
.time-label { font-size: 0.82rem; color: #aab; margin-bottom: 8px; }
.time-val { color: #ffd700; font-size: 1rem; }
.time-tabs { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
.time-tab {
  padding: 5px 10px; border-radius: 5px; border: 1px solid #2a2a4a;
  background: #0d0d1a; color: #666; font-size: 0.78rem; font-weight: 600;
  transition: all 0.12s;
}
.time-tab.active { background: #ffd700; border-color: #ffd700; color: #000; }
.time-tab.past { color: #444; }
.time-tab:hover:not(.active) { background: #1a1a30; color: #aab; }
.time-note { font-size: 0.72rem; }

/* スケジュール表 */
.schedule-wrap { overflow-x: auto; margin-bottom: 10px; }
.schedule-table { border-collapse: collapse; font-size: 0.8rem; min-width: 680px; width: 100%; }
.schedule-table th { background: #1e1e3a; color: #aab; padding: 6px 4px; text-align: center; border: 1px solid #2a2a4a; white-space: nowrap; }
.th-venue { min-width: 52px; }
.th-round { min-width: 44px; }
.schedule-table td { border: 1px solid #1a1a30; padding: 3px 2px; text-align: center; vertical-align: middle; height: 44px; }
.td-venue { background: #1a1a30; font-weight: 700; font-size: 0.84rem; padding: 4px 8px; white-space: nowrap; }

/* セル状態 */
.c-empty { background: #0d0d1a; }
.c-dash { color: #2a2a44; }
.c-result { background: #140808; cursor: pointer; }
.c-result:hover { filter: brightness(1.4); }
.c-result-txt { color: #f87171; font-size: 0.73rem; line-height: 1.4; font-weight: 700; }
.c-closed { background: #0f0f1a; }
.c-closed-txt { color: #555; font-size: 0.73rem; line-height: 1.4; }
.c-open { background: #0c180e; }
.c-open:hover { filter: brightness(1.3); }
.c-vote-btn { display: inline-block; background: #e63946; border-radius: 4px; padding: 3px 6px; font-size: 0.74rem; font-weight: 700; color: #fff; line-height: 1.4; }
.clickable { cursor: pointer; }

/* 凡例 */
.legend { display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.75rem; color: #888; }
.legend-item { display: flex; align-items: center; gap: 4px; }
.ld { display: inline-block; width: 10px; height: 10px; border-radius: 2px; }
.ld-open { background: #e63946; }
.ld-closed { background: #333; }
.ld-result { background: #f87171; }
</style>
