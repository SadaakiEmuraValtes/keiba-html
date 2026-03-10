<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { DATE_SCENARIOS, parseRaceKey, getRaceInfo, getRaceStatus, makeRaceKey } from '../data/scenarios.js'
import { generateHorses, generateResult, generateFullResult, calcRacePayouts } from '../data/masterData.js'

const route  = useRoute()
const router = useRouter()

// ---- raceKey → race情報 ----
const raceKey    = computed(() => Number(route.params.key))
const parsed     = computed(() => parseRaceKey(raceKey.value))
const raceInfo   = computed(() => {
  const { dateIdx, venueSeqIdx, round } = parsed.value
  return getRaceInfo(dateIdx, venueSeqIdx, round)
})
const horses     = computed(() => raceInfo.value ? generateHorses(raceKey.value, raceInfo.value.count) : [])
const raceStatus = computed(() => raceInfo.value ? getRaceStatus(raceInfo.value.startHour, store.virtualHour) : null)
const raceResult = computed(() => raceStatus.value === 'result' ? generateResult(raceKey.value, raceInfo.value.count, horses.value) : null)
const fullResult = computed(() => raceStatus.value === 'result' ? generateFullResult(raceKey.value, raceInfo.value.count, horses.value) : null)
const payouts    = computed(() => raceResult.value ? calcRacePayouts(raceResult.value, horses.value) : null)

function horseName(num) { return horses.value.find(h => h.number === num)?.name ?? '' }
function horseObj(num)  { return horses.value.find(h => h.number === num) }

// ---- タブ管理 ----
const activeTab = ref('card')
watch(raceKey, () => {
  activeTab.value = raceStatus.value === 'result' ? 'result' : 'card'
}, { immediate: true })

// ---- 競馬場・ラウンドスイッチャー ----
const scenario = computed(() => DATE_SCENARIOS[store.selectedDateIdx])
function venueStatus(vsi, round) {
  const info = getRaceInfo(store.selectedDateIdx, vsi, round)
  return info ? getRaceStatus(info.startHour, store.virtualHour) : null
}
function goRace(vsi, round) { router.push('/race/' + makeRaceKey(store.selectedDateIdx, vsi, round)) }
const VENUE_NAMES = { tokyo:'東京', nakayama:'中山', hanshin:'阪神', kyoto:'京都', chukyo:'中京',
                      kokura:'小倉', fukushima:'福島', niigata:'新潟', sapporo:'札幌', hakodate:'函館' }

// ---- 式別 / 方式 ----
const BET_TYPES = ['単勝','複勝','馬複','馬単','ワイド','三連複','三連単']
const METHODS   = {
  '単勝':  ['通常'], '複勝':  ['通常'],
  '馬複':  ['通常','流し','ボックス','フォーメーション'],
  '馬単':  ['通常','流し','ボックス','フォーメーション'],
  'ワイド':['通常','流し','ボックス','フォーメーション'],
  '三連複':['通常','流し','ボックス','フォーメーション'],
  '三連単':['通常','流し','ボックス','フォーメーション'],
}
const NAGASHI_TYPES = {
  '馬複':  ['軸1頭'],
  'ワイド':['軸1頭'],
  '馬単':  ['1着流し','2着流し'],
  '三連複':['軸1頭流し','軸2頭流し'],
  '三連単':['1着流し','2着流し','1-2着流し'],
}

const betType     = ref('単勝')
const method      = ref('通常')
const nagashiType = ref('')

watch(betType, (bt) => { method.value = METHODS[bt][0]; resetSelections() })
watch(method, () => {
  if (method.value === '流し') nagashiType.value = (NAGASHI_TYPES[betType.value] || ['軸1頭'])[0]
  resetSelections()
})
watch(nagashiType, resetSelections)

const normalSel    = ref([null, null, null])
const boxSel       = ref([])
const formSel      = ref([[], [], []])
const nagashiAxis  = ref(null)
const nagashiAxis2 = ref([])
const nagashiLegs  = ref([])

function resetSelections() {
  normalSel.value = [null, null, null]; boxSel.value = []; formSel.value = [[], [], []]
  nagashiAxis.value = null; nagashiAxis2.value = []; nagashiLegs.value = []
}

const posLabels = computed(() => {
  switch (betType.value) {
    case '単勝':  return ['1着']
    case '複勝':  return ['着内']
    case '馬複':  return ['馬1','馬2']
    case 'ワイド':return ['馬1','馬2']
    case '馬単':  return ['1着','2着']
    case '三連複':return ['馬1','馬2','馬3']
    case '三連単':return ['1着','2着','3着']
    default:      return []
  }
})
const posCount  = computed(() => posLabels.value.length)
const isOrdered = computed(() => ['馬単','三連単'].includes(betType.value))

const nagashiCols = computed(() => {
  const bt = betType.value, nt = nagashiType.value
  if (bt==='馬複'||bt==='ワイド') return [{label:'軸',isAxis:true},{label:'相手',isLeg:true}]
  if (bt==='馬単') {
    if (nt==='1着流し') return [{label:'1着(軸)',isAxis:true},{label:'2着(相手)',isLeg:true}]
    return [{label:'1着(相手)',isLeg:true},{label:'2着(軸)',isAxis:true}]
  }
  if (bt==='三連複') {
    if (nt==='軸1頭流し') return [{label:'軸',isAxis:true},{label:'相手',isLeg:true}]
    return [{label:'軸1',isAxis2:true},{label:'軸2',isAxis2:true},{label:'相手',isLeg:true}]
  }
  if (bt==='三連単') {
    if (nt==='1着流し') return [{label:'1着(軸)',isAxis:true},{label:'2・3着(相手)',isLeg:true}]
    if (nt==='2着流し') return [{label:'1・3着(相手)',isLeg:true},{label:'2着(軸)',isAxis:true}]
    return [{label:'1着(軸)',isAxis:true},{label:'2着(軸2)',isAxis2:true},{label:'3着(相手)',isLeg:true}]
  }
  return []
})

