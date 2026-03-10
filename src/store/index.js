import { reactive } from 'vue'
import { TEST_USERS } from '../data/users.js'
import { DATE_SCENARIOS, makeRaceKey, getRaceInfo, getRaceStatus } from '../data/scenarios.js'
import { generateHorses, generateResult, checkComboWin, calcComboPayout } from '../data/masterData.js'

const SESSION_KEY = 'keibanet_session'
const ACCOUNTS_KEY = 'keibanet_accounts'

function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}') } catch { return {} }
}
function loadAccounts() {
  try { return JSON.parse(sessionStorage.getItem(ACCOUNTS_KEY) || '{}') } catch { return {} }
}
function saveSession(s) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch {}
}
function saveAccounts(a) {
  try { sessionStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a)) } catch {}
}

const sess = loadSession()
const accs = loadAccounts()

// 精算処理
function settleBets(acc, raceKey, result, horses) {
  acc.bets
    .filter(b => b.raceKey === raceKey && b.status === 'pending')
    .forEach(bet => {
      const typeName = bet.betTypeStr.split('(')[0]
      let payout = 0
      let anyWin = false
      bet.combos.forEach(comboStr => {
        const nums = comboStr.split('→').map(Number)
        if (checkComboWin(typeName, nums, result)) {
          anyWin = true
          payout += calcComboPayout(typeName, result, horses, bet.amountPerCombo)
        }
      })
      bet.status = anyWin ? 'win' : 'lose'
      bet.payout = payout
      if (anyWin) acc.balance += payout
    })
}

export const store = reactive({
  selectedDateIdx: sess.selectedDateIdx ?? 0,
  virtualHour:     sess.virtualHour     ?? 9,
  currentUserId:   sess.currentUserId   ?? null,
  _accounts: accs,

  // ---- getter ----
  get currentUser() {
    return TEST_USERS.find(u => u.id === this.currentUserId) ?? null
  },
  get currentAccount() {
    return this._accounts[this.currentUserId] ?? null
  },
  get balance() {
    return this.currentAccount?.balance ?? 0
  },
  get bets() {
    return this.currentAccount?.bets ?? []
  },
  get isLoggedIn() {
    return this.currentUserId !== null
  },

  // ---- 認証 ----
  login(loginId, password) {
    const user = TEST_USERS.find(u => u.loginId === loginId && u.password === password)
    if (!user) return false
    this.currentUserId = user.id
    if (!this._accounts[user.id]) {
      this._accounts[user.id] = { balance: 0, bets: [], settledKeys: [] }
    }
    this._saveSession()
    return true
  },
  logout() {
    this.currentUserId = null
    this._saveSession()
  },

  // ---- 残高チャージ ----
  charge(amount) {
    if (!this.currentAccount) return
    this._accounts[this.currentUserId].balance += amount
    saveAccounts(this._accounts)
  },

  // ---- 投票 ----
  placeBet(raceKey, raceLabel, betTypeStr, combos, amountPerCombo) {
    if (!this.currentAccount) return false
    const total = combos.length * amountPerCombo
    if (this.balance < total) return false
    this._accounts[this.currentUserId].bets.push({
      id: Date.now(),
      raceKey, raceLabel, betTypeStr,
      combos, amountPerCombo, total,
      status: 'pending', payout: 0,
      placedAt: new Date().toISOString(),
    })
    this._accounts[this.currentUserId].balance -= total
    saveAccounts(this._accounts)
    return true
  },

  // ---- 仮想時刻設定 ----
  setVirtualHour(h) {
    const prev = this.virtualHour
    this.virtualHour = h
    if (h > prev && this.isLoggedIn) this._settleAllDue()
    this._saveSession()
  },

  setDateIdx(idx) {
    this.selectedDateIdx = idx
    this.virtualHour = 10
    this._saveSession()
  },

  // ---- 全完了レース精算 ----
  _settleAllDue() {
    const acc = this._accounts[this.currentUserId]
    if (!acc) return
    const scenario = DATE_SCENARIOS[this.selectedDateIdx]
    if (!scenario) return
    scenario.venues.forEach((_, vSeqIdx) => {
      for (let round = 1; round <= 12; round++) {
        const info = getRaceInfo(this.selectedDateIdx, vSeqIdx, round)
        if (!info) continue
        const status = getRaceStatus(info.startHour, this.virtualHour)
        if (status !== 'result') continue
        const raceKey = makeRaceKey(this.selectedDateIdx, vSeqIdx, round)
        if (acc.settledKeys.includes(raceKey)) continue
        const horses = generateHorses(raceKey, info.count)
        const result = generateResult(raceKey, info.count, horses)
        settleBets(acc, raceKey, result, horses)
        acc.settledKeys.push(raceKey)
      }
    })
    saveAccounts(this._accounts)
  },

  _saveSession() {
    saveSession({
      selectedDateIdx: this.selectedDateIdx,
      virtualHour: this.virtualHour,
      currentUserId: this.currentUserId,
    })
  },
})
