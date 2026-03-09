<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { races } from '../data/races.js'

const router = useRouter()

const statusLabel = {
  upcoming: '発走前',
  open: '投票受付中',
  closed: '締切',
  result: '確定',
}

const todayStr = (() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${['日','月','火','水','木','金','土'][d.getDay()]}）`
})()

const openCount = computed(() => races.filter(r => r.status === 'open').length)
</script>

<template>
  <div>
    <!-- Hero -->
    <div class="home-hero">
      <div class="hero-date">📅 {{ todayStr }}　東京競馬場</div>
      <div class="hero-title">本日のレース一覧</div>
      <div v-if="openCount > 0" class="hero-badge">
        <span class="badge badge-open">投票受付中 {{ openCount }}レース</span>
      </div>
    </div>

    <!-- Race list -->
    <div class="race-list">
      <div
        v-for="race in races"
        :key="race.id"
        class="race-card card"
        :class="'race-status-' + race.status"
        @click="router.push('/race/' + race.id)"
      >
        <div class="race-card-header">
          <div class="race-num">R{{ race.id }}</div>
          <div class="race-info">
            <div class="race-name">
              {{ race.name }}
              <span v-if="race.grade === 'GI'" class="badge badge-gi">GI</span>
              <span v-else-if="race.grade === 'GII'" class="badge badge-gii">GII</span>
              <span v-else-if="race.grade === 'GIII'" class="badge badge-giii">GIII</span>
            </div>
            <div class="race-meta">
              <span>🏟 {{ race.venue }}</span>
              <span>📏 {{ race.distance }}</span>
              <span>🕐 {{ race.startTime }}</span>
              <span>{{ race.horses.length }}頭</span>
            </div>
          </div>
          <div class="race-status-wrap">
            <span class="badge" :class="'badge-' + race.status">{{ statusLabel[race.status] }}</span>
          </div>
        </div>

        <!-- Result preview -->
        <div v-if="race.result" class="race-result-preview">
          <div class="result-box">
            <div class="result-place">
              <div class="place-label">1着</div>
              <div class="place-num first-place">{{ race.result.first }}番</div>
            </div>
            <div class="result-arrow">→</div>
            <div class="result-place">
              <div class="place-label">2着</div>
              <div class="place-num second-place">{{ race.result.second }}番</div>
            </div>
            <div class="result-arrow">→</div>
            <div class="result-place">
              <div class="place-label">3着</div>
              <div class="place-num third-place">{{ race.result.third }}番</div>
            </div>
            <div class="result-horses-preview">
              <span
                v-for="place in ['first','second','third']"
                :key="place"
                class="result-horse-name"
              >{{ race.horses.find(h => h.number === race.result[place])?.name }}</span>
            </div>
          </div>
        </div>

        <!-- Top 3 odds for open/upcoming -->
        <div v-else-if="race.status === 'open' || race.status === 'upcoming'" class="race-odds-preview">
          <div class="odds-preview-label">人気順</div>
          <div class="odds-preview-list">
            <div
              v-for="horse in [...race.horses].sort((a, b) => a.popularity - b.popularity).slice(0, 5)"
              :key="horse.number"
              class="odds-preview-item"
            >
              <span class="horse-num" :class="horse.popularity <= 3 ? 'pop-' + horse.popularity : 'pop-other'">
                {{ horse.number }}
              </span>
              <span class="odds-preview-name">{{ horse.name }}</span>
              <span class="odds-val" :class="horse.odds < 5 ? 'odds-low' : horse.odds < 15 ? 'odds-mid' : 'odds-high'">
                {{ horse.odds.toFixed(1) }}
              </span>
            </div>
          </div>
        </div>

        <div class="race-card-footer">
          <span class="race-detail-link">詳細・投票 →</span>
        </div>
      </div>
    </div>

    <!-- Charge button -->
    <div class="charge-section">
      <div class="charge-note text-muted">※ このサイトは架空の競馬投票デモサービスです。</div>
    </div>
  </div>
</template>

<style scoped>
.home-hero {
  background: linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border: 1px solid #3a3a6a;
}
.hero-date { font-size: 0.85rem; color: #aab; margin-bottom: 4px; }
.hero-title { font-size: 1.6rem; font-weight: 800; color: #fff; margin-bottom: 8px; }
.hero-badge { display: flex; gap: 8px; flex-wrap: wrap; }

.race-list { display: flex; flex-direction: column; gap: 10px; }

.race-card {
  cursor: pointer;
  transition: all 0.2s;
}
.race-card:hover { transform: translateY(-1px); border-color: #e63946; }
.race-status-open { border-left: 3px solid #4ade80; }
.race-status-upcoming { border-left: 3px solid #5bc0eb; }
.race-status-closed { border-left: 3px solid #666; }
.race-status-result { border-left: 3px solid #f87171; }

.race-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.race-num {
  font-size: 1.2rem;
  font-weight: 800;
  color: #e63946;
  min-width: 32px;
  text-align: center;
}
.race-info { flex: 1; }
.race-name { font-size: 0.95rem; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.race-meta { display: flex; gap: 10px; font-size: 0.78rem; color: #888; flex-wrap: wrap; }
.race-status-wrap { flex-shrink: 0; }

.race-result-preview { margin-top: 10px; }
.result-arrow { color: #666; font-size: 0.8rem; }
.result-horses-preview { display: flex; gap: 8px; flex-wrap: wrap; margin-left: 8px; }
.result-horse-name { font-size: 0.8rem; color: #aab; background: #1a1a30; padding: 2px 6px; border-radius: 4px; }

.race-odds-preview { margin-top: 10px; }
.odds-preview-label { font-size: 0.75rem; color: #888; margin-bottom: 6px; }
.odds-preview-list { display: flex; gap: 8px; flex-wrap: wrap; }
.odds-preview-item { display: flex; align-items: center; gap: 4px; background: #1a1a30; padding: 4px 8px; border-radius: 6px; }
.odds-preview-name { font-size: 0.82rem; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.race-card-footer { margin-top: 10px; text-align: right; }
.race-detail-link { font-size: 0.8rem; color: #e63946; font-weight: 600; }

.charge-section { margin-top: 20px; text-align: center; }
.charge-note { font-size: 0.8rem; }
</style>
