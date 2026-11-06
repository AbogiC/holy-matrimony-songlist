import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/calendar', name: 'calendar', component: () => import('../views/CalendarView.vue') },
    { path: '/events', name: 'events', component: () => import('../views/EventsView.vue') },
    { path: '/events/:id', name: 'event-detail', component: () => import('../views/EventDetailView.vue') },
    { path: '/songs', name: 'songs', component: () => import('../views/SongLibraryView.vue') },
    { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
  ],
})
export default router