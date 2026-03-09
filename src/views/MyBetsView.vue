<script setup>
import { computed } from 'vue'
import { store } from '../store/index.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const bets = computed(() => [...store.bets].reverse())
const totalBet = computed(() => store.bets.reduce((s, b) => s + b.amount, 0))
const totalPayout = computed(() => store.bets.filter(b => b.status === 'win').reduce((s, b) => s + b.payout, 0))
const profit = computed(() => totalPayout.value - totalBet.value)

function formatDate(iso) {
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function clearAll() {
  if (!window.confirm('投票履歴をすべて削除しますか？')) return
  store.bets.splice(0)
  sessionStorage.removeItem('keiba_store')
}

function recharge() {
  store.addBalance(10000)
}
</script>

<template>
  <div>
    <h2 class="page-title">📋 投票履歴</h2>

    <!-- Summary -->
    <div class="summary-grid mb-16">
      <div class="summary-card">
        <div class="summary-label">所持金</div>
        <div class="summary-val text-gold">{{ store.balance.toLocaleString() }}円</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">総投票額</div>
        <div class="summary-val">{{ totalBet.toLocaleString() }}円</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">総払戻額</div>
        <div class="summary-val text-green">{{ totalPayout.toLocaleString() }}円</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">収支</div>
        <div class="summary-val" :class="profit >= 0 ? 'text-green' : 'text-red'">
          {{ profit >= 0 ? '+' : '' }}{{ profit.toLocaleString() }}円
        </div>
      </div>
    </div>

    <!-- Charge / Clear -->
    <div class="action-row mb-16">
      <button class="btn btn-gold btn-sm" @click="recharge">💰 10,000円チャージ</button>
      <button v-if="bets.length > 0" class="btn btn-secondary btn-sm" @click="clearAll">🗑 履歴をクリア</button>
    </div>

    <!-- No bets -->
    <div v-if="bets.length === 0" class="card text-muted" style="text-align:center; padding:32px;">
      <div style="font-size:2rem; margin-bottom:8px;">🎯</div>
      投票履歴がありません。<br>
      <button class="btn btn-primary mt-12" @click="router.push('/')">レース一覧へ</button>
    </div>

    <!-- Bet list -->
    <div v-else class="bet-list">
      <div
        v-for="bet in bets"
        :key="bet.id"
        class="bet-card card"
        :class="'bet-' + bet.status"
      >
        <div class="bet-header">
          <div class="bet-race">{{ bet.raceName }}</div>
          <span class="badge" :class="'badge-' + bet.status">
            {{ bet.status === 'pending' ? '結果待ち' : bet.status === 'win' ? '的中！' : 'ハズレ' }}
          </span>
        </div>
        <div class="bet-detail">
          <span class="bet-type-badge">{{ bet.betType }}</span>
          <span class="bet-horses">馬番: {{ bet.horses.join(' → ') }}</span>
          <span class="bet-amount">¥{{ bet.amount.toLocaleString() }}</span>
          <span v-if="bet.status === 'win'" class="bet-payout text-green">払戻: ¥{{ bet.payout.toLocaleString() }}</span>
        </div>
        <div class="bet-time text-muted">{{ formatDate(bet.placedAt) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
@media (max-width: 600px) {
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
}
.summary-card {
  background: #12122a;
  border: 1px solid #2a2a4a;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}
.summary-label { font-size: 0.75rem; color: #888; margin-bottom: 4px; }
.summary-val { font-size: 1.1rem; font-weight: 800; }

.action-row { display: flex; gap: 8px; }

.bet-list { display: flex; flex-direction: column; gap: 8px; }
.bet-card { transition: all 0.2s; }
.bet-win { border-left: 3px solid #4ade80; }
.bet-lose { border-left: 3px solid #f87171; opacity: 0.7; }
.bet-pending { border-left: 3px solid #5bc0eb; }

.bet-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.bet-race { font-size: 0.88rem; font-weight: 700; }
.bet-detail { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; font-size: 0.85rem; margin-bottom: 6px; }
.bet-type-badge {
  background: #2a2a4a;
  border-radius: 4px;
  padding: 2px 7px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #a78bfa;
}
.bet-horses { color: #ccc; }
.bet-amount { color: #aab; }
.bet-payout { font-weight: 700; }
.bet-time { font-size: 0.75rem; }
</style>
