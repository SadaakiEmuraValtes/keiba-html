import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/',           component: HomeView },
  { path: '/race/:key',  component: () => import('../views/RaceDetailView.vue') },
  { path: '/win5',       component: () => import('../views/Win5View.vue') },
  { path: '/my-page',   component: () => import('../views/MyPageView.vue') },
  { path: '/login',     component: () => import('../views/LoginView.vue') },
  { path: '/help',      component: () => import('../views/HelpView.vue') },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})
