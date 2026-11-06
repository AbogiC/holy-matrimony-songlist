<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const route = useRoute()

const navItems = [
  { name: 'Dashboard', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Calendar', path: '/calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { name: 'Matrimony Events', path: '/events', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { name: 'Song Library', path: '/songs', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
  { name: 'Settings', path: '/settings', authOnly: true, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
]

const visibleNavItems = computed(() =>
  navItems.filter(item => !item.hidden && (!item.authOnly || authStore.isAuthenticated))
)

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 w-64 bg-charcoal text-white 
           transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[12px_0_40px_-24px_rgba(0,0,0,0.65)]"
    :class="open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <div class="flex flex-col h-full">
      <!-- Brand -->
      <div class="relative px-6 py-8 border-b border-white/10 flex items-start justify-between overflow-hidden">
        <div class="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gold/10 blur-2xl pointer-events-none"></div>
        <div>
          <h1 class="relative font-serif text-2xl font-light tracking-wide text-champagne">
            Holy Matrimony
          </h1>
          <p class="relative text-xs text-warm-gray mt-1 tracking-[0.2em] uppercase">Song Arrangement</p>
        </div>
        <button
          @click="emit('close')"
          class="lg:hidden p-1 text-white/60 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-6 space-y-1">
        <RouterLink
          v-for="item in visibleNavItems"
          :key="item.path"
          :to="item.path"
          @click="emit('close')"
          class="group flex items-center gap-3 px-4 py-3 rounded-sm text-sm tracking-wide transition-all duration-300 hover:translate-x-1"
          :class="isActive(item.path) 
            ? 'bg-gold/20 text-champagne border-l-2 border-gold' 
            : 'text-white/70 hover:text-white hover:bg-white/5'"
        >
          <svg class="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" />
          </svg>
          {{ item.name }}
        </RouterLink>
      </nav>

      <!-- Footer -->
      <div class="px-4 py-4 border-t border-white/10">
        <div v-if="authStore.isAuthenticated" class="space-y-1">
          <p
            v-if="!authStore.canManage"
            class="px-2 text-[10px] text-gold/80 tracking-[0.18em] uppercase"
          >
            Guest access · view only
          </p>
          <p class="px-2 text-[10px] text-warm-gray tracking-[0.18em] uppercase">Wedding Season 2026</p>
        </div>
        <div v-else class="space-y-2">
          <p class="px-2 text-[10px] text-warm-gray tracking-[0.18em] uppercase">
            Viewing as guest
          </p>
          <RouterLink
            to="/login"
            class="block rounded-sm bg-gold/15 px-3 py-2 text-center text-xs tracking-wider uppercase text-champagne hover:bg-gold/25 transition-colors"
            @click="emit('close')"
          >
            Sign in to manage
          </RouterLink>
        </div>
      </div>
    </div>
  </aside>
</template>