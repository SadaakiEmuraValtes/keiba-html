import { reactive } from 'vue'

const STORAGE_KEY = 'keiba_store'

function loadFromStorage() {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function saveToStorage(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      balance: state.balance,
      bets: state.bets,
    }))
  } catch {}
}

const saved = loadFromStorage()

export const store = reactive({
  balance: saved?.balance ?? 10000, // 所持金（円）
  bets: saved?.bets ?? [],          // 投票履歴

  // 投票する
  placeBet(raceId, raceName, betType, horses, amount) {
    const bet = {
      id: Date.now(),
      raceId,
      raceName,
      betType,
      horses,    // [馬番号, ...]
      amount,
      status: 'pending', // pending / win / lose
      payout: 0,
      placedAt: new Date().toISOString(),
    }
    this.bets.push(bet)
    this.balance -= amount
    saveToStorage(this)
    return bet
  },

  // レース結果を確定する（result: { first, second, third }）
  settleRace(raceId, result, horses) {
    this.bets
      .filter(b => b.raceId === raceId && b.status === 'pending')
      .forEach(bet => {
        const win = checkWin(bet.betType, bet.horses, result)
        if (win) {
          const payout = calcPayout(bet.betType, bet.horses, horses, bet.amount)
          bet.payout = payout
          bet.status = 'win'
          this.balance += payout
        } else {
          bet.status = 'lose'
        }
      })
    saveToStorage(this)
  },

  // 残高チャージ
  addBalance(amount) {
    this.balance += amount
    saveToStorage(this)
  },
})

function checkWin(betType, selectedHorses, result) {
  const [s1, s2, s3] = selectedHorses
  switch (betType) {
    case '単勝': return s1 === result.first
    case '複勝': return [result.first, result.second, result.third].includes(s1)
    case '馬連': {
      const pair = new Set([s1, s2])
      return pair.has(result.first) && pair.has(result.second)
    }
    case '馬単': return s1 === result.first && s2 === result.second
    case 'ワイド': {
      const pair = new Set([s1, s2])
      const top3 = [result.first, result.second, result.third]
      return top3.filter(h => pair.has(h)).length === 2
    }
    case '3連複': {
      const sel = new Set([s1, s2, s3])
      const top3 = new Set([result.first, result.second, result.third])
      return [...sel].every(h => top3.has(h)) && [...top3].every(h => sel.has(h))
    }
    case '3連単':
      return s1 === result.first && s2 === result.second && s3 === result.third
    default:
      return false
  }
}

function calcPayout(betType, selectedHorses, horses, amount) {
  const multipliers = {
    '単勝': () => {
      const h = horses.find(h => h.number === selectedHorses[0])
      return h ? h.odds : 1
    },
    '複勝': () => {
      const h = horses.find(h => h.number === selectedHorses[0])
      return h ? h.odds * 0.4 : 1
    },
    '馬連': () => {
      const h1 = horses.find(h => h.number === selectedHorses[0])
      const h2 = horses.find(h => h.number === selectedHorses[1])
      return h1 && h2 ? h1.odds * h2.odds * 0.1 + 3 : 1
    },
    '馬単': () => {
      const h1 = horses.find(h => h.number === selectedHorses[0])
      const h2 = horses.find(h => h.number === selectedHorses[1])
      return h1 && h2 ? h1.odds * h2.odds * 0.15 + 4 : 1
    },
    'ワイド': () => {
      const h1 = horses.find(h => h.number === selectedHorses[0])
      const h2 = horses.find(h => h.number === selectedHorses[1])
      return h1 && h2 ? h1.odds * h2.odds * 0.06 + 2 : 1
    },
    '3連複': () => {
      const hs = selectedHorses.map(n => horses.find(h => h.number === n))
      const base = hs.reduce((acc, h) => acc * (h ? h.odds : 1), 1)
      return base * 0.02 + 10
    },
    '3連単': () => {
      const hs = selectedHorses.map(n => horses.find(h => h.number === n))
      const base = hs.reduce((acc, h) => acc * (h ? h.odds : 1), 1)
      return base * 0.04 + 20
    },
  }
  const fn = multipliers[betType]
  const multiplier = fn ? fn() : 1
  return Math.floor(amount * multiplier / 100) * 100
}
