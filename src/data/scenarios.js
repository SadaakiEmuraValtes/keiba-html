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
  chukyo:   { 1:'芝1200m', 6:'ダート1800m', 9:'芝2000m', 10:'芝1200m' },
  kokura:   { 1:'芝1200m', 4:'芝1800m', 9:'芝1800m' },
  fukushima:{ 4:'芝1200m', 9:'芝2000m' },
  niigata:  { 1:'芝1200m', 4:'芝2000m', 9:'芝1600m' },
  sapporo:  { 1:'芝1500m', 4:'芝2000m', 9:'芝2000m' },
  hakodate: { 1:'芝1200m', 4:'芝2000m', 9:'芝1800m' },
}

// ===== 5日程シナリオ（2025年の話題レース日程）=====
// gradeOverride: { venueId: { roundIndex(0-based): gradeString } }
//   index 9 = round10, index 10 = round11
// trackOverride: { venueId: { roundIndex: trackString } } ─ VENUE_TRACK_OVERRIDEに追加上書き
// win5: [[venueSeqIdx, roundNum], ...] 5要素

export const DATE_SCENARIOS = [
  {
    // 2025/02/23 フェブルアリー賞（GI）デー ─ 実際のフェブラリーS開催日をモチーフ
    id: 0,
    dateLabel: '2025/02/23（日）',
    venues: ['tokyo', 'hanshin', 'kokura'],
    gradeOverride: {
      tokyo:   { 9: '江東新報杯（GIII）',  10: 'フェブルアリー賞（GI）' },
      hanshin: { 9: 'クローバー賞（GII）',  10: '難波大走典（GII）' },
      kokura:  { 9: '城下大賞典（GIII）' },
    },
    trackOverride: {
      tokyo: { 10: 'ダート1600m' }, // フェブルアリー賞はダート
    },
    // WIN5: 城下大賞典→クローバー賞→江東新報杯→難波大走典→フェブルアリー賞（GI）
    win5: [[2,10],[1,10],[0,10],[1,11],[0,11]],
  },
  {
    // 2025/03/23 高松堂記念（GI）デー ─ 実際の高松宮記念開催日をモチーフ
    id: 1,
    dateLabel: '2025/03/23（日）',
    venues: ['chukyo', 'hanshin', 'nakayama'],
    gradeOverride: {
      chukyo:   { 9: '金魚賞（GII）',   10: '高松堂記念（GI）' },
      hanshin:  { 9: 'クローバー賞（GII）', 10: '難波大走典（GII）' },
      nakayama: { 9: '春告賞（GII）',   10: '春陽S（GII）' },
    },
    trackOverride: {
      chukyo: { 10: '芝1200m' }, // 高松堂記念はスプリント
    },
    // WIN5: 金魚賞→クローバー賞→春告賞→春陽S→高松堂記念（GI）
    win5: [[0,10],[1,10],[2,10],[2,11],[0,11]],
  },
  {
    // 2025/04/27 大帝賞（春）（GI）デー ─ 実際の天皇賞（春）開催日をモチーフ
    id: 2,
    dateLabel: '2025/04/27（日）',
    venues: ['kyoto', 'tokyo', 'fukushima'],
    gradeOverride: {
      kyoto:    { 9: '如月賞（GIII）',   10: '大帝賞（春）（GI）' },
      tokyo:    { 9: '江東新報杯（GIII）', 10: '翠嵐S（GII）' },
      fukushima:{ 9: '磐梯特別（GIII）' },
    },
    trackOverride: {
      kyoto: { 10: '芝3200m' }, // 大帝賞（春）は長距離
    },
    // WIN5: 江東新報杯→磐梯特別→如月賞→翠嵐S→大帝賞（春）（GI）
    win5: [[1,10],[2,10],[0,10],[1,11],[0,11]],
  },
  {
    // 2025/05/25 東洋ダービー（GI）デー ─ 実際の日本ダービー開催日をモチーフ
    id: 3,
    dateLabel: '2025/05/25（日）',
    venues: ['tokyo', 'kyoto', 'niigata'],
    gradeOverride: {
      tokyo:  { 9: '京浜賞（GII）',   10: '東洋ダービー（GI）' },
      kyoto:  { 9: '如月賞（GIII）',  10: '翠嵐S（GII）' },
      niigata:{ 9: '越後記念（GIII）' },
    },
    trackOverride: {
      tokyo: { 10: '芝2400m' }, // 東洋ダービーは芝クラシック
    },
    // WIN5: 如月賞→越後記念→京浜賞→翠嵐S→東洋ダービー（GI）
    win5: [[1,10],[2,10],[0,10],[1,11],[0,11]],
  },
  {
    // 2025/06/29 宝鐘記念（GI）デー ─ 実際の宝塚記念開催日をモチーフ
    id: 4,
    dateLabel: '2025/06/29（日）',
    venues: ['hanshin', 'tokyo', 'hakodate'],
    gradeOverride: {
      hanshin: { 9: '鳴門賞（GII）',    10: '宝鐘記念（GI）' },
      tokyo:   { 9: '安田杯（GI）',     10: '翠嵐S（GII）' },
      hakodate:{ 9: '函館快走S（GIII）' },
    },
    trackOverride: {
      hanshin: { 10: '芝2200m' }, // 宝鐘記念は芝中距離
      tokyo:   { 9:  '芝1600m' }, // 安田杯はマイル
    },
    // WIN5: 函館快走S→鳴門賞→安田杯（GI）→翠嵐S→宝鐘記念（GI）
    win5: [[2,10],[0,10],[1,10],[1,11],[0,11]],
  },
]

export function getWin5RaceKeys(dateIdx) {
  const scenario = DATE_SCENARIOS[dateIdx]
  if (!scenario?.win5) return []
  return scenario.win5.map(([vsi, round]) => makeRaceKey(dateIdx, vsi, round))
}

function buildRounds(venueId, gradeOverride = {}, trackOverride = {}) {
  const tBase = VENUE_TRACK_OVERRIDE[venueId] || {}
  const tOver = { ...tBase, ...(trackOverride[venueId] || {}) }
  const gOver = gradeOverride[venueId] || {}
  return BASE_ROUNDS.map((r, i) => ({
    ...r,
    track: tOver[i] ?? r.track,
    grade: gOver[i] ?? r.grade,
  }))
}

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
  const rounds = buildRounds(venueId, scenario.gradeOverride, scenario.trackOverride)
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
  return scenario.venues.flatMap((_, seqIdx) =>
    Array.from({ length: 12 }, (_, i) => getRaceInfo(dateIdx, seqIdx, i + 1))
  )
}

// 仮想時刻に基づくレースステータス
export function getRaceStatus(startHour, virtualHour) {
  if (virtualHour > startHour)  return 'result'
  if (virtualHour === startHour) return 'closed'
  return 'open'
}
