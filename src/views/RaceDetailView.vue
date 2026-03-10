<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { DATE_SCENARIOS, parseRaceKey, getRaceInfo, getRaceStatus, makeRaceKey } from '../data/scenarios.js'
import { generateHorses, generateResult } from '../data/masterData.js'

const route  = useRoute()
const router = useRouter()

// ---- raceKey → race情報 ----
const raceKey = computed(() => Number(route.params.key))

const parsed = computed(() => parseRaceKey(raceKey.value))

const raceInfo = computed(() => {
  const { dateIdx, venueSeqIdx, round } = parsed.value
  return getRaceInfo(dateIdx, venueSeqIdx, round)
})

const horses = computed(() => {
  if (!raceInfo.value) return []
  return generateHorses(raceKey.value, raceInfo.value.count)
})

const raceStatus = computed(() => {
  if (!raceInfo.value) return null
  return getRaceStatus(raceInfo.value.startHour, store.virtualHour)
})

const raceResult = computed(() => {
  if (raceStatus.value !== 'result') return null
  return generateResult(raceKey.value, raceInfo.value.count, horses.value)
})

function horseName(num) {
  return horses.value.find(h => h.number === num)?.name ?? ''
}

// ---- 競馬場・ラウンドスイッチャー ----
const scenario = computed(() => DATE_SCENARIOS[store.selectedDateIdx])

function venueRoundStatus(venueSeqIdx, round) {
  const info = getRaceInfo(store.selectedDateIdx, venueSeqIdx, round)
  if (!info) return null
  return getRaceStatus(info.startHour, store.virtualHour)
}

function goRace(venueSeqIdx, round) {
  router.push('/race/' + makeRaceKey(store.selectedDateIdx, venueSeqIdx, round))
}

const venueNames = { tokyo:'東京', nakayama:'中山', hanshin:'阪神', kyoto:'京都', chukyo:'中京',
                     kokura:'小倉', fukushima:'福島', niigata:'新潟', sapporo:'札幌', hakodate:'函館' }

// ---- 式別 / 方式 定義 ----
const BET_TYPES = ['単勝', '複勝', '馬複', '馬単', 'ワイド', '三連複', '三連単']

const METHODS = {
  '単勝':  ['通常'],
  '複勝':  ['通常'],
  '馬複':  ['通常', '流し', 'ボックス', 'フォーメーション'],
  '馬単':  ['通常', '流し', 'ボックス', 'フォーメーション'],
  'ワイド':['通常', '流し', 'ボックス', 'フォーメーション'],
  '三連複':['通常', '流し', 'ボックス', 'フォーメーション'],
  '三連単':['通常', '流し', 'ボックス', 'フォーメーション'],
}

const NAGASHI_TYPES = {
  '馬複':  ['軸1頭'],
  'ワイド':['軸1頭'],
  '馬単':  ['1着流し', '2着流し'],
  '三連複':['軸1頭流し', '軸2頭流し'],
  '三連単':['1着流し', '2着流し', '1-2着流し'],
}

const betType     = ref('単勝')
const method      = ref('通常')
const nagashiType = ref('')

watch(betType, (bt) => {
  method.value = METHODS[bt][0]
  resetSelections()
})
watch(method, () => {
  if (method.value === '流し') {
    nagashiType.value = (NAGASHI_TYPES[betType.value] || ['軸1頭'])[0]
  }
  resetSelections()
})
watch(nagashiType, resetSelections)

// ---- 選択状態 ----
const normalSel   = ref([null, null, null])
const boxSel      = ref([])
const formSel     = ref([[], [], []])
const nagashiAxis = ref(null)
const nagashiAxis2= ref([])
const nagashiLegs = ref([])

function resetSelections() {
  normalSel.value    = [null, null, null]
  boxSel.value       = []
  formSel.value      = [[], [], []]
  nagashiAxis.value  = null
  nagashiAxis2.value = []
  nagashiLegs.value  = []
}

// ---- 位置定義 ----
const posLabels = computed(() => {
  switch (betType.value) {
    case '単勝':  return ['1着']
    case '複勝':  return ['着内']
    case '馬複':  return ['馬1', '馬2']
    case 'ワイド':return ['馬1', '馬2']
    case '馬単':  return ['1着', '2着']
    case '三連複':return ['馬1', '馬2', '馬3']
    case '三連単':return ['1着', '2着', '3着']
    default:      return []
  }
})

const posCount  = computed(() => posLabels.value.length)
const isOrdered = computed(() => ['馬単', '三連単'].includes(betType.value))