function toggleNormal(pos, num) { const s=[...normalSel.value]; s[pos]=s[pos]===num?null:num; normalSel.value=s }
function toggleBox(num) { const i=boxSel.value.indexOf(num); if(i>=0)boxSel.value.splice(i,1); else boxSel.value.push(num) }
function toggleForm(pos, num) {
  const arr=[...formSel.value[pos]], i=arr.indexOf(num)
  if(i>=0)arr.splice(i,1); else arr.push(num)
  const s=[...formSel.value]; s[pos]=arr; formSel.value=s
}
function toggleAxis(num) { nagashiAxis.value=nagashiAxis.value===num?null:num }
function toggleAxis2(num) { const a=[...nagashiAxis2.value],i=a.indexOf(num); if(i>=0)a.splice(i,1); else a.push(num); nagashiAxis2.value=a }
function toggleLeg(num) { const a=[...nagashiLegs.value],i=a.indexOf(num); if(i>=0)a.splice(i,1); else a.push(num); nagashiLegs.value=a }

function combN2(a){const r=[];for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)r.push([a[i],a[j]]);return r}
function combN3(a){const r=[];for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)for(let k=j+1;k<a.length;k++)r.push([a[i],a[j],a[k]]);return r}
function permN2(a){const r=[];for(let i=0;i<a.length;i++)for(let j=0;j<a.length;j++)if(i!==j)r.push([a[i],a[j]]);return r}
function permN3(a){const r=[];for(let i=0;i<a.length;i++)for(let j=0;j<a.length;j++)for(let k=0;k<a.length;k++)if(i!==j&&j!==k&&i!==k)r.push([a[i],a[j],a[k]]);return r}

const combinations = computed(() => {
  const bt=betType.value, m=method.value, nt=nagashiType.value
  if(bt==='単勝'||bt==='複勝') return normalSel.value[0]!=null?[[normalSel.value[0]]]:[]
  const is2=['馬複','ワイド','馬単'].includes(bt), ord=isOrdered.value
  if(m==='通常'){
    const sel=normalSel.value.slice(0,posCount.value)
    if(sel.some(s=>s==null)||new Set(sel).size<posCount.value) return []
    return [sel]
  }
  if(m==='ボックス'){
    const h=[...boxSel.value].sort((a,b)=>a-b)
    return is2?(ord?permN2(h):combN2(h)):(ord?permN3(h):combN3(h))
  }
  if(m==='フォーメーション'){
    const [p1,p2,p3]=formSel.value
    if(is2){
      const combos=[]
      for(const a of p1)for(const b of p2){
        if(a===b)continue
        if(ord){combos.push([a,b])}
        else{const k=[a,b].sort((x,y)=>x-y).join(',');if(!combos.some(c=>c.join(',')===k))combos.push([a,b].sort((x,y)=>x-y))}
      }
      return combos
    }else{
      const set=new Set(),combos=[]
      for(const a of p1)for(const b of p2)for(const c of p3){
        if(new Set([a,b,c]).size<3)continue
        if(ord){combos.push([a,b,c])}
        else{const k=[a,b,c].sort((x,y)=>x-y).join(',');if(!set.has(k)){set.add(k);combos.push([a,b,c].sort((x,y)=>x-y))}}
      }
      return combos
    }
  }
  if(m==='流し'){
    const axis=nagashiAxis.value, axis2=nagashiAxis2.value, legs=nagashiLegs.value
    if(bt==='馬複'||bt==='ワイド'){
      if(axis==null||legs.length===0)return []
      return legs.filter(l=>l!==axis).map(l=>[axis,l].sort((a,b)=>a-b))
    }
    if(bt==='馬単'){
      if(axis==null||legs.length===0)return []
      if(nt==='1着流し')return legs.filter(l=>l!==axis).map(l=>[axis,l])
      return legs.filter(l=>l!==axis).map(l=>[l,axis])
    }
    if(bt==='三連複'){
      if(nt==='軸1頭流し'){
        if(axis==null||legs.length<2)return []
        return combN2(legs.filter(l=>l!==axis)).map(([a,b])=>[axis,a,b].sort((x,y)=>x-y))
      }else{
        if(axis2.length<2||legs.length===0)return []
        const [ax1,ax2]=[...axis2].sort((a,b)=>a-b)
        return legs.filter(l=>l!==ax1&&l!==ax2).map(l=>[ax1,ax2,l].sort((a,b)=>a-b))
      }
    }
    if(bt==='三連単'){
      if(nt==='1着流し'){if(axis==null||legs.length<2)return [];return permN2(legs.filter(l=>l!==axis)).map(([a,b])=>[axis,a,b])}
      if(nt==='2着流し'){if(axis==null||legs.length<2)return [];return permN2(legs.filter(l=>l!==axis)).map(([a,b])=>[a,axis,b])}
      if(axis==null||axis2.length===0||legs.length===0)return []
      const combos=[]
      for(const ax2 of axis2){if(ax2===axis)continue;for(const l of legs){if(l===axis||l===ax2)continue;combos.push([axis,ax2,l])}}
      return combos
    }
  }
  return []
})

