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
  { round:1,  startHour:10, time:'10:05', track:'ダート1200m', grade:'2歳未勝利',      count:9  },
  { round:2,  startHour:10, time:'10:45', track:'芝1400m',     grade:'3歳未勝利',      count:10 },
  { round:3,  startHour:11, time:'11:15', track:'芝1600m',     grade:'3歳1勝クラス',   count:11 },
  { round:4,  startHour:11, time:'11:45', track:'ダート1800m', grade:'3歳以上1勝クラス',count:12 },
  { round:5,  startHour:12, time:'12:15', track:'芝2000m',     grade:'3歳以上2勝クラス',count:13 },
  { round:6,  startHour:12, time:'12:45', track:'ダート1600m', grade:'3歳以上2勝クラス',count:14 },
  { round:7,  startHour:13, time:'13:10', track:'芝1400m',     grade:'3歳以上3勝クラス',count:14 },
  { round:8,  startHour:13, time:'13:45', track:'芝1800m',     grade:'オープン',       count:15 },
  { round:9,  startHour:14, time:'14:10', track:'ダート2100m', grade:'オープン',       count:15 },
  { round:10, startHour:14, time:'14:45', track:'芝1600m',     grade:'オープン',       count:16 },
  { round:11, startHour:15, time:'15:10', track:'芝2000m',     grade:'オープン',       count:16 },
  { round:12, startHour:15, time:'15:40', track:'芝2400m',     grade:'オープン',       count:18 },
]

// 競馬場ごとのトラック差分 (roundIdx 0-11)
const VENUE_TRACK_OVERRIDE = {
  tokyo:    { 1:'芝1400m', 3:'ダート1600m', 6:'ダート2000m', 9:'芝1600m', 10:'ダート1600m' },
  nakayama: { 0:'ダート1200m', 4:'芝2200m', 7:'芝1800m', 9:'芝2000m', 10:'芝1800m' },
  hanshin:  { 1:'芝1600m', 4:'芝2400m', 9:'芝1600m', 10:'芝3000m' },
  kyoto:    { 1:'芝1400m', 4:'芝1600m', 9:'芝1800m', 10:'芝3200m' },
  chukyo:   { 1:'芝1200m', 6:'ダート1800m', 9:'芝2000m' },
  kokura:   { 1:'芝1200m', 4:'芝1800m', 9:'芝1800m' },
  fukushima:{ 4:'芝1200m', 9:'芝2000m' },
  niigata:  { 1:'芝1200m', 4:'芝2000m', 9:'芝1600m' },
  sapporo:  { 1:'芝1500m', 4:'芝2000m', 9:'芝2000m' },
  hakodate: { 1:'芝1200m', 4:'芝2000m', 9:'芝1800m' },
}

// 競馬場ごとのグレード上書き (重賞レース名) ─ 各競馬場 最大2グレードまで
// インデックスは BASE_ROUNDS の 0-based index (index 9 = round 10, index 10 = round 11)
const VENUE_GRADE_OVERRIDE = {
  tokyo:    { 9:'東京新聞杯（GIII）',    10:'フェブラリーS（GI）' },
  nakayama: { 9:'弥生賞（GII）',         10:'中山記念（GII）' },
  hanshin:  { 9:'チューリップ賞（GII）', 10:'阪神大賞典（GII）' },
  kyoto:    { 9:'きさらぎ賞（GIII）',    10:'天皇賞（春）（GI）' },
  chukyo:   { 10:'金鯱賞（GII）' },
  kokura:   { 9:'小倉大賞典（GIII）' },
  fukushima:{ 9:'福島記念（GIII）' },
  niigata:  { 9:'関屋記念（GIII）' },
  sapporo:  { 9:'札幌記念（GII）' },
  hakodate: { 9:'函館記念（GIII）' },
}

// ===== WIN5 対象レース (各日程の重賞5レース、最終レース=最高格GI) =====
// [venueSeqIdx, round] の5ペア ─ すべて round 10 or 11 の重賞
const WIN5_RACE_DEFS = [
  [[0,10],[1,10],[2,10],[1,11],[0,11]],  // date 0: 東京新聞杯/チューリップ賞/小倉大賞典/阪神大賞典/フェブラリーS
  [[0,10],[1,10],[2,10],[1,11],[0,11]],  // date 1: 同上
  [[0,10],[1,10],[0,11],[2,11],[1,11]],  // date 2: 弥生賞/きさらぎ賞/中山記念/金鯱賞/天皇賞春
  [[0,10],[1,10],[2,10],[0,11],[1,11]],  // date 3: 弥生賞/きさらぎ賞/関屋記念/中山記念/天皇賞春
  [[0,10],[1,10],[2,10],[1,11],[0,11]],  // date 4: 東京新聞杯/チューリップ賞/福島記念/阪神大賞典/フェブラリーS
]

export function getWin5RaceKeys(dateIdx) {
  const defs = WIN5_RACE_DEFS[dateIdx]
  if (!defs) return []
  return defs.map(([vsi, round]) => makeRaceKey(dateIdx, vsi, round))
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
    venues: ['tokyo', 'hanshin', 'kokura'],
  },
  {
    id: 1,
    dateLabel: '2026/03/08（日）',
    venues: ['tokyo', 'hanshin', 'kokura'],
  },
  {
    id: 2,
    dateLabel: '2026/03/14（土）',
    venues: ['nakayama', 'kyoto', 'chukyo'],
  },
  {
    id: 3,
    dateLabel: '2026/03/15（日）',
    venues: ['nakayama', 'kyoto', 'niigata'],
  },
  {
    id: 4,
    dateLabel: '2026/03/21（土）',
    venues: ['tokyo', 'hanshin', 'fukushima'],
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
