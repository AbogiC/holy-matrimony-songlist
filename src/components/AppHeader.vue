<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const menuOpen = ref(false)

const pageTitle = computed(() => {
  const titles = {
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    events: 'Matrimony Events',
    'event-detail': 'Event Details',
    songs: 'Song Library',
    settings: 'Settings',
  }
  return titles[route.name] || 'Holy Matrimony'
})

async function handleLogout() {
  menuOpen.value = false

  try {
    await authStore.logout()
    await router.replace({ name: 'login' })
  } catch {
    // The auth store exposes the error message.
  }
}
</script>

<template>
  <header class="sticky top-0 z-30 h-16 sm:h-20 bg-ivory/85 backdrop-blur-xl border-b border-champagne/40
                 flex items-center justify-between px-4 sm:px-6 lg:px-8">
    <div class="flex items-center gap-4">
      <button
        @click="emit('toggle-sidebar')"
        class="lg:hidden p-2 -ml-2 rounded-full text-warm-gray hover:text-gold hover:bg-gold/10 transition-all"
        aria-label="Open menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div>
        <h2 class="font-serif text-xl sm:text-2xl text-charcoal leading-tight">{{ pageTitle }}</h2>
        <p class="hidden sm:block text-[10px] sm:text-xs text-warm-gray tracking-[0.16em] uppercase mt-0.5">
          {{ new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
        </p>
      </div>
    </div>
    <div class="flex items-center gap-2 sm:gap-4">
      <button class="p-2 rounded-full text-warm-gray hover:text-gold hover:bg-gold/10 transition-all" aria-label="Notifications">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      <div class="relative">
        <button
          class="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-champagne/20 transition-colors"
          :aria-expanded="menuOpen"
          aria-haspopup="menu"
          @click="menuOpen = !menuOpen"
        >
          <img
            v-if="authStore.photoURL"
            :src="authStore.photoURL"
            :alt="authStore.displayName"
            class="w-9 h-9 rounded-full object-cover ring-1 ring-gold/20"
            referrerpolicy="no-referrer"
          />
          <span
            v-else
            class="w-9 h-9 rounded-full bg-gradient-to-br from-champagne to-gold/25 ring-1 ring-gold/20 flex items-center justify-center text-sm font-medium text-gold-dark"
          >
            {{ authStore.initials }}
          </span>
          <span class="hidden md:block max-w-[9rem] truncate text-sm text-charcoal">
            {{ authStore.displayName }}
          </span>
          <svg class="hidden sm:block w-4 h-4 text-warm-gray transition-transform" :class="{ 'rotate-180': menuOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <template v-if="menuOpen">
          <div class="fixed inset-0 z-40" @click="menuOpen = false"></div>
          <div class="absolute right-0 z-50 mt-2 w-64 card-luxe p-2 shadow-xl">
            <div class="px-3 py-3 border-b border-champagne/40">
              <p class="text-sm font-medium text-charcoal truncate">{{ authStore.displayName }}</p>
              <p class="text-xs text-warm-gray truncate">{{ authStore.email }}</p>
              <span class="inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-gold/10 text-gold-dark tracking-[0.16em] uppercase">
                {{ authStore.role }}
              </span>
            </div>
            <RouterLink
              to="/settings"
              class="flex items-center gap-2 px-3 py-2.5 mt-1 text-sm text-charcoal rounded-sm hover:bg-champagne/20 transition-colors"
              @click="menuOpen = false"
            >
              <svg class="w-4 h-4 text-warm-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </RouterLink>
            <button
              class="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-charcoal rounded-sm hover:bg-champagne/20 transition-colors"
              @click="handleLogout"
            >
              <svg class="w-4 h-4 text-warm-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>