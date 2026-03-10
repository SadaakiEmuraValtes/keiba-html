<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { TEST_USERS } from '../data/users.js'

const router   = useRouter()
const loginId  = ref('')
const password = ref('')
const error    = ref('')

function submit() {
  error.value = ''
  if (!loginId.value || !password.value) { error.value = 'IDとパスワードを入力してください。'; return }
  if (store.login(loginId.value.trim(), password.value)) {
    router.push('/')
  } else {
    error.value = 'ログインIDまたはパスワードが違います。'
  }
}

function fillAccount(u) {
  loginId.value  = u.loginId
  password.value = 'test1234'
}
</script>

<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-title">🏇 KEIBA NET ログイン</div>
      <div class="login-subtitle">テストアカウントでお試しください</div>

      <form @submit.prevent="submit" class="login-form">
        <label class="form-label">ログインID</label>
        <input v-model="loginId" class="form-input" placeholder="例: yamada" autocomplete="username" />
        <label class="form-label" style="margin-top:12px;">パスワード</label>
        <input v-model="password" type="password" class="form-input" placeholder="パスワード" autocomplete="current-password" />
        <div v-if="error" class="error-msg">{{ error }}</div>
        <button type="submit" class="btn btn-primary login-btn">ログイン</button>
      </form>

      <div class="test-accounts">
        <div class="test-accounts-title">テストアカウント一覧（パスワード共通: test1234）</div>
        <table class="accounts-table">
          <thead><tr><th>氏名</th><th>ログインID</th></tr></thead>
          <tbody>
            <tr v-for="u in TEST_USERS" :key="u.id" class="account-row" @click="fillAccount(u)">
              <td>{{ u.name }}</td>
              <td><code>{{ u.loginId }}</code></td>
            </tr>
          </tbody>
        </table>
        <div class="test-note">行をクリックすると自動入力されます</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrap { display: flex; justify-content: center; padding: 24px 16px; }
.login-card { background:#12122a; border:1px solid #2a2a4a; border-radius:12px; padding:28px 24px; width:100%; max-width:420px; }
.login-title { font-size:1.3rem; font-weight:800; text-align:center; margin-bottom:4px; }
.login-subtitle { font-size:0.8rem; color:#888; text-align:center; margin-bottom:20px; }
.login-form { display:flex; flex-direction:column; }
.form-label { font-size:0.82rem; color:#aab; margin-bottom:4px; }
.form-input { background:#1a1a30; border:1px solid #3a3a5a; border-radius:6px; color:#fff; padding:9px 12px; font-size:0.9rem; }
.form-input:focus { outline:none; border-color:#e63946; }
.error-msg { color:#f87171; font-size:0.82rem; margin-top:10px; }
.login-btn { margin-top:16px; padding:12px; font-size:1rem; }
.test-accounts { margin-top:24px; border-top:1px solid #2a2a4a; padding-top:16px; }
.test-accounts-title { font-size:0.78rem; color:#888; margin-bottom:8px; }
.accounts-table { width:100%; border-collapse:collapse; font-size:0.82rem; }
.accounts-table th { text-align:left; color:#666; padding:4px 6px; font-size:0.75rem; }
.accounts-table td { padding:5px 6px; border-top:1px solid #1e1e3a; }
.account-row { cursor:pointer; }
.account-row:hover td { background:#1e1e36; }
code { background:#1a1a30; padding:1px 5px; border-radius:3px; font-size:0.82rem; color:#a78bfa; }
.test-note { font-size:0.72rem; color:#555; margin-top:6px; }
</style>
