<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { races } from '../data/races.js'
import { store } from '../store/index.js'

const router = useRouter()

const finishedRaces = computed(() => races.filter(r => r.result))

// Get bet result for current user on a race
function getBetResults(raceId) {
  return store.bets.filter(b => b.raceId === raceId)
}
</script>

<template>
  <div>
    <h2 class="page-title">🏆 レース結果</h2>

    <div v-if="finishedRaces.length === 0" class="card text-muted" style="text-align:center; padding:32px;">
      まだ確定したレースはありません。
    </div>

    <div v-else class="results-list">
      <div
        v-for="race in finishedRaces"
        :key="race.id"
        class="result-race-card card"
      >
        <div class="result-race-header">
          <span class="race-num-label">R{{ race.id }}</span>
          <span class="result-race-name">{{ race.name }}</span>
          <span class="badge badge-result">確定</span>
        </div>
        <div class="result-meta text-muted">{{ race.venue }} {{ race.distance }} {{ race.startTime }}</div>

        <!-- Winners -->
        <div class="result-podium">
          <div class="podium-item">
            <div class="podium-rank first-place">🥇 1着</div>
            <div class="podium-num">{{ race.result.first }}番</div>
            <div class="podium-name">{{ race.horses.find(h => h.number === race.result.first)?.name }}</div>
            <div class="podium-jockey text-muted">{{ race.horses.find(h => h.number === race.result.first)?.jockey }}</div>
          </div>
          <div class="podium-item">
            <div class="podium-rank second-place">🥈 2着</div>
            <div class="podium-num">{{ race.result.second }}番</div>
            <div class="podium-name">{{ race.horses.find(h => h.number === race.result.second)?.name }}</div>
            <div class="podium-jockey text-muted">{{ race.horses.find(h => h.number === race.result.second)?.jockey }}</div>
          </div>
          <div class="podium-item">
            <div class="podium-rank third-place">🥉 3着</div>
            <div class="podium-num">{{ race.result.third }}番</div>
            <div class="podium-name">{{ race.horses.find(h => h.number === race.result.third)?.name }}</div>
            <div class="podium-jockey text-muted">{{ race.horses.find(h => h.number === race.result.third)?.jockey }}</div>
          </div>
        </div>

        <!-- Odds table for top 3 -->
        <div class="odds-line mt-8">
          <span class="text-muted" style="font-size:0.78rem;">単勝オッズ: </span>
          <span
            v-for="num in [race.result.first, race.result.second, race.result.third]"
            :key="num"
            class="odds-chip"
          >
            {{ num }}番 <strong class="text-gold">{{ race.horses.find(h => h.number === num)?.odds.toFixed(1) }}</strong>
          </span>
        </div>

        <!-- User bet results for this race -->
        <div v-if="getBetResults(race.id).length > 0" class="my-bets-on-race mt-8">
          <div class="my-bets-title">あなたの投票</div>
          <div
            v-for="bet in getBetResults(race.id)"
            :key="bet.id"
            class="my-bet-row"
          >
            <span class="bet-type-badge">{{ bet.betType }}</span>
            <span>{{ bet.horses.join('→') }}番</span>
            <span class="text-muted">¥{{ bet.amount.toLocaleString() }}</span>
            <span v-if="bet.status === 'win'" class="text-green">的中！払戻 ¥{{ bet.payout.toLocaleString() }}</span>
            <span v-else class="text-red">ハズレ</span>
          </div>
        </div>

        <button class="btn btn-secondary btn-sm mt-8" @click="router.push('/race/' + race.id)">
          詳細を見る
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-list { display: flex; flex-direction: column; gap: 12px; }

.result-race-card { }
.result-race-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}
.race-num-label { font-size: 1rem; font-weight: 800; color: #e63946; }
.result-race-name { font-size: 0.95rem; font-weight: 700; flex: 1; }
.result-meta { font-size: 0.78rem; margin-bottom: 10px; }

.result-podium { display: flex; gap: 12px; flex-wrap: wrap; }
.podium-item {
  background: #1a1a30;
  border-radius: 8px;
  padding: 10px 14px;
  min-width: 100px;
  text-align: center;
}
.podium-rank { font-size: 0.8rem; margin-bottom: 4px; font-weight: 700; }
.podium-num { font-size: 1.2rem; font-weight: 800; }
.podium-name { font-size: 0.85rem; font-weight: 600; margin-top: 2px; }
.podium-jockey { font-size: 0.75rem; margin-top: 2px; }

.odds-line { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.odds-chip {
  background: #1a1a30;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.my-bets-on-race { background: #0d0d1e; border-radius: 6px; padding: 8px 12px; }
.my-bets-title { font-size: 0.78rem; color: #888; margin-bottom: 6px; }
.my-bet-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 0.82rem; padding: 3px 0; }
.bet-type-badge {
  background: #2a2a4a;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 0.76rem;
  font-weight: 700;
  color: #a78bfa;
}
</style>
