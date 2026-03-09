<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import { store } from './store/index.js'

const route = useRoute()

const balanceDisplay = computed(() =>
  store.balance.toLocaleString('ja-JP') + '円'
)
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink to="/" class="header-logo">🏇 <span>KEIBA</span>NET</RouterLink>
      <nav class="header-nav">
        <RouterLink to="/" class="nav-link" :class="{ active: route.path === '/' }">本日のレース</RouterLink>
        <RouterLink to="/results" class="nav-link" :class="{ active: route.path === '/results' }">レース結果</RouterLink>
        <RouterLink to="/my-bets" class="nav-link" :class="{ active: route.path === '/my-bets' }">投票履歴</RouterLink>
      </nav>
      <div class="header-balance">💰 {{ balanceDisplay }}</div>
    </div>
  </header>

  <main class="main-content">
    <RouterView />
  </main>

  <footer class="app-footer">
    © 2026 KEIBA NET — デモサイト（架空の競馬投票サービス）
  </footer>
</template>