const betAmount   = ref(100)
const totalAmount = computed(() => combinations.value.length * betAmount.value)
const QUICK_AMOUNTS = [100, 300, 500, 1000, 2000, 5000]
function setAmount(v) { betAmount.value = v }

const betMessage = ref('')
const betSuccess = ref(false)
const canBet = computed(() =>
  store.isLoggedIn && combinations.value.length > 0 &&
  betAmount.value >= 100 && totalAmount.value <= store.balance && raceStatus.value === 'open'
)

function placeBet() {
  if (!canBet.value) return
  const info = raceInfo.value
  store.placeBet(raceKey.value, `${info.venueName}${info.round}R ${info.grade}`,
    `${betType.value}(${method.value})`, combinations.value.map(c=>c.join('→')), betAmount.value)
  betMessage.value = `購入完了！${betType.value} ${method.value} ${combinations.value.length}通り × ¥${betAmount.value.toLocaleString()} = ¥${totalAmount.value.toLocaleString()}`
  betSuccess.value = true; resetSelections()
  setTimeout(() => { betMessage.value = ''; betSuccess.value = false }, 5000)
}

function numpadPress(d) {
  if (d==='C'){betAmount.value=100;return}
  if (d==='00'){betAmount.value=Math.min(betAmount.value*100,999900);return}
  const s=String(betAmount.value/100)
  const next=parseInt((s==='1'&&betAmount.value===100?'':s)+d,10)*100
  if(!isNaN(next)&&next>=100)betAmount.value=Math.min(next,999900)
}

function isHorseHighlighted(num) {
  if(method.value==='通常')return normalSel.value.includes(num)
  if(method.value==='ボックス')return boxSel.value.includes(num)
  if(method.value==='フォーメーション')return formSel.value.some(a=>a.includes(num))
  if(method.value==='流し')return nagashiAxis.value===num||nagashiAxis2.value.includes(num)||nagashiLegs.value.includes(num)
  return false
}

const isAllSelected = computed(() => horses.value.every(h=>boxSel.value.includes(h.number)))
function toggleAllBox() { if(isAllSelected.value)boxSel.value=[]; else boxSel.value=horses.value.map(h=>h.number) }

function oddsClass(odds) { return odds<5?'odds-low':odds<15?'odds-mid':'odds-high' }

function placeOf(num) {
  if (!fullResult.value) return null
  const idx = fullResult.value.indexOf(num)
  return idx >= 0 ? idx + 1 : null
}

// ---- オッズタブ ----
const oddsSubTab = ref('tansho')
const ODDS_SUB_TABS = [
  { key:'tansho',    label:'単勝' },
  { key:'fukusho',   label:'複勝' },
  { key:'umaren',    label:'馬複' },
  { key:'umatan',    label:'馬単' },
  { key:'wide',      label:'ワイド' },
  { key:'sanrenpuku',label:'三連複' },
  { key:'sanrentan', label:'三連単' },
]

function comboOdds(betType, nums) {
  const o = (n) => horses.value.find(h=>h.number===n)?.odds ?? 1
  const [a,b,c] = nums
  switch(betType) {
    case 'tansho':    return +(o(a)).toFixed(1)
    case 'fukusho':   return +(Math.max(1.0, o(a)*0.38)).toFixed(1)
    case 'umaren':    return +(Math.max(1.5, Math.sqrt(o(a)*o(b))*1.8+1)).toFixed(1)
    case 'umatan':    return +(Math.max(2.0, Math.sqrt(o(a)*o(b))*2.2)).toFixed(1)
    case 'wide':      return +(Math.max(1.0, Math.sqrt(o(a)*o(b))*0.9+0.5)).toFixed(1)
    case 'sanrenpuku':return +(Math.max(3.0, Math.cbrt(o(a)*o(b)*o(c))*3+5)).toFixed(1)
    case 'sanrentan': return +(Math.max(5.0, Math.cbrt(o(a)*o(b)*o(c))*6+10)).toFixed(1)
    default: return 0
  }
}

const oddsCombos = computed(() => {
  const h = horses.value
  if (!h.length) return []
  const nums = h.map(x=>x.number)
  const sub = oddsSubTab.value
  if (sub==='tansho'||sub==='fukusho') {
    return h.slice().sort((a,b)=>a.popularity-b.popularity).map(x=>({
      combo: [x.number], label: `${x.number}番 ${x.name}`, odds: comboOdds(sub,[x.number])
    }))
  }
  if (sub==='umaren'||sub==='wide') {
    const list=[]
    for(let i=0;i<nums.length;i++)for(let j=i+1;j<nums.length;j++)
      list.push({combo:[nums[i],nums[j]],label:`${nums[i]}-${nums[j]}`,odds:comboOdds(sub,[nums[i],nums[j]])})
    return list.sort((a,b)=>a.odds-b.odds)
  }
  if (sub==='umatan') {
    const list=[]
    for(let i=0;i<nums.length;i++)for(let j=0;j<nums.length;j++)
      if(i!==j)list.push({combo:[nums[i],nums[j]],label:`${nums[i]}→${nums[j]}`,odds:comboOdds(sub,[nums[i],nums[j]])})
    return list.sort((a,b)=>a.odds-b.odds).slice(0,100)
  }
  if (sub==='sanrenpuku') {
    const list=[]
    for(let i=0;i<nums.length;i++)for(let j=i+1;j<nums.length;j++)for(let k=j+1;k<nums.length;k++)
      list.push({combo:[nums[i],nums[j],nums[k]],label:`${nums[i]}-${nums[j]}-${nums[k]}`,odds:comboOdds(sub,[nums[i],nums[j],nums[k]])})
    return list.sort((a,b)=>a.odds-b.odds).slice(0,100)
  }
  if (sub==='sanrentan') {
    const list=[]
    for(let i=0;i<nums.length;i++)for(let j=0;j<nums.length;j++)for(let k=0;k<nums.length;k++)
      if(i!==j&&j!==k&&i!==k)list.push({combo:[nums[i],nums[j],nums[k]],label:`${nums[i]}→${nums[j]}→${nums[k]}`,odds:comboOdds(sub,[nums[i],nums[j],nums[k]])})
    return list.sort((a,b)=>a.odds-b.odds).slice(0,100)
  }
  return []
})

