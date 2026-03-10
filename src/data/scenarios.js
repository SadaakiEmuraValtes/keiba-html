// ===== JRA競馬場 =====
export const JRA_VENUES = {
  tokyo:    { id: 'tokyo',    name: '東京',  surface: '芝/ダート' },
  nakayama: { id: 'nakayama', name: '中山',  surface: '芝/ダート' },
  hanshin:  { id: 'hanshin',  name: '阪神',  surface: '芝/ダート' },
  kyoto:    { id: 'kyoto',    name: '京都',  surface: '芝/ダート' },
  chukyo:   { id: 'chukyo',   name: '中京',  surface: '芝/ダート' },
  kokura:   { id: 'kokura',   name: '小倉',  surface: '芝/ダート' },
  fukushima:{ id: 'fukushima',name: '福島',  surface: '芝/ダート' },
  niigata:  { id: 'niigata',  name: '新潟',  surface: '芝/ダート' },
  sapporo:  { id: 'sapporo',  name: '札幌',  surface: '芝/ダート' },
  hakodate: { id: 'hakodate', name: '函館',  surface: '芝/ダート' },
}

// ===== ラウンドごとのレース情報 (共通パターン) =====
// venue ごとに track を微調整する venueTrack で上書き
const BASE_ROUNDS = [
  { round:1,  startHour:10, time:'10:05', track:'ダート1200m', grade:'2歳未勝利',     count:9  },
  { round:2,  startHour:10, time:'10:45', track:'芝1400m',     grade:'3歳未勝利',     count:10 },
  { round:3,  startHour:11, time:'11:15', track:'芝1600m',     grade:'3歳1勝クラス',  count:11 },
  { round:4,  startHour:11, time:'11:45', track:'ダート1800m', grade:'3歳以上1勝クラス',count:12},
  { round:5,  startHour:12, time:'12:15', track:'芝2000m',     grade:'3歳以上2勝クラス',count:13},
  { round:6,  startHour:12, time:'12:45', track:'ダート1600m', grade:'3歳以上2勝クラス',count:14},
  { round:7,  startHour:13, time:'13:10', track:'芝1400m',     grade:'3歳以上3勝クラス',count:14},
  { round:8,  startHour:13, time:'13:45', track:'芝1800m',     grade:'オープン',      count:15 },
  { round:9,  startHour:14, time:'14:10', track:'ダート2100m', grade:'オープン',      count:15 },
  { round:10, startHour:14, time:'14:45', track:'芝1600m',     grade:'GIII',          count:16 },
  { round:11, startHour:15, time:'15:10', track:'芝2000m',     grade:'GII',           count:16 },
  { round:12, startHour:15, time:'15:40', track:'芝2400m',     grade:'GI',            count:18 },
]

// 競馬場ごとのトラック差分 (roundIdx 0-11)
const VENUE_TRACK_OVERRIDE = {
  tokyo:    { 1:'芝1400m', 3:'ダート1600m', 6:'ダート2000m', 9:'芝1600m', 11:'芝2000m' },
  nakayama: { 0:'ダート1200m', 4:'芝2200m', 7:'芝1800m', 11:'芝2500m' },
  hanshin:  { 1:'芝1600m', 4:'芝2400m', 9:'芝1400m', 10:'芝2000m' },
  kyoto:    { 1:'芝1400m', 4:'芝1600m', 9:'芝1800m', 11:'芝3000m' },
  chukyo:   { 1:'芝1200m', 6:'ダート1800m', 9:'芝2000m', 11:'芝1400m' },
  kokura:   { 1:'芝1200m', 4:'芝1800m', 9:'芝2000m' },
  fukushima:{ 4:'芝1200m', 9:'芝1800m' },
  niigata:  { 1:'芝1200m', 4:'芝2000m', 9:'芝1600m', 11:'芝2400m' },
  sapporo:  { 1:'芝1500m', 4:'芝2000m', 11:'芝2600m' },
  hakodate: { 1:'芝1200m', 4:'芝2000m' },
}

