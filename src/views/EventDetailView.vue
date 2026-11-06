<script setup>
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useEventsStore } from '../stores/events'
import { useSongsStore } from '../stores/songs'

const route = useRoute()
const eventsStore = useEventsStore()
const songsStore = useSongsStore()

const event = computed(() => eventsStore.getEventById(route.params.id))
const showAddForm = ref(false)
const selectedSongId = ref('')
const moment = ref('')

const statusClasses = {
  upcoming: 'bg-gold/10 text-gold-dark',
  planning: 'bg-champagne/40 text-gold-dark',
  completed: 'bg-charcoal/5 text-warm-gray',
}

const availableSongs = computed(() => {
  if (!event.value) return songsStore.songs
  const assignedTitles = new Set(event.value.songs.map(song => song.title))
  return songsStore.songs.filter(song => !assignedTitles.has(song.title))
})

const formattedDate = computed(() => {
  if (!event.value) return ''
  return new Date(`${event.value.date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function handleAddSong() {
  if (!selectedSongId.value || !moment.value.trim()) return
  const song = songsStore.songs.find(s => s.id === Number(selectedSongId.value))
  if (!song) return
  eventsStore.addSongToEvent(
    event.value.id,
    { title: song.title, artist: song.artist, moment: moment.value.trim() }
  )
  selectedSongId.value = ''
  moment.value = ''
  showAddForm.value = false
}
</script>

<template>
  <div v-if="event" class="space-y-6">
    <!-- Back -->
    <RouterLink
      to="/events"
      class="inline-flex items-center gap-2 text-sm text-warm-gray hover:text-gold transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to events
    </RouterLink>

    <!-- Event summary -->
    <div class="card-luxe p-6 lg:p-8">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
            <svg class="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-serif text-2xl text-charcoal">{{ event.couple }}</h3>
            <p class="text-sm text-warm-gray mt-1">{{ event.venue }}</p>
            <p class="text-sm text-warm-gray mt-1">{{ formattedDate }}</p>
          </div>
        </div>
        <span
          class="self-start text-xs px-3 py-1 rounded-full tracking-wider uppercase"
          :class="statusClasses[event.status] || statusClasses.planning"
        >
          {{ event.status }}
        </span>
      </div>
    </div>

    <!-- Song program -->
    <div class="card-luxe p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="font-serif text-xl text-charcoal">Song Program</h3>
          <p class="text-xs text-warm-gray tracking-wider uppercase mt-1">
            {{ event.songs.length }} song{{ event.songs.length === 1 ? '' : 's' }} arranged
          </p>
        </div>
        <button @click="showAddForm = !showAddForm" class="btn-gold text-sm">
          {{ showAddForm ? 'Cancel' : '+ Assign Song' }}
        </button>
      </div>

      <Transition name="fade">
        <div v-if="showAddForm" class="mb-6 p-4 rounded-sm border border-champagne/40 bg-champagne/5">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select v-model="selectedSongId" class="input-luxe sm:col-span-2">
              <option value="">Select a song from the library</option>
              <option v-for="song in availableSongs" :key="song.id" :value="song.id">
                {{ song.title }} — {{ song.artist }}
              </option>
            </select>
            <input v-model="moment" placeholder="Moment (e.g. Processional)" class="input-luxe" />
          </div>
          <button
            @click="handleAddSong"
            :disabled="!selectedSongId || !moment.trim()"
            class="btn-gold text-sm mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add to Program
          </button>
          <p v-if="availableSongs.length === 0" class="text-xs text-warm-gray mt-3">
            All library songs are already assigned to this event.
          </p>
        </div>
      </Transition>

      <div v-if="event.songs.length" class="space-y-3">
        <div
          v-for="song in event.songs"
          :key="song.id"
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-sm border border-champagne/30 hover:border-gold/40 hover:bg-champagne/10 transition-all duration-200"
        >
          <div class="flex items-center gap-4 min-w-0">
            <div class="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="font-medium text-charcoal truncate">{{ song.title }}</p>
              <p class="text-sm text-warm-gray truncate">{{ song.artist }}</p>
            </div>
          </div>
          <div class="flex items-center justify-between sm:justify-end gap-3 sm:shrink-0">
            <span class="text-xs px-3 py-1 rounded-full bg-gold/10 text-gold-dark tracking-wider uppercase">
              {{ song.moment }}
            </span>
            <button
              @click="eventsStore.removeSongFromEvent(event.id, song.id)"
              class="text-warm-gray hover:text-red-400 transition-colors text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      <div v-else class="py-10 text-center text-warm-gray text-sm">
        No songs assigned yet. Build the ceremony program by assigning songs.
      </div>
    </div>
  </div>

  <!-- Not found -->
  <div v-else class="card-luxe p-12 text-center">
    <h3 class="font-serif text-xl text-charcoal mb-2">Event not found</h3>
    <p class="text-sm text-warm-gray mb-6">This matrimony event may have been removed.</p>
    <RouterLink to="/events" class="btn-gold text-sm">Back to events</RouterLink>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
