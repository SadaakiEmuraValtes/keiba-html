import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/race/:id', component: () => import('../views/RaceDetailView.vue') },
  { path: '/my-bets', component: () => import('../views/MyBetsView.vue') },
  { path: '/results', component: () => import('../views/ResultsView.vue') },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