function gradeOf(grade) {
  if (!grade) return null
  if (grade.includes('GIII')) return 'GIII'
  if (grade.includes('GII'))  return 'GII'
  if (grade.includes('GI'))   return 'GI'
  return null
}
</script>

<template>
  <div v-if="raceInfo">

    <!-- ===== スイッチャー ===== -->
    <div class="switcher-wrap mb-12">
      <div class="venue-tabs">
        <button
          v-for="(venueId, vsi) in scenario.venues" :key="vsi"
          class="venue-tab" :class="{ active: vsi === parsed.venueSeqIdx }"
          @click="goRace(vsi, parsed.round)"
        >{{ VENUE_NAMES[venueId] ?? venueId }}</button>
      </div>
      <div class="round-tabs">
        <button
          v-for="r in 12" :key="r"
          class="round-tab"
          :class="['rs-'+(venueStatus(parsed.venueSeqIdx,r)??'empty'), { active: r===parsed.round }]"
          @click="goRace(parsed.venueSeqIdx, r)"
        >{{ r }}R</button>
      </div>
    </div>

    <!-- ===== レースヘッダー ===== -->
    <div class="race-header card mb-12">
      <div class="race-header-row">
        <span class="race-venue-label">{{ raceInfo.venueName }} {{ raceInfo.round }}R</span>
        <span class="status-badge" :class="'sb-'+raceStatus">
          {{ raceStatus==='open'?'投票受付中':raceStatus==='closed'?'締切':raceStatus==='result'?'確定':'-' }}
        </span>
      </div>
      <div class="race-name-big">
        {{ raceInfo.grade }}
        <span v-if="gradeOf(raceInfo.grade)" class="grade-badge" :class="'gb-'+gradeOf(raceInfo.grade).toLowerCase()">{{ gradeOf(raceInfo.grade) }}</span>
      </div>
      <div class="race-meta-row">
        <span>{{ raceInfo.track }}</span>
        <span>発走 {{ raceInfo.time }}</span>
        <span>{{ raceInfo.count }}頭立て</span>
      </div>
    </div>

    <!-- ===== タブナビ ===== -->
    <div class="tab-nav mb-12">
      <button class="page-tab" :class="{active: activeTab==='card'}"   @click="activeTab='card'">出馬表</button>
      <button class="page-tab" :class="{active: activeTab==='odds'}"   @click="activeTab='odds'">オッズ</button>
      <button v-if="raceStatus==='open'" class="page-tab vote-tab" :class="{active: activeTab==='vote'}" @click="activeTab='vote'">投票</button>
      <button v-if="raceStatus==='result'" class="page-tab result-tab" :class="{active: activeTab==='result'}" @click="activeTab='result'">結果</button>
    </div>

    <!-- ===== 出馬表タブ ===== -->
    <div v-if="activeTab==='card'" class="card">
      <div class="section-label mb-8">出馬表</div>
      <div class="table-scroll">
        <table class="horse-table">
          <thead>
            <tr>
              <th>枠</th><th>番</th><th class="th-name">馬名</th>
              <th>騎手</th><th>性齢</th><th>体重</th><th>人気</th><th>オッズ</th>
              <th v-if="raceStatus==='result'">着順</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in horses" :key="h.number"
              :class="{
                'row-1st': placeOf(h.number)===1,
                'row-2nd': placeOf(h.number)===2,
                'row-3rd': placeOf(h.number)===3,
              }">
              <td><span class="frame-badge" :class="'frame-'+h.frame">{{ h.frame }}</span></td>
              <td><span class="horse-num" :class="h.popularity<=3?'pop-'+h.popularity:'pop-other'">{{ h.number }}</span></td>
              <td class="td-name">{{ h.name }}</td>
              <td class="td-jockey">{{ h.jockey }}</td>
              <td>{{ h.sex }}{{ h.age }}</td>
              <td>{{ h.weight }}</td>
              <td><span class="pop-txt" :class="'pop-txt-'+(h.popularity<=3?h.popularity:'o')">{{ h.popularity }}人気</span></td>
              <td><span class="odds-val" :class="oddsClass(h.odds)">{{ h.odds.toFixed(1) }}</span></td>
              <td v-if="raceStatus==='result'">
                <span v-if="placeOf(h.number)" class="place-chip" :class="'pc-'+Math.min(placeOf(h.number),4)">{{ placeOf(h.number) }}着</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== オッズタブ ===== -->
    <div v-if="activeTab==='odds'">
      <div class="odds-sub-tabs mb-8">
        <button v-for="t in ODDS_SUB_TABS" :key="t.key"
          class="odds-sub-tab" :class="{active: oddsSubTab===t.key}"
          @click="oddsSubTab=t.key">{{ t.label }}</button>
      </div>
      <div class="card">
        <div class="odds-note text-muted mb-8">
          ※ 参考オッズ（概算）。
          <template v-if="oddsSubTab==='umatan'||oddsSubTab==='sanrentan'||oddsSubTab==='sanrenpuku'">上位100点を表示。</template>
        </div>
        <div class="table-scroll">
          <table class="horse-table odds-table">
            <thead>
              <tr>
                <th>組み合わせ</th>
                <th v-if="oddsSubTab==='tansho'||oddsSubTab==='fukusho'">馬名</th>
                <th>オッズ</th>
                <th v-if="oddsSubTab==='tansho'||oddsSubTab==='fukusho'">人気</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in oddsCombos" :key="i">
                <td class="odds-combo">
                  <span v-for="(n, ni) in row.combo" :key="n">
                    <span class="frame-badge sm" :class="'frame-'+horseObj(n)?.frame">{{ n }}</span>
                    <span v-if="ni < row.combo.length-1" class="combo-sep">{{ oddsSubTab.includes('tan') ? '→' : '-' }}</span>
                  </span>
                </td>
                <td v-if="oddsSubTab==='tansho'||oddsSubTab==='fukusho'" class="td-name">{{ horseName(row.combo[0]) }}</td>
                <td><span class="odds-val" :class="oddsClass(row.odds)">{{ row.odds }}</span></td>
                <td v-if="oddsSubTab==='tansho'||oddsSubTab==='fukusho'">
                  <span class="pop-txt" :class="'pop-txt-'+(horseObj(row.combo[0])?.popularity<=3?horseObj(row.combo[0]).popularity:'o')">
                    {{ horseObj(row.combo[0])?.popularity }}人気
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===== 投票タブ ===== -->
    <div v-if="activeTab==='vote'">
      <!-- ログイン必須 -->
      <div v-if="!store.isLoggedIn" class="login-guard card mb-12">
        <p class="text-muted" style="margin-bottom:12px;">投票にはログインが必要です。</p>
        <button class="btn btn-primary" @click="router.push('/login')">ログインへ</button>
      </div>

      <template v-else>
        <!-- 式別 -->
        <div class="bet-section-label">式別</div>
        <div class="tab-row mb-8">
          <button v-for="bt in BET_TYPES" :key="bt" class="tab-btn" :class="{active:betType===bt}" @click="betType=bt">{{ bt }}</button>
        </div>
        <!-- 方式 -->
        <div v-if="METHODS[betType].length>1">
          <div class="bet-section-label">方式</div>
          <div class="tab-row mb-8">
            <button v-for="m in METHODS[betType]" :key="m" class="tab-btn method-tab" :class="{active:method===m}" @click="method=m">{{ m }}</button>
          </div>
        </div>
        <!-- 流し種別 -->
        <div v-if="method==='流し'&&NAGASHI_TYPES[betType]">
          <div class="bet-section-label">流し種別</div>
          <div class="tab-row mb-8">
            <button v-for="nt in NAGASHI_TYPES[betType]" :key="nt" class="tab-btn nagashi-tab" :class="{active:nagashiType===nt}" @click="nagashiType=nt">{{ nt }}</button>
          </div>
        </div>

        <!-- 馬選択テーブル -->
        <div class="card mb-12">
          <div class="table-scroll">
            <table class="horse-table">
              <thead>
                <tr>
                  <th>枠</th><th>番</th><th class="th-name">馬名</th><th>人気</th><th>オッズ</th>
                  <template v-if="method==='通常'"><th v-for="(lbl,pi) in posLabels" :key="pi">{{ lbl }}</th></template>
                  <template v-else-if="method==='ボックス'"><th>選択</th></template>
                  <template v-else-if="method==='フォーメーション'"><th v-for="(lbl,pi) in posLabels" :key="pi">{{ lbl }}</th></template>
                  <template v-else-if="method==='流し'"><th v-for="(col,ci) in nagashiCols" :key="ci">{{ col.label }}</th></template>
                </tr>
              </thead>
              <tbody>
                <tr v-for="horse in horses" :key="horse.number" :class="{'row-highlighted':isHorseHighlighted(horse.number)}">
                  <td><span class="frame-badge" :class="'frame-'+horse.frame">{{ horse.frame }}</span></td>
                  <td><span class="horse-num" :class="horse.popularity<=3?'pop-'+horse.popularity:'pop-other'">{{ horse.number }}</span></td>
                  <td class="td-name">{{ horse.name }}</td>
                  <td><span class="pop-txt" :class="'pop-txt-'+(horse.popularity<=3?horse.popularity:'o')">{{ horse.popularity }}人気</span></td>
                  <td><span class="odds-val" :class="oddsClass(horse.odds)">{{ horse.odds.toFixed(1) }}</span></td>
                  <template v-if="method==='通常'">
                    <td v-for="pi in posCount" :key="pi">
                      <button class="sel-btn" :class="{active:normalSel[pi-1]===horse.number}" @click="toggleNormal(pi-1,horse.number)">{{ horse.number }}</button>
                    </td>
                  </template>
                  <template v-else-if="method==='ボックス'">
                    <td><button class="sel-btn" :class="{active:boxSel.includes(horse.number)}" @click="toggleBox(horse.number)">{{ horse.number }}</button></td>
                  </template>
                  <template v-else-if="method==='フォーメーション'">
                    <td v-for="pi in posCount" :key="pi">
                      <button class="sel-btn" :class="{active:formSel[pi-1].includes(horse.number)}" @click="toggleForm(pi-1,horse.number)">{{ horse.number }}</button>
                    </td>
                  </template>
                  <template v-else-if="method==='流し'">
                    <td v-for="(col,ci) in nagashiCols" :key="ci">
                      <template v-if="col.isAxis"><button class="sel-btn sel-axis" :class="{active:nagashiAxis===horse.number}" @click="toggleAxis(horse.number)">{{ horse.number }}</button></template>
                      <template v-else-if="col.isAxis2"><button class="sel-btn sel-axis2" :class="{active:nagashiAxis2.includes(horse.number)}" @click="toggleAxis2(horse.number)">{{ horse.number }}</button></template>
                      <template v-else><button class="sel-btn sel-leg" :class="{active:nagashiLegs.includes(horse.number)}" @click="toggleLeg(horse.number)">{{ horse.number }}</button></template>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 全選択 -->
        <div v-if="method==='ボックス'" class="allcheck-row mb-8">
          <label class="allcheck-label"><input type="checkbox" :checked="isAllSelected" @change="toggleAllBox"> 全頭選択</label>
        </div>

        <!-- 組み合わせ -->
        <div class="combo-section card mb-12">
          <div class="combo-header">
            <span class="section-label">組み合わせ</span>
            <span class="combo-count">{{ combinations.length }}通り</span>
          </div>
          <div v-if="combinations.length===0" class="combo-empty">馬を選択してください</div>
          <div v-else class="combo-list">
            <span v-for="(combo,i) in combinations.slice(0,60)" :key="i" class="combo-item">{{ combo.join('→') }}</span>
            <span v-if="combinations.length>60" class="text-muted">他{{ combinations.length-60 }}通り…</span>
          </div>
        </div>

        <!-- 購入パネル -->
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
              <div class="purchase-row"><span>1点</span><span>¥{{ betAmount.toLocaleString() }}</span></div>
              <div class="purchase-row"><span>点数</span><span>{{ combinations.length }}通り</span></div>
              <div class="purchase-total-row"><span>合計</span><span class="purchase-total">¥{{ totalAmount.toLocaleString() }}</span></div>
              <div class="purchase-balance">所持金: <span class="text-gold">¥{{ store.balance.toLocaleString() }}</span></div>
            </div>
          </div>
          <button class="bet-submit-btn" :class="{active:canBet}" :disabled="!canBet" @click="placeBet">
            {{ canBet?`${combinations.length}通り ¥${totalAmount.toLocaleString()} 購入する`:combinations.length===0?'馬を選択してください':totalAmount>store.balance?'残高不足':'選択してください' }}
          </button>
          <div v-if="betMessage" class="bet-message" :class="{success:betSuccess}">{{ betMessage }}</div>
        </div>
      </template>
    </div>

    <!-- ===== 結果タブ ===== -->
    <div v-if="activeTab==='result'&&raceResult">

      <!-- 全着順 -->
      <div class="card mb-12">
        <div class="section-label mb-8">全着順</div>
        <div class="table-scroll">
          <table class="horse-table">
            <thead><tr><th>着順</th><th>枠</th><th>番</th><th class="th-name">馬名</th><th>騎手</th><th>人気</th><th>オッズ</th></tr></thead>
            <tbody>
              <tr v-for="(num, idx) in fullResult" :key="num"
                :class="{'row-1st':idx===0,'row-2nd':idx===1,'row-3rd':idx===2}">
                <td>
                  <span class="place-chip" :class="idx<3?'pc-'+(idx+1):'pc-4'">{{ idx+1 }}着</span>
                </td>
                <td><span class="frame-badge" :class="'frame-'+horseObj(num)?.frame">{{ horseObj(num)?.frame }}</span></td>
                <td><span class="horse-num" :class="horseObj(num)?.popularity<=3?'pop-'+horseObj(num).popularity:'pop-other'">{{ num }}</span></td>
                <td class="td-name">{{ horseName(num) }}</td>
                <td class="td-jockey">{{ horseObj(num)?.jockey }}</td>
                <td><span class="pop-txt" :class="'pop-txt-'+(horseObj(num)?.popularity<=3?horseObj(num).popularity:'o')">{{ horseObj(num)?.popularity }}人気</span></td>
                <td><span class="odds-val" :class="oddsClass(horseObj(num)?.odds)">{{ horseObj(num)?.odds?.toFixed(1) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 払戻金 -->
      <div class="card">
        <div class="section-label mb-8">払戻金（100円あたり）</div>
        <table class="payout-table">
          <tbody>
            <tr>
              <td class="pt-type">単勝</td>
              <td class="pt-combo">{{ payouts.tansho.combo }}番</td>
              <td class="pt-payout">¥{{ payouts.tansho.payout.toLocaleString() }}</td>
            </tr>
            <tr v-for="(row, i) in payouts.fukusho" :key="'fuku'+i">
              <td class="pt-type">{{ i===0?'複勝':'' }}</td>
              <td class="pt-combo">{{ row.combo }}番</td>
              <td class="pt-payout">¥{{ row.payout.toLocaleString() }}</td>
            </tr>
            <tr>
              <td class="pt-type">馬複</td>
              <td class="pt-combo">{{ payouts.umaren.combo }}</td>
              <td class="pt-payout">¥{{ payouts.umaren.payout.toLocaleString() }}</td>
            </tr>
            <tr>
              <td class="pt-type">馬単</td>
              <td class="pt-combo">{{ payouts.umatan.combo }}</td>
              <td class="pt-payout">¥{{ payouts.umatan.payout.toLocaleString() }}</td>
            </tr>
            <tr v-for="(row, i) in payouts.wide" :key="'wide'+i">
              <td class="pt-type">{{ i===0?'ワイド':'' }}</td>
              <td class="pt-combo">{{ row.combo }}</td>
              <td class="pt-payout">¥{{ row.payout.toLocaleString() }}</td>
            </tr>
            <tr>
              <td class="pt-type">三連複</td>
              <td class="pt-combo">{{ payouts.sanrenpuku.combo }}</td>
              <td class="pt-payout">¥{{ payouts.sanrenpuku.payout.toLocaleString() }}</td>
            </tr>
            <tr>
              <td class="pt-type">三連単</td>
              <td class="pt-combo">{{ payouts.sanrentan.combo }}</td>
              <td class="pt-payout">¥{{ payouts.sanrentan.payout.toLocaleString() }}</td>
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
.switcher-wrap { background: #091420; border: 1px solid #1e3a5c; border-radius: 8px; padding: 10px 12px; }
.venue-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.venue-tab { padding: 5px 12px; border-radius: 6px; border: 1px solid #1e3a5c; background: #112240; color: #7ab898; font-size: 0.82rem; font-weight: 700; }
.venue-tab.active { background: #22c55e; border-color: #22c55e; color: #fff; }
.venue-tab:hover:not(.active) { background: #163048; }
.round-tabs { display: flex; flex-wrap: wrap; gap: 4px; }
.round-tab { padding: 4px 8px; border-radius: 4px; border: 1px solid #1e3a5c; font-size: 0.75rem; font-weight: 600; background: #091420; color: #3a5a50; }
.round-tab.active { outline: 2px solid #fbbf24; outline-offset: 1px; }
.rs-open   { background: #0a2018; color: #4ade80; border-color: #166534; }
.rs-closed { background: #0d1b2a; color: #3a5a50; }
.rs-result { background: #091a28; color: #38bdf8; border-color: #1e4060; }
.rs-empty  { background: #091420; color: #1e3a5c; }
.round-tab:hover:not(.active):not(.rs-empty) { filter: brightness(1.3); }

/* ヘッダー */
.race-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.race-venue-label { font-size: 0.82rem; color: #5a8070; }
.race-name-big { font-size: 1.05rem; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
.race-meta-row { display: flex; gap: 12px; font-size: 0.8rem; color: #5a8070; flex-wrap: wrap; }
.section-label { font-size: 0.88rem; font-weight: 700; }
.bet-section-label { font-size: 0.75rem; color: #5a8070; margin-bottom: 4px; }

/* ステータス */
.status-badge { font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
.sb-open   { background: #0d3320; color: #4ade80; border: 1px solid #166534; }
.sb-closed { background: #163048; color: #64748b; }
.sb-result { background: #0a2438; color: #38bdf8; }

/* グレードバッジ */
.grade-badge { font-size: 0.72rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
.gb-gi   { background: #92400e; color: #fbbf24; }
.gb-gii  { background: #334155; color: #94a3b8; }
.gb-giii { background: #431407; color: #fb923c; }

/* タブナビ */
.tab-nav { display: flex; gap: 4px; border-bottom: 2px solid #1e3a5c; padding-bottom: 0; }
.page-tab {
  padding: 8px 16px; border-radius: 6px 6px 0 0; border: 1px solid transparent;
  background: transparent; color: #5a8070; font-size: 0.85rem; font-weight: 700; border-bottom: none;
}
.page-tab.active { background: #112240; border-color: #1e3a5c; color: #4ade80; border-bottom-color: #112240; margin-bottom: -2px; }
.page-tab:hover:not(.active) { color: #7ab898; }
.vote-tab.active   { color: #22c55e; }
.result-tab.active { color: #38bdf8; }

/* テーブル */
.table-scroll { overflow-x: auto; }
.horse-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.horse-table th { background: #163048; padding: 6px 4px; text-align: center; border-bottom: 1px solid #1e3a5c; white-space: nowrap; font-size: 0.76rem; color: #7ab898; }
.th-name { text-align: left; min-width: 90px; }
.horse-table td { padding: 5px 4px; border-bottom: 1px solid #112240; text-align: center; }
.td-name { text-align: left; font-weight: 600; white-space: nowrap; }
.td-jockey { white-space: nowrap; font-size: 0.78rem; color: #7ab898; }
.row-highlighted td { background: #0f2a3a !important; }
.row-1st td { background: #1e1600 !important; }
.row-2nd td { background: #131820 !important; }
.row-3rd td { background: #120e08 !important; }

/* 枠バッジ (JRA標準色) */
.frame-badge { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 3px; font-size: 0.72rem; font-weight: 700; }
.frame-badge.sm { width: 18px; height: 18px; font-size: 0.68rem; }
.frame-1 { background: #f8f8f8; color: #111; border: 1px solid #ccc; }
.frame-2 { background: #222; color: #fff; }
.frame-3 { background: #cc2200; color: #fff; }
.frame-4 { background: #0044bb; color: #fff; }
.frame-5 { background: #ddaa00; color: #111; }
.frame-6 { background: #117733; color: #fff; }
.frame-7 { background: #cc5500; color: #fff; }
.frame-8 { background: #cc2266; color: #fff; }

/* 人気テキスト */
.pop-txt { font-size: 0.72rem; padding: 1px 4px; border-radius: 3px; }
.pop-txt-1 { background: #d9770622; color: #fbbf24; }
.pop-txt-2 { background: #47556922; color: #94a3b8; }
.pop-txt-3 { background: #78350f22; color: #fb923c; }
.pop-txt-o { background: #1e3a5c44; color: #5a8070; }

/* オッズ */
.odds-val { font-weight: 700; }
.odds-low  { color: #4ade80; }
.odds-mid  { color: #fbbf24; }
.odds-high { color: #5a8070; }

/* 着順チップ */
.place-chip { font-size: 0.72rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
.pc-1 { background: #92400e; color: #fbbf24; }
.pc-2 { background: #334155; color: #94a3b8; }
.pc-3 { background: #431407; color: #fb923c; }
.pc-4 { background: #1e3a5c; color: #5a8070; }

/* ログインガード */
.login-guard { text-align: center; padding: 24px; }

/* 式別タブ */
.tab-row { display: flex; flex-wrap: wrap; gap: 4px; }
.tab-btn {
  padding: 5px 11px; border-radius: 5px; border: 1px solid #1e3a5c;
  background: #112240; color: #7ab898; font-size: 0.82rem; font-weight: 600;
}
.tab-btn.active { background: #22c55e; border-color: #22c55e; color: #fff; }
.method-tab.active { background: #22c55e; }
.nagashi-tab.active { background: #2563eb; border-color: #2563eb; }
.tab-btn:hover:not(.active) { background: #163048; }

/* 選択ボタン */
.sel-btn { width: 28px; height: 28px; border-radius: 4px; border: 1px solid #1e3a5c; background: #112240; color: #7ab898; font-size: 0.78rem; font-weight: 700; padding: 0; }
.sel-btn.active    { background: #22c55e; border-color: #22c55e; color: #fff; }
.sel-axis.active   { background: #22c55e; }
.sel-axis2.active  { background: #2563eb; border-color: #2563eb; }
.sel-leg.active    { background: #0e7490; border-color: #0e7490; }
.sel-btn:hover:not(.active) { background: #163048; }

/* 全選択 */
.allcheck-row { display: flex; align-items: center; }
.allcheck-label { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: #7ab898; cursor: pointer; }

/* 組み合わせ */
.combo-section { }
.combo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.combo-count { font-size: 0.9rem; font-weight: 800; color: #22c55e; }
.combo-empty { color: #3a5a50; font-size: 0.82rem; }
.combo-list { display: flex; flex-wrap: wrap; gap: 4px; }
.combo-item { background: #163048; border-radius: 4px; padding: 3px 8px; font-size: 0.78rem; color: #7ab898; }

/* 購入パネル */
.purchase-top { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
.numpad-area { flex-shrink: 0; }
.numpad-label { font-size: 0.72rem; color: #5a8070; margin-bottom: 4px; }
.numpad-display { background: #163048; border: 1px solid #2a4d72; border-radius: 6px; padding: 6px 10px; font-size: 1.1rem; font-weight: 800; text-align: right; color: #fbbf24; margin-bottom: 6px; min-width: 120px; }
.numpad-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 4px; }
.numpad-btn { padding: 8px 4px; border-radius: 5px; border: 1px solid #1e3a5c; background: #112240; color: #daeee4; font-size: 0.85rem; font-weight: 700; }
.numpad-btn:last-child { color: #fb923c; }
.numpad-btn:hover { background: #163048; }
.purchase-right { flex: 1; min-width: 140px; }
.purchase-row { display: flex; justify-content: space-between; font-size: 0.82rem; color: #7ab898; padding: 3px 0; }
.purchase-total-row { display: flex; justify-content: space-between; border-top: 1px solid #1e3a5c; padding: 6px 0; margin: 4px 0; }
.purchase-total { font-size: 1.1rem; font-weight: 800; color: #22c55e; }
.purchase-balance { font-size: 0.78rem; color: #5a8070; }
.quick-amounts { display: flex; gap: 4px; flex-wrap: wrap; }
.quick-btn { padding: 3px 7px; border-radius: 4px; border: 1px solid #1e3a5c; background: #112240; color: #7ab898; font-size: 0.76rem; }
.quick-btn:hover { background: #163048; }
.bet-submit-btn { width: 100%; padding: 14px; border-radius: 8px; border: none; font-size: 1rem; font-weight: 800; background: #1e3a5c; color: #3a5a50; cursor: not-allowed; }
.bet-submit-btn.active { background: #22c55e; color: #fff; cursor: pointer; }
.bet-submit-btn.active:hover { background: #16a34a; }
.bet-message { margin-top: 10px; padding: 10px; border-radius: 6px; background: #112240; font-size: 0.85rem; color: #7ab898; }
.bet-message.success { background: #0d3320; color: #4ade80; }

/* オッズタブ */
.odds-sub-tabs { display: flex; flex-wrap: wrap; gap: 4px; }
.odds-sub-tab { padding: 5px 11px; border-radius: 5px; border: 1px solid #1e3a5c; background: #112240; color: #7ab898; font-size: 0.82rem; font-weight: 600; }
.odds-sub-tab.active { background: #0e7490; border-color: #0e7490; color: #fff; }
.odds-sub-tab:hover:not(.active) { background: #163048; }
.odds-note { font-size: 0.72rem; }
.odds-combo { text-align: left; }
.combo-sep { color: #3a5a50; margin: 0 1px; font-size: 0.72rem; }

/* 払戻テーブル */
.payout-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.payout-table tr { border-bottom: 1px solid #1e3a5c; }
.payout-table td { padding: 8px 6px; }
.pt-type { color: #7ab898; font-weight: 700; width: 60px; white-space: nowrap; }
.pt-combo { font-family: monospace; font-size: 0.95rem; }
.pt-payout { text-align: right; font-weight: 800; color: #4ade80; font-size: 1rem; }

.mt-6 { margin-top: 6px; }
</style>
