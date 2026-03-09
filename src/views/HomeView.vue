<script setup>
import { useRouter } from 'vue-router'
import { venueSchedule, MAX_ROUNDS } from '../data/schedule.js'

const router = useRouter()

const todayStr = (() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${['日','月','火','水','木','金','土'][d.getDay()]}）`
})()

const rounds = Array.from({ length: MAX_ROUNDS }, (_, i) => i + 1)

function cellInfo(venue, r) {
  return venue.rounds[r] || null
}

function cellClass(info) {
  if (!info) return 'cell-empty'
  switch (info.status) {
    case 'open':     return 'cell-open clickable'
    case 'upcoming': return 'cell-upcoming clickable'
    case 'closed':   return 'cell-closed-bg'
    case 'result':   return info.raceId ? 'cell-result-bg clickable' : 'cell-result-bg'
    case 'cancel':   return 'cell-cancel-bg'
    default:         return 'cell-empty'
  }
}

function goRace(info) {
  if (info?.raceId) {
    router.push('/race/' + info.raceId)
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div class="page-header-title">本日の投票受付レース</div>
      <div class="page-header-date">{{ todayStr }}</div>
    </div>

    <div class="schedule-wrap">
      <table class="schedule-table">
        <thead>
          <tr>
            <th class="th-venue">開催場</th>
            <th class="th-track">ダ/芝</th>
            <th class="th-weather">天候</th>
            <th v-for="r in rounds" :key="r" class="th-round">{{ r }}R</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venue in venueSchedule" :key="venue.id">
            <td class="td-venue">{{ venue.name }}</td>
            <td class="td-track">{{ venue.track }}</td>
            <td class="td-weather">{{ venue.weather }}</td>
            <td
              v-for="r in rounds"
              :key="r"
              class="td-cell"
              :class="cellClass(cellInfo(venue, r))"
              @click="goRace(cellInfo(venue, r))"
            >
              <template v-if="!cellInfo(venue, r)">
                <span class="cell-dash">–</span>
              </template>
              <template v-else-if="cellInfo(venue, r).status === 'cancel'">
                <span class="cell-cancel-txt">中止</span>
              </template>
              <template v-else-if="cellInfo(venue, r).status === 'closed'">
                <span class="cell-closed-txt">締切<br><small>{{ cellInfo(venue, r).time }}</small></span>
              </template>
              <template v-else-if="cellInfo(venue, r).status === 'result'">
                <span class="cell-result-txt">確定<br><small>{{ cellInfo(venue, r).time }}</small></span>
              </template>
              <template v-else>
                <span class="cell-vote-btn">
                  投票<br><small>{{ cellInfo(venue, r).time }}</small>
                </span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="legend">
      <span class="legend-item"><span class="legend-dot dot-open"></span>投票受付中</span>
      <span class="legend-item"><span class="legend-dot dot-upcoming"></span>発走前</span>
      <span class="legend-item"><span class="legend-dot dot-closed"></span>締切/確定</span>
    </div>
    <div class="disclaimer">※ このサイトは架空の競馬投票デモサービスです。</div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.page-header-title { font-size: 1.2rem; font-weight: 800; }
.page-header-date { font-size: 0.82rem; color: #888; }

.schedule-wrap { overflow-x: auto; margin-bottom: 12px; }

.schedule-table {
  border-collapse: collapse;
  font-size: 0.82rem;
  min-width: 700px;
  width: 100%;
}
.schedule-table th {
  background: #1e1e3a;
  color: #aab;
  padding: 6px 4px;
  text-align: center;
  border: 1px solid #2a2a4a;
  white-space: nowrap;
}
.th-venue { min-width: 56px; }
.th-track, .th-weather { min-width: 32px; }
.th-round { min-width: 44px; }

.schedule-table td {
  border: 1px solid #1a1a30;
  padding: 3px 2px;
  text-align: center;
  vertical-align: middle;
  height: 42px;
}
.td-venue { background: #1a1a30; font-weight: 700; font-size: 0.85rem; white-space: nowrap; padding: 4px 8px; }
.td-track, .td-weather { background: #141428; color: #888; font-size: 0.78rem; }

/* Cell base states */
.cell-empty { background: #0d0d1a; }
.cell-dash { color: #2a2a44; }

.cell-open    { background: #0c1a0e; }
.cell-upcoming{ background: #0c1220; }
.cell-closed-bg  { background: #111118; }
.cell-result-bg  { background: #160c0c; }
.cell-cancel-bg  { background: #111118; }

/* Vote button (open / upcoming) */
.cell-vote-btn {
  display: inline-block;
  border-radius: 4px;
  padding: 3px 6px;
  font-weight: 700;
  font-size: 0.76rem;
  line-height: 1.4;
  color: #fff;
}
.cell-open     .cell-vote-btn { background: #e63946; }
.cell-upcoming .cell-vote-btn { background: #2563eb; }

.cell-closed-txt { color: #555; font-size: 0.75rem; line-height: 1.3; }
.cell-result-txt { color: #f87171; font-size: 0.75rem; line-height: 1.3; font-weight: 700; }
.cell-cancel-txt { color: #444; font-size: 0.75rem; }

.clickable { cursor: pointer; }
.clickable:hover { filter: brightness(1.4); }

.legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.78rem;
  color: #888;
  margin-bottom: 8px;
}
.legend-item { display: flex; align-items: center; gap: 4px; }
.legend-dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; }
.dot-open { background: #e63946; }
.dot-upcoming { background: #2563eb; }
.dot-closed { background: #555; }

.disclaimer { font-size: 0.75rem; color: #555; }
</style>
