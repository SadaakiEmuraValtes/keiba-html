// 開催場ごとのレーススケジュール
// status: 'upcoming'=発走前, 'open'=投票受付中, 'closed'=締切, 'result'=確定, 'cancel'=中止, null=未開催
export const venueSchedule = [
  {
    id: 'obihiro',
    name: '帯広ば',
    track: 'ば',
    weather: '晴',
    rounds: {
      3:  { status: 'result',   time: '13:50' },
      4:  { status: 'open',     time: '14:50', raceId: 101 },
      5:  { status: 'open',     time: '15:20', raceId: 102 },
      6:  { status: 'open',     time: '15:50', raceId: 103 },
      7:  { status: 'upcoming', time: '16:20', raceId: 104 },
    },
  },
  {
    id: 'morioka',
    name: '盛岡',
    track: '芝',
    weather: '曇',
    rounds: {
      1:  { status: 'result',   time: '13:00' },
      2:  { status: 'result',   time: '13:10' },
      3:  { status: 'result',   time: '13:20' },
      4:  { status: 'result',   time: '13:30' },
      5:  { status: 'result',   time: '13:40' },
      6:  { status: 'open',     time: '14:00', raceId: 201 },
      7:  { status: 'open',     time: '14:20', raceId: 202 },
      8:  { status: 'open',     time: '14:40', raceId: 203 },
      9:  { status: 'upcoming', time: '15:00', raceId: 204 },
      10: { status: 'upcoming', time: '15:20', raceId: 205 },
      11: { status: 'upcoming', time: '15:40', raceId: 206 },
    },
  },
  {
    id: 'urawa',
    name: '浦和',
    track: 'ダ',
    weather: '晴',
    rounds: {
      1:  { status: 'result',   time: '10:00', raceId: 1 },
      2:  { status: 'result',   time: '10:35', raceId: 2 },
      3:  { status: 'result',   time: '11:10', raceId: 3 },
      4:  { status: 'closed',   time: '11:45', raceId: 4 },
      5:  { status: 'open',     time: '12:20', raceId: 5 },
      6:  { status: 'open',     time: '13:00', raceId: 6 },
      7:  { status: 'upcoming', time: '14:00', raceId: 7 },
      8:  { status: 'upcoming', time: '15:40', raceId: 8 },
    },
  },
  {
    id: 'kawasaki',
    name: '川崎',
    track: 'ダ',
    weather: '晴',
    rounds: {
      1:  { status: 'result',   time: '13:30' },
      2:  { status: 'open',     time: '14:00', raceId: 301 },
      3:  { status: 'open',     time: '14:31', raceId: 302 },
      4:  { status: 'open',     time: '15:00', raceId: 303 },
      5:  { status: 'cancel' },
      6:  { status: 'cancel' },
    },
  },
  {
    id: 'kochi',
    name: '高知',
    track: 'ダ',
    weather: '雨',
    rounds: {
      4:  { status: 'result',   time: '13:00' },
      5:  { status: 'result',   time: '13:30' },
      6:  { status: 'result',   time: '14:00' },
      7:  { status: 'result',   time: '14:30' },
      8:  { status: 'open',     time: '15:00', raceId: 401 },
      9:  { status: 'open',     time: '15:30', raceId: 402 },
      10: { status: 'upcoming', time: '16:00', raceId: 403 },
      11: { status: 'upcoming', time: '16:30', raceId: 404 },
    },
  },
]

export const MAX_ROUNDS = 12