// ---- 流しUI定義 ----
const nagashiCols = computed(() => {
  const bt = betType.value
  const nt = nagashiType.value
  if (bt === '馬複' || bt === 'ワイド') {
    return [{ label: '軸', isAxis: true }, { label: '相手', isLeg: true }]
  }
  if (bt === '馬単') {
    if (nt === '1着流し') return [{ label: '1着(軸)', isAxis: true }, { label: '2着(相手)', isLeg: true }]
    return [{ label: '1着(相手)', isLeg: true }, { label: '2着(軸)', isAxis: true }]
  }
  if (bt === '三連複') {
    if (nt === '軸1頭流し') return [{ label: '軸', isAxis: true }, { label: '相手', isLeg: true }]
    return [{ label: '軸1', isAxis2: true }, { label: '軸2', isAxis2: true }, { label: '相手', isLeg: true }]
  }
  if (bt === '三連単') {
    if (nt === '1着流し')   return [{ label: '1着(軸)', isAxis: true }, { label: '2・3着(相手)', isLeg: true }]
    if (nt === '2着流し')   return [{ label: '1・3着(相手)', isLeg: true }, { label: '2着(軸)', isAxis: true }]
    return [{ label: '1着(軸)', isAxis: true }, { label: '2着(軸2)', isAxis2: true }, { label: '3着(相手)', isLeg: true }]
  }
  return []
})

// ---- 馬選択ハンドラ ----
function toggleNormal(pos, num) {
  const s = [...normalSel.value]
  s[pos] = s[pos] === num ? null : num
  normalSel.value = s
}
function toggleBox(num) {
  const idx = boxSel.value.indexOf(num)
  if (idx >= 0) boxSel.value.splice(idx, 1)
  else boxSel.value.push(num)
}
function toggleForm(pos, num) {
  const arr = [...formSel.value[pos]]
  const idx = arr.indexOf(num)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(num)
  const s = [...formSel.value]
  s[pos] = arr
  formSel.value = s
}
function toggleAxis(num) {
  nagashiAxis.value = nagashiAxis.value === num ? null : num
}
function toggleAxis2(num) {
  const arr = [...nagashiAxis2.value]
  const idx = arr.indexOf(num)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(num)
  nagashiAxis2.value = arr
}
function toggleLeg(num) {
  const arr = [...nagashiLegs.value]
  const idx = arr.indexOf(num)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(num)
  nagashiLegs.value = arr
}

// ---- 組み合わせ生成 ----
function combN2(arr) {
  const res = []
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      res.push([arr[i], arr[j]])
  return res
}
function combN3(arr) {
  const res = []
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      for (let k = j + 1; k < arr.length; k++)
        res.push([arr[i], arr[j], arr[k]])
  return res
}
function permN2(arr) {
  const res = []
  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr.length; j++)
      if (i !== j) res.push([arr[i], arr[j]])
  return res
}
function permN3(arr) {
  const res = []
  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr.length; j++)
      for (let k = 0; k < arr.length; k++)
        if (i !== j && j !== k && i !== k) res.push([arr[i], arr[j], arr[k]])
  return res
}

