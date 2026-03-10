// ===== 馬名プール (100名) =====
export const HORSE_NAMES = [
  'サクラフレア','ダイヤモンドキング','ミライノホシ','スターライト','ゴールドラッシュ',
  'シルフィード','ファイアーストーム','ブルースカイ','ランニングハイ','サンダーボルト',
  'ムーンライト','ブリザード','エメラルドドリーム','ハリケーン','アクアマリン',
  'ルビーローズ','クリスタルウィンド','フォーリングスター','マーベラスウィン','ジュエルクラウン',
  'スペースランナー','フラッシュポイント','シャイニングスター','ブレイブハート','ムーンウォーカー',
  'エターナルフレイム','ストームライダー','ゴールデンドーン','ミスティックガーデン','ライトニングロード',
  'ヴィクトリーソング','ダイヤモンドエッジ','クリムゾンフラッグ','スカーレットリボン','ブルーライトニング',
  'ゴールドラスター','シルバーウィング','ロケットスター','サンダーキャット','スーパーソニック',
  'ハイスピードランナー','フラッシュムーブ','ダークマター','ワイルドフレイム','クリスタルボール',
  'クラウンジュエル','リーガルエンペラー','ノーブルスピリット','インペリアルガード','マジェスティックライン',
  'ロイヤルバトル','ソブリンパス','グランドマスター','エクスカリバー','ドラゴンハート',
  'フェニックスライズ','スターシャドウ','シャイニングアーマー','クリスタルラン','サンダークラップ',
  'ムーンダンサー','スカイウォーカー','アイスブレイカー','ストームブリンガー','ナイトフォール',
  'ゴールデンイーグル','シルバーストリーク','ブルーオーシャン','レッドコメット','グリーンフラッシュ',
  'スプリングウィンド','サマーブリーズ','オータムリーフ','ウィンターフロスト','サクラブリザード',
  'コスモスドリーム','オリオンベルト','ポラリスランナー','カシオペアエース','アルタイルダッシュ',
  'デネブフライト','ベガライト','シリウスボルト','プロキオンストリーム','リゲルスター',
  'タイヨウノカゲ','ソラノカナタ','カゼノウタ','ホシノキセキ','ユメノチカラ',
  'ハナノタキ','キョウノキラメキ','アシタノタカラ','イノチノヒカリ','チカラノゲンセン',
  'エイユウノチカラ','サクラノユメ','アオゾラノハテ','タカネノハナ','キンノタマシイ',
]

// ===== 騎手プール =====
export const JOCKEY_NAMES = [
  '武豊','川田将雅','福永祐一','横山典弘','岩田康誠',
  '松山弘平','三浦皇成','戸崎圭太','丸田恭介','田辺裕信',
  '北村友一','和田竜二','浜中俊','池添謙一','岩田望来',
  '横山和生','吉田隼人','菱田裕二','斎藤新','坂井瑠星',
  '西村淳也','団野大成','古川吉洋','今村聖奈','永島まなみ',
]

// ===== ユーティリティ =====
function lcg(seed) {
  return (((seed * 1664525 + 1013904223) >>> 0) / 0xffffffff)
}

function shuffled(arr, seed) {
  const result = [...arr]
  let s = (seed * 1000003 + 998244353) >>> 0
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function frameOf(number, total) {
  if (total <= 8) return number
  // JRA方式簡略計算
  const extra = total - 8
  // 最後extra枠が2頭ずつ
  const boundary = 8 - extra
  if (number <= boundary) return number
  return boundary + Math.ceil((number - boundary) / 2)
}

const ODDS_TABLE = [1.4, 2.3, 3.8, 6.2, 9.8, 15.0, 24.0, 38.0, 60.0, 95.0, 140.0, 200.0, 300.0, 430.0, 580.0, 760.0, 950.0, 1200.0]

// ===== 馬生成 =====
export function generateHorses(raceKey, count) {
  const names   = shuffled(HORSE_NAMES, raceKey * 997  + 1).slice(0, count)
  const jockeys = shuffled(JOCKEY_NAMES, raceKey * 1337 + 2)

  const horses = names.map((name, i) => {
    let s = (raceKey * 3571 + i * 131 + 777) >>> 0
    s = (s * 1664525 + 1013904223) >>> 0
    const age = 2 + (s % 5)
    s = (s * 1664525 + 1013904223) >>> 0
    const sexR = s / 0xffffffff
    const sex = sexR < 0.55 ? '牡' : sexR < 0.85 ? '牝' : 'セ'
    s = (s * 1664525 + 1013904223) >>> 0
    const weight = 430 + (s % 90)
    return { number: i + 1, name, jockey: jockeys[i % jockeys.length], age, sex, weight }
  })

  // 人気・オッズ割り当て
  const strengths = horses.map((_, i) => {
    let s = (raceKey * 7919 + i * 97 + 42) >>> 0
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  })
  const rankOrder = strengths.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v)
  rankOrder.forEach(({ i }, rank) => {
    horses[i].popularity = rank + 1
    horses[i].odds = ODDS_TABLE[Math.min(rank, ODDS_TABLE.length - 1)]
    horses[i].frame = frameOf(i + 1, count)
  })

  return horses
}

