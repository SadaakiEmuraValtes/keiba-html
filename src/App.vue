<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink, RouterView, useRouter } from 'vue-router'
import { store } from './store/index.js'

const route  = useRoute()
const router = useRouter()

function logout() {
  if (!window.confirm('ログアウトしますか？')) return
  store.logout()
  router.push('/')
}

const balanceDisplay = computed(() => store.balance.toLocaleString('ja-JP') + '円')
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink to="/" class="header-logo">🏇 <span>KEIBA</span>NET</RouterLink>

      <nav class="header-nav">
        <RouterLink to="/" class="nav-link" :class="{ active: route.path === '/' }">レース一覧</RouterLink>
        <RouterLink to="/my-page" class="nav-link" :class="{ active: route.path === '/my-page' }">マイページ</RouterLink>
        <RouterLink to="/help" class="nav-link" :class="{ active: route.path === '/help' }">ヘルプ</RouterLink>
      </nav>

      <div class="header-right">
        <template v-if="store.isLoggedIn">
          <div class="header-balance">💰 {{ balanceDisplay }}</div>
          <span class="header-username">{{ store.currentUser?.name }}さん</span>
          <button class="btn-logout" @click="logout">ログアウト</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn-login">ログイン</RouterLink>
        </template>
      </div>
    </div>
  </header>

  <main class="main-content">
    <RouterView />
  </main>

  <footer class="app-footer">
    © 2026 KEIBA NET &nbsp;|&nbsp; 架空の競馬投票デモサービス。実際の馬券購入とは一切無関係です。
    <RouterLink to="/help" style="color:#555; margin-left:8px;">免責事項・ヘルプ</RouterLink>
  </footer>
</template>

<style scoped>
.header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.header-username { font-size: 0.75rem; color: #aab; white-space: nowrap; }
.btn-logout {
  padding: 4px 10px; border-radius: 5px; border: 1px solid #444;
  background: transparent; color: #aab; font-size: 0.75rem; cursor: pointer;
}
.btn-logout:hover { border-color: #22c55e; color: #4ade80; }
.btn-login {
  display: inline-block; padding: 5px 14px; border-radius: 6px;
  background: #22c55e; color: #fff; font-size: 0.82rem; font-weight: 700;
}
.btn-login:hover { background: #16a34a; }
</style>