const combinations = computed(() => {
  const bt = betType.value
  const m  = method.value
  const nt = nagashiType.value

  if (bt === '単勝' || bt === '複勝') {
    return normalSel.value[0] != null ? [[normalSel.value[0]]] : []
  }

  const is2 = ['馬複', 'ワイド', '馬単'].includes(bt)
  const ord = isOrdered.value

  if (m === '通常') {
    const n   = posCount.value
    const sel = normalSel.value.slice(0, n)
    if (sel.some(s => s == null)) return []
    if (new Set(sel).size < n) return []
    return [sel]
  }

  if (m === 'ボックス') {
    const h = [...boxSel.value].sort((a, b) => a - b)
    if (is2) return ord ? permN2(h) : combN2(h)
    return ord ? permN3(h) : combN3(h)
  }

  if (m === 'フォーメーション') {
    const [p1, p2, p3] = formSel.value
    if (is2) {
      const combos = []
      for (const a of p1) {
        for (const b of p2) {
          if (a === b) continue
          if (ord) {
            combos.push([a, b])
          } else {
            const key = [a, b].sort((x, y) => x - y).join(',')
            if (!combos.some(c => c.join(',') === key)) combos.push([a, b].sort((x, y) => x - y))
          }
        }
      }
      return combos
    } else {
      const set = new Set()
      const combos = []
      for (const a of p1) for (const b of p2) for (const c of p3) {
        if (new Set([a, b, c]).size < 3) continue
        if (ord) {
          combos.push([a, b, c])
        } else {
          const key = [a, b, c].sort((x, y) => x - y).join(',')
          if (!set.has(key)) { set.add(key); combos.push([a, b, c].sort((x, y) => x - y)) }
        }
      }
      return combos
    }
  }

  if (m === '流し') {
    const axis  = nagashiAxis.value
    const axis2 = nagashiAxis2.value
    const legs  = nagashiLegs.value

    if (bt === '馬複' || bt === 'ワイド') {
      if (axis == null || legs.length === 0) return []
      return legs.filter(l => l !== axis).map(l => [axis, l].sort((a, b) => a - b))
    }
    if (bt === '馬単') {
      if (axis == null || legs.length === 0) return []
      if (nt === '1着流し') return legs.filter(l => l !== axis).map(l => [axis, l])
      return legs.filter(l => l !== axis).map(l => [l, axis])
    }
    if (bt === '三連複') {
      if (nt === '軸1頭流し') {
        if (axis == null || legs.length < 2) return []
        const filtered = legs.filter(l => l !== axis)
        return combN2(filtered).map(([a, b]) => [axis, a, b].sort((x, y) => x - y))
      } else {
        if (axis2.length < 2 || legs.length === 0) return []
        const [ax1, ax2] = [...axis2].sort((a, b) => a - b)
        const combos = []
        for (const l of legs) {
          if (l === ax1 || l === ax2) continue
          combos.push([ax1, ax2, l].sort((a, b) => a - b))
        }
        return combos
      }
    }
    if (bt === '三連単') {
      if (nt === '1着流し') {
        if (axis == null || legs.length < 2) return []
        const filtered = legs.filter(l => l !== axis)
        return permN2(filtered).map(([a, b]) => [axis, a, b])
      }
      if (nt === '2着流し') {
        if (axis == null || legs.length < 2) return []
        const filtered = legs.filter(l => l !== axis)
        return permN2(filtered).map(([a, b]) => [a, axis, b])
      }
      if (axis == null || axis2.length === 0 || legs.length === 0) return []
      const combos = []
      for (const ax2 of axis2) {
        if (ax2 === axis) continue
        for (const l of legs) {
          if (l === axis || l === ax2) continue
          combos.push([axis, ax2, l])
        }
      }
      return combos
    }
  }

  return []
})

// ---- 金額 ----
const betAmount   = ref(100)
const totalAmount = computed(() => combinations.value.length * betAmount.value)
const QUICK_AMOUNTS = [100, 300, 500, 1000, 2000, 5000]
function setAmount(v) { betAmount.value = v }

// ---- 購入 ----
const betMessage = ref('')
const betSuccess = ref(false)

const canBet = computed(() =>
  store.isLoggedIn &&
  combinations.value.length > 0 &&
  betAmount.value >= 100 &&
  totalAmount.value <= store.balance &&
  raceStatus.value === 'open'
)

function placeBet() {
  if (!canBet.value) return
  const info = raceInfo.value
  const label = `${info.venueName}${info.round}R ${info.grade}`
  store.placeBet(
    raceKey.value,
    label,
    `${betType.value}(${method.value})`,
    combinations.value.map(c => c.join('→')),
    betAmount.value
  )
  betMessage.value = `購入完了！${betType.value} ${method.value} ${combinations.value.length}通り × ¥${betAmount.value.toLocaleString()} = ¥${totalAmount.value.toLocaleString()}`
  betSuccess.value = true
  resetSelections()
  setTimeout(() => { betMessage.value = ''; betSuccess.value = false }, 5000)
}

// ---- テンキー ----
function numpadPress(d) {
  if (d === 'C') { betAmount.value = 100; return }
  if (d === '00') { betAmount.value = Math.min(betAmount.value * 100, 999900); return }
  const s    = String(betAmount.value / 100)
  const next = parseInt((s === '1' && betAmount.value === 100 ? '' : s) + d, 10) * 100
  if (!isNaN(next) && next >= 100) betAmount.value = Math.min(next, 999900)
}

// ---- ハイライト・全選択 ----
function isHorseHighlighted(num) {
  if (method.value === '通常')             return normalSel.value.includes(num)
  if (method.value === 'ボックス')         return boxSel.value.includes(num)
  if (method.value === 'フォーメーション') return formSel.value.some(arr => arr.includes(num))
  if (method.value === '流し')             return nagashiAxis.value === num || nagashiAxis2.value.includes(num) || nagashiLegs.value.includes(num)
  return false
}

