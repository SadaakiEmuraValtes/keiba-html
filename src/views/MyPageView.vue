<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { DATE_SCENARIOS } from '../data/scenarios.js'

const router = useRouter()

// チャージ
const chargeAmount = ref(5000)
const chargeMsg    = ref('')
const CHARGE_PRESETS = [1000, 3000, 5000, 10000, 30000]

function doCharge(amt) {
  if (!store.isLoggedIn) return
  store.charge(amt)
  chargeMsg.value = `¥${amt.toLocaleString()} チャージしました。残高: ¥${store.balance.toLocaleString()}`
  setTimeout(() => { chargeMsg.value = '' }, 4000)
}

// 投票履歴
const bets = computed(() => [...store.bets].reverse())
const totalBet    = computed(() => store.bets.reduce((s, b) => s + b.total, 0))
const totalPayout = computed(() => store.bets.filter(b => b.status === 'win').reduce((s, b) => s + b.payout, 0))
const profit      = computed(() => totalPayout.value - totalBet.value)

function formatDate(iso) {
  const d = new Date(iso)
  const p = n => String(n).padStart(2,'0')
  return `${d.getFullYear()}/${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
function clearBets() {
  if (!window.confirm('投票履歴をすべて削除しますか？')) return
  store._accounts[store.currentUserId].bets = []
  store._accounts[store.currentUserId].settledKeys = []
  try { sessionStorage.setItem('keibanet_accounts', JSON.stringify(store._accounts)) } catch {}
}
</script>

<template>
  <div v-if="!store.isLoggedIn" class="not-logged">
    <p>マイページを表示するにはログインが必要です。</p>
    <button class="btn btn-primary mt-12" @click="router.push('/login')">ログイン</button>
  </div>

  <div v-else>
    <h2 class="page-title">👤 マイページ</h2>

    <!-- ユーザー情報 -->
    <div class="card mb-16">
      <div class="user-info-row">
        <div>
          <div class="user-name">{{ store.currentUser?.name }}</div>
          <div class="user-id text-muted">ID: {{ store.currentUser?.loginId }}</div>
        </div>
        <div class="balance-big">
          <div class="balance-label">残高</div>
          <div class="balance-val">¥{{ store.balance.toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <!-- チャージ（仮想銀行振込） -->
    <div class="card mb-16">
      <div class="section-label mb-8">💳 残高チャージ（仮想銀行振込）</div>
      <div class="charge-note text-muted mb-8">
        ※ デモサービスのため実際の入金は発生しません。ボタンをクリックするだけで残高が増えます。
      </div>
      <div class="charge-presets">
        <button
          v-for="amt in CHARGE_PRESETS" :key="amt"
          class="charge-btn"
          @click="doCharge(amt)"
        >
          ¥{{ amt.toLocaleString() }}
        </button>
      </div>
      <div class="charge-custom mt-12">
        <span class="text-muted" style="font-size:0.82rem;">金額指定: </span>
        <input v-model.number="chargeAmount" type="number" step="1000" min="100" class="charge-input" />
        <button class="btn btn-gold btn-sm" @click="doCharge(chargeAmount)">チャージ</button>
      </div>
      <div v-if="chargeMsg" class="charge-msg">{{ chargeMsg }}</div>
    </div>

    <!-- 収支サマリー -->
    <div class="summary-grid mb-16">
      <div class="summary-card"><div class="summary-label">総投票額</div><div class="summary-val">¥{{ totalBet.toLocaleString() }}</div></div>
      <div class="summary-card"><div class="summary-label">総払戻額</div><div class="summary-val text-green">¥{{ totalPayout.toLocaleString() }}</div></div>
      <div class="summary-card">
        <div class="summary-label">収支</div>
        <div class="summary-val" :class="profit >= 0 ? 'text-green' : 'text-red'">
          {{ profit >= 0 ? '+' : '' }}¥{{ profit.toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- 投票履歴 -->
    <div class="section-label mb-8">
      📋 投票履歴
      <button v-if="bets.length" class="btn btn-secondary btn-sm" style="margin-left:12px;" @click="clearBets">履歴をクリア</button>
    </div>

    <div v-if="bets.length === 0" class="card text-muted" style="text-align:center; padding:24px;">
      投票履歴がありません
    </div>

    <div v-else class="bet-list">
      <div
        v-for="bet in bets" :key="bet.id"
        class="bet-card card"
        :class="'bet-' + bet.status"
      >
        <div class="bet-header">
          <div>
            <span class="bet-label">{{ bet.raceLabel }}</span>
            <span class="bet-type">{{ bet.betTypeStr }}</span>
          </div>
          <span class="badge" :class="bet.status === 'win' ? 'badge-win' : bet.status === 'lose' ? 'badge-lose' : 'badge-pending'">
            {{ bet.status === 'win' ? '的中！' : bet.status === 'lose' ? 'ハズレ' : '結果待ち' }}
          </span>
        </div>
        <div class="bet-combos">
          <span v-for="(c, i) in bet.combos.slice(0,8)" :key="i" class="combo-chip">{{ c }}</span>
          <span v-if="bet.combos.length > 8" class="text-muted">…他{{ bet.combos.length - 8 }}点</span>
        </div>
        <div class="bet-footer">
          <span class="text-muted">{{ bet.combos.length }}通り × ¥{{ bet.amountPerCombo.toLocaleString() }} = <strong>¥{{ bet.total.toLocaleString() }}</strong></span>
          <span v-if="bet.status === 'win'" class="payout">払戻 ¥{{ bet.payout.toLocaleString() }}</span>
          <span class="bet-time text-muted">{{ formatDate(bet.placedAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-logged { text-align: center; padding: 40px; color: #888; }
.user-info-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.user-name { font-size: 1.1rem; font-weight: 700; }
.user-id { font-size: 0.8rem; margin-top: 2px; }
.balance-big { text-align: right; }
.balance-label { font-size: 0.75rem; color: #888; }
.balance-val { font-size: 1.5rem; font-weight: 800; color: #ffd700; }
.charge-note { font-size: 0.78rem; }
.charge-presets { display: flex; gap: 8px; flex-wrap: wrap; }
.charge-btn {
  padding: 8px 16px; border-radius: 7px; border: 1px solid #3a3a5a;
  background: #1a1a30; color: #ddd; font-size: 0.88rem; font-weight: 700;
  transition: all 0.15s;
}
.charge-btn:hover { background: #2563eb; border-color: #2563eb; color: #fff; }
.charge-custom { display: flex; gap: 8px; align-items: center; }
.charge-input {
  width: 110px; background: #1a1a30; border: 1px solid #3a3a5a;
  border-radius: 5px; color: #fff; padding: 6px 10px; font-size: 0.88rem;
}
.charge-msg { margin-top: 8px; color: #4ade80; font-size: 0.82rem; }
.summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.summary-card { background: #12122a; border: 1px solid #2a2a4a; border-radius: 8px; padding: 12px; text-align: center; }
.summary-label { font-size: 0.75rem; color: #888; margin-bottom: 4px; }
.summary-val { font-size: 1.1rem; font-weight: 800; }
.section-label { font-size: 0.9rem; font-weight: 700; }
.bet-list { display: flex; flex-direction: column; gap: 8px; }
.bet-card { }
.bet-win { border-left: 3px solid #4ade80; }
.bet-lose { border-left: 3px solid #f87171; opacity: 0.7; }
.bet-pending { border-left: 3px solid #5bc0eb; }
.bet-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; gap: 8px; }
.bet-label { font-size: 0.88rem; font-weight: 700; margin-right: 6px; }
.bet-type { font-size: 0.78rem; background: #2a2a4a; border-radius: 4px; padding: 1px 6px; color: #a78bfa; }
.bet-combos { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 6px; }
.combo-chip { background: #1a1a36; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; color: #ccc; }
.bet-footer { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; font-size: 0.78rem; }
.payout { color: #4ade80; font-weight: 700; font-size: 0.9rem; }
.bet-time { color: #555; }
@media (max-width: 480px) { .summary-grid { grid-template-columns: repeat(3, 1fr); } }
</style>
