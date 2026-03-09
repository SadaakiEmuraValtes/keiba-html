function frameOf(number, total) {
  if (total <= 8) return number
  return Math.ceil(number / 2)
}
function withFrame(horses) {
  const total = horses.length
  return horses.map(h => ({ ...h, frame: frameOf(h.number, total) }))
}

export const races = [
  {
    id: 1, venueId: 'urawa', venueName: '浦和', round: 1,
    name: '第1レース　2歳未勝利', distance: 'ダート1400m', grade: '', startTime: '10:00', status: 'result',
    horses: withFrame([
      { number: 1, name: 'サクラフレア',       jockey: '武豊',    age: 2, sex: '牝', weight: 460, odds:  3.2, popularity: 1 },
      { number: 2, name: 'ダイヤモンドキング', jockey: '川田将雅', age: 2, sex: '牡', weight: 480, odds:  5.1, popularity: 2 },
      { number: 3, name: 'ミライノホシ',       jockey: '福永祐一', age: 2, sex: '牡', weight: 470, odds:  8.4, popularity: 3 },
      { number: 4, name: 'スターライト',       jockey: '横山典弘', age: 2, sex: '牝', weight: 452, odds: 12.0, popularity: 4 },
      { number: 5, name: 'ゴールドラッシュ',   jockey: '岩田康誠', age: 2, sex: '牡', weight: 490, odds: 18.5, popularity: 5 },
      { number: 6, name: 'シルフィード',       jockey: '松山弘平', age: 2, sex: '牝', weight: 448, odds: 25.3, popularity: 6 },
      { number: 7, name: 'ファイアーストーム', jockey: '三浦皇成', age: 2, sex: '牡', weight: 476, odds: 35.0, popularity: 7 },
      { number: 8, name: 'ブルースカイ',       jockey: '戸崎圭太', age: 2, sex: '牝', weight: 456, odds: 45.0, popularity: 8 },
    ]),
    result: { first: 2, second: 1, third: 5 },
  },
  {
    id: 2, venueId: 'urawa', venueName: '浦和', round: 2,
    name: '第2レース　3歳未勝利', distance: 'ダート1600m', grade: '', startTime: '10:35', status: 'result',
    horses: withFrame([
      { number: 1, name: 'ランニングハイ',     jockey: '武豊',    age: 3, sex: '牡', weight: 488, odds:  4.5, popularity: 2 },
      { number: 2, name: 'サンダーボルト',     jockey: '川田将雅', age: 3, sex: '牡', weight: 494, odds:  2.8, popularity: 1 },
      { number: 3, name: 'ムーンライト',       jockey: '福永祐一', age: 3, sex: '牝', weight: 440, odds:  9.0, popularity: 3 },
      { number: 4, name: 'ブリザード',         jockey: '横山典弘', age: 3, sex: '牡', weight: 482, odds: 15.0, popularity: 4 },
      { number: 5, name: 'エメラルドドリーム', jockey: '岩田康誠', age: 3, sex: '牝', weight: 452, odds: 22.0, popularity: 5 },
      { number: 6, name: 'ハリケーン',         jockey: '松山弘平', age: 3, sex: '牡', weight: 498, odds: 30.0, popularity: 6 },
    ]),
    result: { first: 2, second: 4, third: 1 },
  },
  {
    id: 3, venueId: 'urawa', venueName: '浦和', round: 3,
    name: '第3レース　4歳上500万下', distance: '芝2000m', grade: '', startTime: '11:10', status: 'result',
    horses: withFrame([
      { number: 1, name: 'アクアマリン',       jockey: '戸崎圭太', age: 4, sex: '牡', weight: 502, odds:  2.1, popularity: 1 },
      { number: 2, name: 'ルビーローズ',       jockey: '武豊',    age: 5, sex: '牝', weight: 446, odds:  6.3, popularity: 2 },
      { number: 3, name: 'クリスタルウィンド', jockey: '川田将雅', age: 4, sex: '牡', weight: 478, odds:  8.8, popularity: 3 },
      { number: 4, name: 'ダーティーハリー',   jockey: '横山典弘', age: 6, sex: '牡', weight: 510, odds: 11.0, popularity: 4 },
      { number: 5, name: 'フォーリングスター', jockey: '三浦皇成', age: 5, sex: '牝', weight: 450, odds: 20.0, popularity: 5 },
      { number: 6, name: 'マーベラスウィン',   jockey: '松山弘平', age: 4, sex: '牡', weight: 486, odds: 28.0, popularity: 6 },
      { number: 7, name: 'ジュエルクラウン',   jockey: '岩田康誠', age: 5, sex: '牝', weight: 458, odds: 40.0, popularity: 7 },
    ]),
    result: { first: 1, second: 3, third: 6 },
  },
  {
    id: 4, venueId: 'urawa', venueName: '浦和', round: 4,
    name: '第4レース　4歳上1000万下', distance: 'ダート1400m', grade: '', startTime: '11:45', status: 'closed',
    horses: withFrame([
      { number: 1, name: 'スペースランナー',     jockey: '武豊',    age: 4, sex: '牡', weight: 492, odds:  3.5, popularity: 1 },
      { number: 2, name: 'フラッシュポイント',   jockey: '川田将雅', age: 5, sex: '牡', weight: 500, odds:  4.8, popularity: 2 },
      { number: 3, name: 'シャイニングスター',   jockey: '戸崎圭太', age: 4, sex: '牝', weight: 444, odds:  7.2, popularity: 3 },
      { number: 4, name: 'ブレイブハート',       jockey: '横山典弘', age: 6, sex: '牡', weight: 514, odds: 10.5, popularity: 4 },
      { number: 5, name: 'ロードトゥグローリー', jockey: '三浦皇成', age: 5, sex: '牡', weight: 484, odds: 16.0, popularity: 5 },
      { number: 6, name: 'ムーンウォーカー',     jockey: '福永祐一', age: 4, sex: '牝', weight: 454, odds: 25.0, popularity: 6 },
      { number: 7, name: 'クイックシルバー',     jockey: '松山弘平', age: 5, sex: '牡', weight: 496, odds: 38.0, popularity: 7 },
      { number: 8, name: 'デビルウィンド',       jockey: '岩田康誠', age: 7, sex: '牡', weight: 506, odds: 55.0, popularity: 8 },
    ]),
    result: null,
  },
  {
    id: 5, venueId: 'urawa', venueName: '浦和', round: 5,
    name: '第5レース　4歳上1600万下', distance: '芝1800m', grade: '', startTime: '12:20', status: 'open',
    horses: withFrame([
      { number: 1, name: 'エターナルフレイム',   jockey: '武豊',    age: 5, sex: '牡', weight: 498, odds:  2.5, popularity: 1 },
      { number: 2, name: 'ストームライダー',     jockey: '川田将雅', age: 4, sex: '牡', weight: 488, odds:  4.2, popularity: 2 },
      { number: 3, name: 'ゴールデンドーン',     jockey: '戸崎圭太', age: 6, sex: '牝', weight: 448, odds:  7.5, popularity: 3 },
      { number: 4, name: 'サンダーステップ',     jockey: '横山典弘', age: 5, sex: '牡', weight: 504, odds:  9.8, popularity: 4 },
      { number: 5, name: 'ミスティックガーデン', jockey: '福永祐一', age: 4, sex: '牝', weight: 456, odds: 14.0, popularity: 5 },
      { number: 6, name: 'ライトニングロード',   jockey: '三浦皇成', age: 5, sex: '牡', weight: 486, odds: 20.0, popularity: 6 },
      { number: 7, name: 'インフィニティラン',   jockey: '松山弘平', age: 6, sex: '牡', weight: 512, odds: 32.0, popularity: 7 },
    ]),
    result: null,
  },
  {
    id: 6, venueId: 'urawa', venueName: '浦和', round: 6,
    name: '第6レース　オープン特別', distance: '芝1600m', grade: 'OP', startTime: '13:00', status: 'open',
    horses: withFrame([
      { number: 1, name: 'ヴィクトリーソング', jockey: '武豊',    age: 5, sex: '牡', weight: 494, odds:  1.9, popularity: 1 },
      { number: 2, name: 'ダイヤモンドエッジ', jockey: '川田将雅', age: 4, sex: '牡', weight: 482, odds:  3.6, popularity: 2 },
      { number: 3, name: 'クリムゾンフラッグ', jockey: '戸崎圭太', age: 5, sex: '牝', weight: 450, odds:  6.8, popularity: 3 },
      { number: 4, name: 'スカーレットリボン', jockey: '横山典弘', age: 6, sex: '牡', weight: 508, odds: 10.0, popularity: 4 },
      { number: 5, name: 'ブルーライトニング', jockey: '福永祐一', age: 4, sex: '牡', weight: 476, odds: 15.5, popularity: 5 },
      { number: 6, name: 'ゴールドラスター',   jockey: '三浦皇成', age: 5, sex: '牝', weight: 444, odds: 22.0, popularity: 6 },
      { number: 7, name: 'シルバーウィング',   jockey: '松山弘平', age: 7, sex: '牡', weight: 516, odds: 30.0, popularity: 7 },
      { number: 8, name: 'アイアンクラッド',   jockey: '岩田康誠', age: 4, sex: '牡', weight: 486, odds: 45.0, popularity: 8 },
    ]),
    result: null,
  },
  {
    id: 7, venueId: 'urawa', venueName: '浦和', round: 7,
    name: '第7レース　重賞　東京スプリント（GIII）', distance: 'ダート1200m', grade: 'GIII', startTime: '14:00', status: 'upcoming',
    horses: withFrame([
      { number: 1, name: 'ロケットスター',       jockey: '武豊',    age: 5, sex: '牡', weight: 500, odds:  2.2, popularity: 1 },
      { number: 2, name: 'サンダーキャット',     jockey: '川田将雅', age: 6, sex: '牡', weight: 508, odds:  3.8, popularity: 2 },
      { number: 3, name: 'スーパーソニック',     jockey: '戸崎圭太', age: 4, sex: '牡', weight: 492, odds:  5.5, popularity: 3 },
      { number: 4, name: 'ハイスピードランナー', jockey: '横山典弘', age: 5, sex: '牡', weight: 496, odds:  8.0, popularity: 4 },
      { number: 5, name: 'フラッシュムーブ',     jockey: '福永祐一', age: 4, sex: '牝', weight: 454, odds: 11.0, popularity: 5 },
      { number: 6, name: 'ダークマター',         jockey: '三浦皇成', age: 6, sex: '牡', weight: 512, odds: 18.0, popularity: 6 },
      { number: 7, name: 'エレクトリックシティ', jockey: '松山弘平', age: 5, sex: '牡', weight: 488, odds: 25.0, popularity: 7 },
      { number: 8, name: 'ワイルドフレイム',     jockey: '岩田康誠', age: 7, sex: '牡', weight: 520, odds: 35.0, popularity: 8 },
      { number: 9, name: 'クリスタルボール',     jockey: '丸田恭介', age: 4, sex: '牝', weight: 446, odds: 50.0, popularity: 9 },
    ]),
    result: null,
  },
  {
    id: 8, venueId: 'urawa', venueName: '浦和', round: 8,
    name: '第8レース　重賞　浦和ダービー（GII）', distance: '芝2400m', grade: 'GII', startTime: '15:40', status: 'upcoming',
    horses: withFrame([
      { number: 1,  name: 'クラウンジュエル',      jockey: '武豊',    age: 4, sex: '牡', weight: 490, odds:  1.7, popularity: 1 },
      { number: 2,  name: 'リーガルエンペラー',    jockey: '川田将雅', age: 4, sex: '牡', weight: 486, odds:  2.9, popularity: 2 },
      { number: 3,  name: 'ノーブルスピリット',    jockey: '戸崎圭太', age: 4, sex: '牡', weight: 494, odds:  5.2, popularity: 3 },
      { number: 4,  name: 'インペリアルガード',    jockey: '横山典弘', age: 4, sex: '牡', weight: 498, odds:  7.8, popularity: 4 },
      { number: 5,  name: 'マジェスティックライン', jockey: '福永祐一', age: 4, sex: '牡', weight: 488, odds: 12.0, popularity: 5 },
      { number: 6,  name: 'ロイヤルバトル',        jockey: '三浦皇成', age: 4, sex: '牡', weight: 492, odds: 18.0, popularity: 6 },
      { number: 7,  name: 'ソブリンパス',          jockey: '松山弘平', age: 4, sex: '牡', weight: 502, odds: 28.0, popularity: 7 },
      { number: 8,  name: 'グランドマスター',      jockey: '岩田康誠', age: 4, sex: '牡', weight: 484, odds: 40.0, popularity: 8 },
      { number: 9,  name: 'エクスカリバー',        jockey: '丸田恭介', age: 4, sex: '牡', weight: 496, odds: 55.0, popularity: 9 },
      { number: 10, name: 'ドラゴンハート',        jockey: '田辺裕信', age: 4, sex: '牡', weight: 500, odds: 70.0, popularity: 10 },
    ]),
    result: null,
  },
]

export function getRaceById(id) {
  return races.find(r => r.id === id)
}