function isWinner(num) {
  if (!raceResult.value) return false
  return [raceResult.value.first, raceResult.value.second, raceResult.value.third].includes(num)
}

function winnerPlace(num) {
  if (!raceResult.value) return null
  if (raceResult.value.first  === num) return 1
  if (raceResult.value.second === num) return 2
  if (raceResult.value.third  === num) return 3
  return null
}

const isAllSelected = computed(() => horses.value.every(h => boxSel.value.includes(h.number)))
function toggleAllBox() {
  if (isAllSelected.value) boxSel.value = []
  else boxSel.value = horses.value.map(h => h.number)
}

function oddsClass(odds) {
  return odds < 5 ? 'odds-low' : odds < 15 ? 'odds-mid' : 'odds-high'
}
</script>

<template>
  <div v-if="raceInfo">

    <!-- ===== 競馬場・ラウンドスイッチャー ===== -->
    <div class="switcher-wrap mb-12">
      <!-- 競馬場タブ -->
      <div class="venue-tabs">
        <button
          v-for="(venueId, vsi) in scenario.venues" :key="vsi"
          class="venue-tab"
          :class="{ active: vsi === parsed.venueSeqIdx }"
          @click="goRace(vsi, parsed.round)"
        >{{ venueNames[venueId] ?? venueId }}</button>
      </div>
      <!-- ラウンドボタン -->
      <div class="round-tabs">
        <button
          v-for="r in 12" :key="r"
          class="round-tab"
          :class="[
            'rs-' + (venueRoundStatus(parsed.venueSeqIdx, r) ?? 'empty'),
            { active: r === parsed.round }
          ]"
          @click="goRace(parsed.venueSeqIdx, r)"
        >{{ r }}R</button>
      </div>
    </div>

    <!-- ===== レースヘッダー ===== -->
    <div class="race-header card mb-12">
      <div class="race-header-row">
        <span class="race-venue-label">{{ raceInfo.venueName }} {{ raceInfo.round }}R</span>
        <span class="status-badge" :class="'sb-' + raceStatus">
          {{ raceStatus === 'open' ? '投票受付中' : raceStatus === 'closed' ? '締切' : raceStatus === 'result' ? '確定' : '-' }}
        </span>
      </div>
      <div class="race-name-big">{{ raceInfo.grade }}</div>
      <div class="race-meta-row">
        <span>{{ raceInfo.track }}</span>
        <span>発走 {{ raceInfo.time }}</span>
        <span>{{ raceInfo.count }}頭立て</span>
        <span>{{ store.virtualHour }}:00 現在</span>
      </div>
    </div>

    <!-- ===== 結果表示 ===== -->
    <div v-if="raceResult" class="card mb-12">
      <div class="section-label mb-8">レース結果</div>
      <div class="result-box">
        <div v-for="(key, i) in ['first','second','third']" :key="key" class="result-place">
          <div class="place-label">{{ ['1着','2着','3着'][i] }}</div>
          <div class="place-num" :class="['r-1st','r-2nd','r-3rd'][i]">{{ raceResult[key] }}番</div>
          <div class="place-name">{{ horseName(raceResult[key]) }}</div>
        </div>
      </div>
    </div>

    <!-- ===== 投票エリア (open のみ) ===== -->
    <template v-if="raceStatus === 'open'">

      <!-- ログイン必須ガード -->
      <div v-if="!store.isLoggedIn" class="login-guard card mb-12">
        <p class="login-guard-txt">投票にはログインが必要です。</p>
        <button class="btn btn-primary" @click="router.push('/login')">ログイン</button>
      </div>

      <template v-else>
        <!-- 式別タブ -->
        <div class="bet-section-label">式別</div>
        <div class="tab-row mb-8">
          <button
            v-for="bt in BET_TYPES" :key="bt"
            class="tab-btn" :class="{ active: betType === bt }"
            @click="betType = bt"
          >{{ bt }}</button>
        </div>

        <!-- 方式タブ -->
        <div v-if="METHODS[betType].length > 1">
          <div class="bet-section-label">方式</div>
          <div class="tab-row mb-8">
            <button
              v-for="m in METHODS[betType]" :key="m"
              class="tab-btn method-tab" :class="{ active: method === m }"
              @click="method = m"
            >{{ m }}</button>
          </div>
        </div>

        <!-- 流しサブ種別 -->
        <div v-if="method === '流し' && NAGASHI_TYPES[betType]">
          <div class="bet-section-label">流し種別</div>
          <div class="tab-row mb-8">
            <button
              v-for="nt in NAGASHI_TYPES[betType]" :key="nt"
              class="tab-btn nagashi-tab" :class="{ active: nagashiType === nt }"
              @click="nagashiType = nt"
            >{{ nt }}</button>
          </div>
        </div>

        <!-- 馬選択テーブル（投票用） -->
        <div class="card mb-12">
          <div class="table-scroll">
            <table class="horse-table">
              <thead>
                <tr>
                  <th>枠</th><th>番</th><th class="th-name">馬名</th>
                  <th>騎手</th><th>人気</th><th>オッズ</th>
                  <template v-if="method === '通常'">
                    <th v-for="(lbl, pi) in posLabels" :key="pi">{{ lbl }}</th>
                  </template>
                  <template v-else-if="method === 'ボックス'">
                    <th>選択</th>
                  </template>
                  <template v-else-if="method === 'フォーメーション'">
                    <th v-for="(lbl, pi) in posLabels" :key="pi">{{ lbl }}</th>
                  </template>
                  <template v-else-if="method === '流し'">
                    <th v-for="(col, ci) in nagashiCols" :key="ci">{{ col.label }}</th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="horse in horses" :key="horse.number"
                  :class="{ 'row-highlighted': isHorseHighlighted(horse.number) }"
                >
                  <td><span class="frame-badge" :class="'frame-' + horse.frame">{{ horse.frame }}</span></td>
                  <td><span class="horse-num">{{ horse.number }}</span></td>
                  <td class="td-name">{{ horse.name }}</td>
                  <td class="td-jockey">{{ horse.jockey }}</td>
                  <td><span class="pop-txt" :class="'pop-txt-' + (horse.popularity <= 3 ? horse.popularity : 'o')">{{ horse.popularity }}人気</span></td>
                  <td><span class="odds-val" :class="oddsClass(horse.odds)">{{ horse.odds.toFixed(1) }}</span></td>

                  <template v-if="method === '通常'">
                    <td v-for="pi in posCount" :key="pi">
                      <button
                        class="sel-btn" :class="{ active: normalSel[pi-1] === horse.number }"
                        @click="toggleNormal(pi-1, horse.number)"
                      >{{ horse.number }}</button>
                    </td>
                  </template>
                  <template v-else-if="method === 'ボックス'">
                    <td>
                      <button
                        class="sel-btn" :class="{ active: boxSel.includes(horse.number) }"
                        @click="toggleBox(horse.number)"
                      >{{ horse.number }}</button>
                    </td>
                  </template>
                  <template v-else-if="method === 'フォーメーション'">
                    <td v-for="pi in posCount" :key="pi">
                      <button
                        class="sel-btn" :class="{ active: formSel[pi-1].includes(horse.number) }"
                        @click="toggleForm(pi-1, horse.number)"
                      >{{ horse.number }}</button>
                    </td>
                  </template>
                  <template v-else-if="method === '流し'">
                    <td v-for="(col, ci) in nagashiCols" :key="ci">
                      <template v-if="col.isAxis">
                        <button class="sel-btn sel-axis" :class="{ active: nagashiAxis === horse.number }" @click="toggleAxis(horse.number)">{{ horse.number }}</button>
                      </template>
                      <template v-else-if="col.isAxis2">
                        <button class="sel-btn sel-axis2" :class="{ active: nagashiAxis2.includes(horse.number) }" @click="toggleAxis2(horse.number)">{{ horse.number }}</button>
                      </template>
                      <template v-else>
                        <button class="sel-btn sel-leg" :class="{ active: nagashiLegs.includes(horse.number) }" @click="toggleLeg(horse.number)">{{ horse.number }}</button>
                      </template>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 全選択チェック (ボックス時) -->
        <div v-if="method === 'ボックス'" class="allcheck-row mb-8">
          <label class="allcheck-label">
            <input type="checkbox" :checked="isAllSelected" @change="toggleAllBox"> 全頭選択
          </label>
        </div>

        <!-- 組み合わせ表示 -->
        <div class="combo-section card mb-12">
          <div class="combo-header">
            <span class="section-label">組み合わせ</span>
            <span class="combo-count">{{ combinations.length }}通り</span>
          </div>
          <div v-if="combinations.length === 0" class="combo-empty">馬を選択してください</div>
          <div v-else class="combo-list">
            <span v-for="(combo, i) in combinations.slice(0, 60)" :key="i" class="combo-item">
              {{ combo.join('→') }}
            </span>
            <span v-if="combinations.length > 60" class="combo-more">他{{ combinations.length - 60 }}通り…</span>
          </div>
        </div>

        <!-- 金額・購入パネル -->
        <div class="purchase-panel card mb-12">
          <div class="purchase-top">
            <div class="numpad-area">
              <div class="numpad-label">1点あたり（100円単位）</div>
              <div class="numpad-display">¥{{ betAmount.toLocaleString() }}</div>
              <div class="numpad-grid">
                <button v-for="d in ['1','2','3','4','5','6','7','8','9','0','00','C']" :key="d" class="numpad-btn" @click="numpadPress(d)">{{ d }}</button>
              </div>
              <div class="quick-amounts mt-6">
                <button v-for="a in QUICK_AMOUNTS" :key="a" class="quick-btn" @click="setAmount(a)">{{ a }}</button>
              </div>
            </div>
            <div class="purchase-right">
              <div class="purchase-row">
                <span class="purchase-row-label">1点</span>
                <span class="purchase-row-val">¥{{ betAmount.toLocaleString() }}</span>
              </div>
              <div class="purchase-row">
                <span class="purchase-row-label">点数</span>
                <span class="purchase-row-val">{{ combinations.length }}通り</span>
              </div>
              <div class="purchase-total-row">
                <span class="purchase-row-label">合計</span>
                <span class="purchase-total">¥{{ totalAmount.toLocaleString() }}</span>
              </div>
              <div class="purchase-balance">
                所持金: <span class="text-gold">¥{{ store.balance.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <button
            class="bet-submit-btn"
            :class="{ active: canBet }"
            :disabled="!canBet"
            @click="placeBet"
          >
            {{ canBet ? `${combinations.length}通り ¥${totalAmount.toLocaleString()} 購入する` : combinations.length === 0 ? '馬を選択してください' : totalAmount > store.balance ? '残高不足' : '選択してください' }}
          </button>

          <div v-if="betMessage" class="bet-message" :class="{ success: betSuccess }">{{ betMessage }}</div>
        </div>
      </template>
    </template>

    <!-- 締切・確定メッセージ -->
    <div v-else-if="raceStatus === 'closed'" class="status-notice card mb-12">
      投票を締め切りました。結果をお待ちください。
    </div>

    <!-- ===== 出走馬テーブル (常時表示) ===== -->
    <div class="card">
      <div class="section-label mb-8">出走馬</div>
      <div class="table-scroll">
        <table class="horse-table">
          <thead>
            <tr>
              <th>枠</th><th>番</th><th class="th-name">馬名</th>
              <th>騎手</th><th>性齢</th><th>体重</th><th>人気</th><th>オッズ</th>
              <th v-if="raceResult">着順</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="h in horses" :key="h.number"
              :class="{
                'row-win1': winnerPlace(h.number) === 1,
                'row-win2': winnerPlace(h.number) === 2,
                'row-win3': winnerPlace(h.number) === 3,
              }"
            >
              <td><span class="frame-badge" :class="'frame-' + h.frame">{{ h.frame }}</span></td>
              <td><span class="horse-num">{{ h.number }}</span></td>
              <td class="td-name">{{ h.name }}</td>
              <td class="td-jockey">{{ h.jockey }}</td>
              <td>{{ h.sex }}{{ h.age }}</td>
              <td>{{ h.weight }}</td>
              <td><span class="pop-txt" :class="'pop-txt-' + (h.popularity <= 3 ? h.popularity : 'o')">{{ h.popularity }}人気</span></td>
              <td><span class="odds-val" :class="oddsClass(h.odds)">{{ h.odds.toFixed(1) }}</span></td>
              <td v-if="raceResult">
                <span v-if="winnerPlace(h.number)" class="place-chip" :class="'pc-' + winnerPlace(h.number)">
                  {{ winnerPlace(h.number) }}着
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-12">
      <button class="btn btn-secondary btn-sm" @click="router.push('/')">← スケジュールへ戻る</button>
    </div>
  </div>

  <div v-else class="card">
    レース情報が見つかりません。
    <button class="btn btn-secondary mt-12" @click="router.push('/')">← 戻る</button>
  </div>
</template>

<style scoped>
/* スイッチャー */
.switcher-wrap { background: #0d0d1a; border: 1px solid #2a2a4a; border-radius: 8px; padding: 10px 12px; }
.venue-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.venue-tab {
  padding: 5px 12px; border-radius: 6px; border: 1px solid #3a3a5a;
  background: #1a1a30; color: #aab; font-size: 0.82rem; font-weight: 700;
}
.venue-tab.active { background: #e63946; border-color: #e63946; color: #fff; }
.venue-tab:hover:not(.active) { background: #2a2a40; }

.round-tabs { display: flex; flex-wrap: wrap; gap: 4px; }
.round-tab {
  padding: 4px 8px; border-radius: 4px; border: 1px solid #2a2a4a;
  font-size: 0.75rem; font-weight: 600; background: #0d0d1a; color: #555;
}
.round-tab.active { outline: 2px solid #ffd700; outline-offset: 1px; }
.rs-open   { background: #0c180e; color: #4ade80; border-color: #166534; }
.rs-closed { background: #111; color: #555; }
.rs-result { background: #140808; color: #f87171; border-color: #7f1d1d; }
.rs-empty  { background: #0d0d1a; color: #333; }
.round-tab:hover:not(.active):not(.rs-empty) { filter: brightness(1.3); }

/* ヘッダー */
.race-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.race-venue-label { font-size: 0.82rem; color: #888; }
.race-name-big { font-size: 1.05rem; font-weight: 800; margin-bottom: 6px; }
.race-meta-row { display: flex; gap: 12px; font-size: 0.8rem; color: #888; flex-wrap: wrap; }
.section-label { font-size: 0.88rem; font-weight: 700; }
.bet-section-label { font-size: 0.75rem; color: #888; margin-bottom: 4px; }

/* ステータスバッジ */
.status-badge { font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
.sb-open   { background: #14532d; color: #4ade80; }
.sb-closed { background: #1f2937; color: #9ca3af; }
.sb-result { background: #7f1d1d; color: #f87171; }

/* 結果 */
.result-box { display: flex; gap: 16px; flex-wrap: wrap; }
.result-place { text-align: center; }
.place-label { font-size: 0.72rem; color: #888; margin-bottom: 3px; }
.place-num { font-size: 1.4rem; font-weight: 800; }
.place-name { font-size: 0.78rem; color: #ccc; }
.r-1st { color: #ffd700; }
.r-2nd { color: #c0c0c0; }
.r-3rd { color: #cd7f32; }

/* ログイン必須 */
.login-guard { text-align: center; padding: 24px; }
.login-guard-txt { color: #888; margin-bottom: 12px; }

/* タブ */
.tab-row { display: flex; flex-wrap: wrap; gap: 4px; }
.tab-btn {
  padding: 5px 11px; border-radius: 5px; border: 1px solid #3a3a5a;
  background: #1a1a30; color: #aab; font-size: 0.82rem; font-weight: 600; transition: all 0.15s;
}
.tab-btn.active { background: #e86b00; border-color: #e86b00; color: #fff; }
.method-tab.active { background: #e86b00; }
.nagashi-tab.active { background: #7c3aed; border-color: #7c3aed; }
.tab-btn:hover:not(.active) { background: #2a2a40; }

/* テーブル */
.table-scroll { overflow-x: auto; }
.horse-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.horse-table th {
  background: #1a1a36; padding: 6px 4px; text-align: center;
  border-bottom: 1px solid #2a2a4a; white-space: nowrap; font-size: 0.76rem; color: #aab;
}
.th-name { text-align: left; min-width: 90px; }
.horse-table td { padding: 5px 4px; border-bottom: 1px solid #161630; text-align: center; }
.td-name { text-align: left; font-weight: 600; white-space: nowrap; }
.td-jockey { white-space: nowrap; font-size: 0.78rem; color: #ccc; }

.row-highlighted td { background: #1e1030 !important; }
.row-win1 td { background: #1c1600 !important; }
.row-win2 td { background: #161616 !important; }
.row-win3 td { background: #120e08 !important; }

/* 枠バッジ */
.frame-badge { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 3px; font-size: 0.72rem; font-weight: 700; }
.frame-1 { background: #dc2626; color: #fff; }
.frame-2 { background: #1f2937; color: #fff; }
.frame-3 { background: #1d4ed8; color: #fff; }
.frame-4 { background: #ca8a04; color: #000; }
.frame-5 { background: #16a34a; color: #fff; }
.frame-6 { background: #ea580c; color: #fff; }
.frame-7 { background: #db2777; color: #fff; }
.frame-8 { background: #f9fafb; color: #111; }

.horse-num { font-weight: 700; }

/* 人気テキスト */
.pop-txt { font-size: 0.72rem; padding: 1px 4px; border-radius: 3px; }
.pop-txt-1 { background: #e6394622; color: #f87171; }
.pop-txt-2 { background: #e68a0022; color: #fbbf24; }
.pop-txt-3 { background: #16a34a22; color: #4ade80; }
.pop-txt-o { background: #33335566; color: #aab; }

/* オッズ */
.odds-val { font-weight: 700; }
.odds-low  { color: #f87171; }
.odds-mid  { color: #fbbf24; }
.odds-high { color: #aab; }

/* 着順チップ */
.place-chip { font-size: 0.72rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
.pc-1 { background: #92400e; color: #fbbf24; }
.pc-2 { background: #1f2937; color: #9ca3af; }
.pc-3 { background: #292524; color: #78716c; }

/* 選択ボタン */
.sel-btn {
  width: 28px; height: 28px; border-radius: 4px; border: 1px solid #3a3a5a;
  background: #1a1a30; color: #aab; font-size: 0.78rem; font-weight: 700; padding: 0;
}
.sel-btn.active        { background: #e86b00; border-color: #e86b00; color: #fff; }
.sel-axis.active       { background: #e86b00; }
.sel-axis2.active      { background: #7c3aed; border-color: #7c3aed; }
.sel-leg.active        { background: #0ea5e9; border-color: #0ea5e9; }
.sel-btn:hover:not(.active) { background: #2a2a40; }

/* 全選択 */
.allcheck-row { display: flex; align-items: center; }
.allcheck-label { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: #aab; cursor: pointer; }

/* 組み合わせ */
.combo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.combo-count { font-size: 0.9rem; font-weight: 800; color: #e86b00; }
.combo-empty { color: #555; font-size: 0.82rem; }
.combo-list { display: flex; flex-wrap: wrap; gap: 4px; }
.combo-item { background: #1a1a36; border-radius: 4px; padding: 3px 8px; font-size: 0.78rem; color: #ccc; }
.combo-more { font-size: 0.78rem; color: #888; padding: 3px 4px; }

/* 購入パネル */
.purchase-top { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
.numpad-area { flex-shrink: 0; }
.numpad-label { font-size: 0.72rem; color: #888; margin-bottom: 4px; }
.numpad-display {
  background: #1a1a36; border: 1px solid #3a3a5a; border-radius: 6px;
  padding: 6px 10px; font-size: 1.1rem; font-weight: 800; text-align: right;
  color: #ffd700; margin-bottom: 6px; min-width: 120px;
}
.numpad-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.numpad-btn {
  padding: 8px 4px; border-radius: 5px; border: 1px solid #2a2a4a;
  background: #1a1a30; color: #ddd; font-size: 0.85rem; font-weight: 700;
}
.numpad-btn:last-child { color: #f87171; }
.numpad-btn:hover { background: #2a2a40; }

.purchase-right { flex: 1; min-width: 140px; }
.purchase-row { display: flex; justify-content: space-between; font-size: 0.82rem; color: #aab; padding: 3px 0; }
.purchase-row-val { font-weight: 700; }
.purchase-total-row { display: flex; justify-content: space-between; border-top: 1px solid #2a2a4a; padding: 6px 0; margin: 4px 0; }
.purchase-total { font-size: 1.1rem; font-weight: 800; color: #e86b00; }
.purchase-balance { font-size: 0.78rem; color: #888; }

.quick-amounts { display: flex; gap: 4px; flex-wrap: wrap; }
.quick-btn {
  padding: 3px 7px; border-radius: 4px; border: 1px solid #2a2a4a;
  background: #1a1a30; color: #aab; font-size: 0.76rem;
}
.quick-btn:hover { background: #2a2a40; }

.bet-submit-btn {
  width: 100%; padding: 14px; border-radius: 8px; border: none;
  font-size: 1rem; font-weight: 800; background: #333; color: #666; cursor: not-allowed;
}
.bet-submit-btn.active { background: #e86b00; color: #fff; cursor: pointer; }
.bet-submit-btn.active:hover { background: #c55900; }

.bet-message { margin-top: 10px; padding: 10px; border-radius: 6px; background: #1a1a30; font-size: 0.85rem; color: #aab; }
.bet-message.success { background: #143020; color: #4ade80; }

.status-notice { color: #888; font-size: 0.9rem; }

.mt-6 { margin-top: 6px; }
</style>
