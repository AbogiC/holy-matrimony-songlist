<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const emit = defineEmits(['toggle-sidebar'])

const route = useRoute()
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
      <div class="w-9 h-9 rounded-full bg-gradient-to-br from-champagne to-gold/25 ring-1 ring-gold/20 flex items-center justify-center">
        <span class="text-sm font-medium text-gold-dark">A</span>
      </div>
    </div>
  </header>
</template>