// 競馬場ごとのグレード上書き (重賞レース名)
const VENUE_GRADE_OVERRIDE = {
  tokyo:    { 9:'フェブラリーS（GI）', 10:'東京新聞杯（GIII）', 11:'共同通信杯（GIII）', 12:'東京優駿（日本ダービー）（GI）' },
  nakayama: { 10:'中山記念（GII）', 11:'中山金杯（GIII）', 12:'有馬記念（GI）' },
  hanshin:  { 10:'阪神JF（GI）', 11:'チャンピオンズC（GI）', 12:'宝塚記念（GI）' },
  kyoto:    { 10:'京都記念（GII）', 11:'愛知杯（GIII）', 12:'天皇賞(春)（GI）' },
  chukyo:   { 10:'中日新聞杯（GIII）', 11:'愛知杯（GIII）', 12:'金鯱賞（GII）' },
  kokura:   { 10:'小倉記念（GIII）', 11:'北九州記念（GIII）', 12:'小倉大賞典（GIII）' },
  fukushima:{ 10:'福島記念（GIII）', 11:'福島牝馬S（GIII）', 12:'ラジオNIKKEI賞（GIII）' },
  niigata:  { 10:'アイビスSD（GIII）', 11:'関屋記念（GIII）', 12:'新潟記念（GIII）' },
  sapporo:  { 10:'札幌記念（GII）', 11:'クイーンS（GIII）', 12:'キーンランドC（GIII）' },
  hakodate: { 10:'函館スプリントS（GIII）', 11:'函館2歳S（GIII）', 12:'函館記念（GIII）' },
}

function buildRounds(venueId) {
  const tOver = VENUE_TRACK_OVERRIDE[venueId] || {}
  const gOver = VENUE_GRADE_OVERRIDE[venueId] || {}
  return BASE_ROUNDS.map((r, i) => ({
    ...r,
    track: tOver[i] ?? r.track,
    grade: gOver[i] ?? r.grade,
  }))
}

// ===== 5 日程シナリオ =====
export const DATE_SCENARIOS = [
  {
    id: 0,
    dateLabel: '2026/03/07（土）',
    venues: ['tokyo', 'nakayama', 'hanshin'],
  },
  {
    id: 1,
    dateLabel: '2026/03/08（日）',
    venues: ['tokyo', 'nakayama', 'hanshin'],
  },
  {
    id: 2,
    dateLabel: '2026/03/14（土）',
    venues: ['hanshin', 'chukyo', 'niigata'],
  },
  {
    id: 3,
    dateLabel: '2026/03/15（日）',
    venues: ['hanshin', 'chukyo', 'fukushima'],
  },
  {
    id: 4,
    dateLabel: '2026/03/21（土）',
    venues: ['tokyo', 'nakayama', 'chukyo'],
  },
]

// ===== raceKey エンコード =====
// raceKey = dateIdx * 100000 + venueSeqIdx * 1000 + round
export function makeRaceKey(dateIdx, venueSeqIdx, round) {
  return dateIdx * 100000 + venueSeqIdx * 1000 + round
}

export function parseRaceKey(key) {
  const round       = key % 1000
  const venueSeqIdx = Math.floor((key % 100000) / 1000)
  const dateIdx     = Math.floor(key / 100000)
  return { dateIdx, venueSeqIdx, round }
}

// ===== レース情報取得 =====
export function getRaceInfo(dateIdx, venueSeqIdx, round) {
  const scenario = DATE_SCENARIOS[dateIdx]
  if (!scenario) return null
  const venueId = scenario.venues[venueSeqIdx]
  if (!venueId) return null
  const venue = JRA_VENUES[venueId]
  const rounds = buildRounds(venueId)
  const roundInfo = rounds.find(r => r.round === round)
  if (!roundInfo) return null
  const raceKey = makeRaceKey(dateIdx, venueSeqIdx, round)
  return {
    raceKey,
    dateIdx, venueSeqIdx,
    venueId, venueName: venue.name,
    round,
    ...roundInfo,
    label: `${venue.name}${round}R`,
  }
}

// 指定日の全レース情報
export function getScenarioRaces(dateIdx) {
  const scenario = DATE_SCENARIOS[dateIdx]
  if (!scenario) return []
  return scenario.venues.flatMap((venueId, seqIdx) =>
    Array.from({ length: 12 }, (_, i) => getRaceInfo(dateIdx, seqIdx, i + 1))
  )
}

// 仮想時刻に基づくレースステータス
export function getRaceStatus(startHour, virtualHour) {
  if (virtualHour > startHour)  return 'result'
  if (virtualHour === startHour) return 'closed'
  return 'open'
}