// ===== 結果生成 (決定論的・バリエーション豊富) =====
// 人気順パターン配列: [1着人気, 2着人気, 3着人気]
const RESULT_PATTERNS = [
  [1,2,3],[2,1,3],[3,1,2],[1,3,2],[4,1,2],
  [2,4,1],[5,2,1],[1,4,3],[3,5,1],[7,2,1],
  [2,6,3],[4,3,1],[6,1,2],[1,2,5],[3,2,6],
  [8,3,1],[2,7,4],[5,1,3],[9,2,1],[1,5,8],
  [4,2,7],[6,3,2],[11,4,1],[2,8,3],[3,9,2],
  [10,3,2],[1,6,4],[7,4,2],[12,2,1],[5,3,8],
  [3,10,1],[9,1,4],[13,5,2],[1,7,11],[6,2,9],
]

export function generateResult(raceKey, horseCount, horses) {
  // LCG で偏りのないパターン選択
  const h = (raceKey * 1000003 + 999983) >>> 0
  const pattern = RESULT_PATTERNS[h % RESULT_PATTERNS.length]
  function byPop(pop) {
    const p = Math.min(pop, horseCount)
    return (horses ?? []).find(h => h.popularity === p)?.number
      ?? Math.min(p, horseCount)
  }
  return { first: byPop(pattern[0]), second: byPop(pattern[1]), third: byPop(pattern[2]) }
}

// ===== 払い戻し判定 =====
export function checkComboWin(betTypeName, nums, result) {
  const [n1, n2, n3] = nums
  const { first, second, third } = result
  switch (betTypeName) {
    case '単勝': return n1 === first
    case '複勝': return [first, second, third].includes(n1)
    case '馬複': { const s = new Set([n1,n2]); return s.has(first) && s.has(second) }
    case '馬単': return n1 === first && n2 === second
    case 'ワイド': { const s = new Set([n1,n2]); return [first,second,third].filter(n=>s.has(n)).length === 2 }
    case '三連複': { const s = new Set([n1,n2,n3]); const t = new Set([first,second,third]); return [...s].every(n=>t.has(n)) && s.size===3 }
    case '三連単': return n1===first && n2===second && n3===third
    default: return false
  }
}

// ===== 全着順生成 =====
export function generateFullResult(raceKey, horseCount, horses) {
  const top3 = generateResult(raceKey, horseCount, horses)
  const top3Nums = [top3.first, top3.second, top3.third]
  const remaining = horses.map(h => h.number).filter(n => !top3Nums.includes(n))
  const rest = shuffled(remaining, raceKey * 13337 + 99991)
  return [...top3Nums, ...rest]
}

// ===== レース払戻金計算 (100円あたり) =====
export function calcRacePayouts(result, horses) {
  const { first, second, third } = result
  const o = (num) => horses.find(h => h.number === num)?.odds ?? 1
  const o1 = o(first), o2 = o(second), o3 = o(third)
  // 10円単位で切り捨て
  const p = (mult) => Math.max(100, Math.floor(mult * 10) * 10)
  const s2 = (a, b) => [a, b].sort((x, y) => x - y).join('-')
  const s3 = (a, b, c) => [a, b, c].sort((x, y) => x - y).join('-')
  return {
    tansho:     { combo: String(first),              payout: p(o1) },
    fukusho:    [
      { combo: String(first),  payout: p(Math.max(1.0, o1 * 0.38)) },
      { combo: String(second), payout: p(Math.max(1.0, o2 * 0.38)) },
      { combo: String(third),  payout: p(Math.max(1.0, o3 * 0.38)) },
    ],
    umaren:     { combo: s2(first, second),           payout: p(Math.max(1.5,  Math.sqrt(o1*o2)*1.8+1)) },
    umatan:     { combo: `${first}→${second}`,        payout: p(Math.max(2.0,  o1*1.3+1)) },
    wide:       [
      { combo: s2(first,second),  payout: p(Math.max(1.0, Math.sqrt(o1*o2)*0.9+0.5)) },
      { combo: s2(first,third),   payout: p(Math.max(1.0, Math.sqrt(o1*o3)*0.9+0.5)) },
      { combo: s2(second,third),  payout: p(Math.max(1.0, Math.sqrt(o2*o3)*0.9+0.5)) },
    ],
    sanrenpuku: { combo: s3(first, second, third),    payout: p(Math.max(3.0,  Math.cbrt(o1*o2*o3)*3+5)) },
    sanrentan:  { combo: `${first}→${second}→${third}`, payout: p(Math.max(5.0, Math.cbrt(o1*o2*o3)*6+10)) },
  }
}

export function calcComboPayout(betTypeName, result, horses, amountPerCombo) {
  const o = (num) => horses.find(h => h.number === num)?.odds ?? 1
  const o1 = o(result.first), o2 = o(result.second), o3 = o(result.third)
  let mult
  switch (betTypeName) {
    case '単勝':  mult = o1; break
    case '複勝':  mult = Math.max(1.0, o1 * 0.38); break
    case '馬複':  mult = Math.max(1.5, Math.sqrt(o1 * o2) * 1.8 + 1); break
    case 'ワイド':mult = Math.max(1.0, Math.sqrt(o1 * o2) * 0.9 + 0.5); break
    case '馬単':  mult = Math.max(2.0, o1 * 1.3 + 1); break
    case '三連複':mult = Math.max(3.0, Math.cbrt(o1*o2*o3) * 3 + 5); break
    case '三連単':mult = Math.max(5.0, Math.cbrt(o1*o2*o3) * 6 + 10); break
    default:      mult = 1
  }
  return Math.max(100, Math.floor(amountPerCombo * mult / 100) * 100)
}
