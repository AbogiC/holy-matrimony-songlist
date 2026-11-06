<script setup>
import { useEventsStore } from '../stores/events'
import { useSongsStore } from '../stores/songs'
import { storeToRefs } from 'pinia'

const eventsStore = useEventsStore()
const songsStore = useSongsStore()
const { upcomingEvents } = storeToRefs(eventsStore)
const { songs } = storeToRefs(songsStore)
</script>

<template>
  <div class="space-y-8">
    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div v-for="(stat, i) in [
        { label: 'Upcoming Events', value: upcomingEvents.length, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { label: 'Songs in Library', value: songs.length, icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
        { label: 'Events This Season', value: eventsStore.events.length, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
        { label: 'Songs Assigned', value: eventsStore.events.reduce((acc, e) => acc + e.songs.length, 0), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      ]" :key="i" class="card-luxe reveal-item p-5 sm:p-6 hover:-translate-y-1" :style="{ animationDelay: `${i * 80}ms` }">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-warm-gray tracking-wider uppercase">{{ stat.label }}</p>
            <p class="text-3xl font-serif text-charcoal mt-2">{{ stat.value }}</p>
          </div>
          <div class="p-2 bg-gold/10 rounded-sm">
            <svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="stat.icon" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Events -->
    <div class="card-luxe p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-serif text-xl sm:text-2xl text-charcoal">Upcoming Matrimony Events</h3>
        <RouterLink to="/events" class="text-xs sm:text-sm text-gold hover:text-gold-dark tracking-wide transition-colors whitespace-nowrap">
          View All →
        </RouterLink>
      </div>
      <div class="space-y-4">
        <RouterLink
          v-for="event in upcomingEvents"
          :key="event.id"
          :to="`/events/${event.id}`"
          class="reveal-item flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-sm border border-champagne/30
                 hover:border-gold/40 hover:bg-champagne/10 hover:translate-x-1 transition-all duration-300 group"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
              <svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-charcoal group-hover:text-gold-dark transition-colors">{{ event.couple }}</p>
              <p class="text-sm text-warm-gray">{{ event.venue }} · {{ event.date }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs px-3 py-1 rounded-full bg-gold/10 text-gold-dark tracking-wider uppercase">
              {{ event.songs.length }} songs
            </span>
            <svg class="w-4 h-4 text-warm-gray group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>