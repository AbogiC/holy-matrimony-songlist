<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useEventsStore } from '../stores/events'
import { useSongsStore } from '../stores/songs'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()
const songsStore = useSongsStore()
const authStore = useAuthStore()

const event = computed(() => eventsStore.getEventById(route.params.id))
const showAddForm = ref(false)
const selectedSongId = ref('')
const moment = ref('')
const savingSong = ref(false)
const songError = ref('')
const editingMomentSongId = ref('')
const momentDraft = ref('')

const editingEvent = ref(false)
const savingEvent = ref(false)
const eventError = ref('')
const eventForm = ref({ couple: '', date: '', venue: '', status: 'planning' })

const statuses = ['upcoming', 'planning', 'completed']

const statusClasses = {
  upcoming: 'bg-gold/10 text-gold-dark',
  planning: 'bg-champagne/40 text-gold-dark',
  completed: 'bg-charcoal/5 text-warm-gray',
}

const availableSongs = computed(() => {
  if (!event.value) return songsStore.songs
  const assignedTitles = new Set(event.value.songs.map((song) => song.title))
  return songsStore.songs.filter((song) => !assignedTitles.has(song.title))
})

function getSongFileUrl(eventSong) {
  if (eventSong.fileUrl) return eventSong.fileUrl

  const librarySong = eventSong.librarySongId
    ? songsStore.songs.find((song) => String(song.id) === String(eventSong.librarySongId))
    : songsStore.songs.find(
        (song) => song.title === eventSong.title && song.artist === eventSong.artist
      )

  return librarySong?.fileUrl || ''
}

const formattedDate = computed(() => {
  if (!event.value) return ''
  return new Date(`${event.value.date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function openEditEvent() {
  if (!event.value) return
  eventForm.value = {
    couple: event.value.couple,
    date: event.value.date,
    venue: event.value.venue,
    status: event.value.status,
  }
  eventError.value = ''
  editingEvent.value = true
}

function cancelEditEvent() {
  editingEvent.value = false
  eventError.value = ''
}

async function handleUpdateEvent() {
  if (!authStore.canManage || !event.value) return

  const payload = {
    couple: eventForm.value.couple.trim(),
    date: eventForm.value.date,
    venue: eventForm.value.venue.trim(),
    status: eventForm.value.status,
  }

  if (!payload.couple || !payload.date || !payload.venue) {
    eventError.value = 'Couple, date, and venue are required.'
    return
  }

  savingEvent.value = true
  eventError.value = ''

  try {
    await eventsStore.updateEvent(event.value.id, payload)
    editingEvent.value = false
  } catch {
    eventError.value = eventsStore.error || 'Could not update this event.'
  } finally {
    savingEvent.value = false
  }
}

async function handleDeleteEvent() {
  if (!authStore.canManage || !event.value) return
  if (!window.confirm(`Delete the event for ${event.value.couple}?`)) return

  savingEvent.value = true
  eventError.value = ''

  try {
    await eventsStore.removeEvent(event.value.id)
    await router.replace('/events')
  } catch {
    eventError.value = eventsStore.error || 'Could not delete this event.'
  } finally {
    savingEvent.value = false
  }
}

async function handleAddSong() {
  if (!authStore.canManage || !event.value) return
  if (!selectedSongId.value || !moment.value.trim()) return

  const song = songsStore.songs.find((item) => String(item.id) === String(selectedSongId.value))
  if (!song) return

  savingSong.value = true
  songError.value = ''

  try {
    await eventsStore.addSongToEvent(event.value.id, {
      librarySongId: song.id,
      title: song.title,
      artist: song.artist,
      moment: moment.value.trim(),
      fileUrl: song.fileUrl,
    })
    selectedSongId.value = ''
    moment.value = ''
    showAddForm.value = false
  } catch {
    songError.value = eventsStore.error || 'Could not assign this song.'
  } finally {
    savingSong.value = false
  }
}

async function handleRemoveSong(song) {
  if (!authStore.canManage || !event.value) return

  savingSong.value = true
  songError.value = ''

  try {
    await eventsStore.removeSongFromEvent(event.value.id, song.id)
  } catch {
    songError.value = eventsStore.error || 'Could not remove this song.'
  } finally {
    savingSong.value = false
  }
}

function openEditSongMoment(song) {
  editingMomentSongId.value = String(song.id)
  momentDraft.value = song.moment
  songError.value = ''
}

function cancelEditSongMoment() {
  editingMomentSongId.value = ''
  momentDraft.value = ''
}

async function handleUpdateSongMoment(song) {
  if (!authStore.canManage || !event.value || !momentDraft.value.trim()) return

  savingSong.value = true
  songError.value = ''

  try {
    await eventsStore.updateSongMoment(event.value.id, song.id, momentDraft.value)
    cancelEditSongMoment()
  } catch {
    songError.value = eventsStore.error || 'Could not update this song moment.'
  } finally {
    savingSong.value = false
  }
}

async function handleMoveSong(song, direction) {
  if (!authStore.canManage || !event.value) return

  savingSong.value = true
  songError.value = ''

  try {
    await eventsStore.moveSongInEvent(event.value.id, song.id, direction)
  } catch {
    songError.value = eventsStore.error || 'Could not reorder the song program.'
  } finally {
    savingSong.value = false
  }
}
</script>

<template>
  <div v-if="eventsStore.loading" class="card-luxe p-12 text-center text-warm-gray text-sm">
    Loading event from Firestore…
  </div>

  <div v-else-if="event" class="space-y-6">
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

    <!-- Event summary / edit -->
    <div class="card-luxe p-6 lg:p-8">
      <form
        v-if="editingEvent && authStore.canManage"
        class="space-y-4"
        @submit.prevent="handleUpdateEvent"
      >
        <h3 class="font-serif text-xl text-charcoal">Edit Event</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="block">
            <span class="text-xs text-warm-gray tracking-wider uppercase">Couple</span>
            <input v-model="eventForm.couple" class="input-luxe mt-2" />
          </label>
          <label class="block">
            <span class="text-xs text-warm-gray tracking-wider uppercase">Date</span>
            <input v-model="eventForm.date" type="date" class="input-luxe mt-2" />
          </label>
          <label class="block">
            <span class="text-xs text-warm-gray tracking-wider uppercase">Venue</span>
            <input v-model="eventForm.venue" class="input-luxe mt-2" />
          </label>
          <label class="block">
            <span class="text-xs text-warm-gray tracking-wider uppercase">Status</span>
            <select v-model="eventForm.status" class="input-luxe mt-2">
              <option v-for="status in statuses" :key="status" :value="status">
                {{ status.charAt(0).toUpperCase() + status.slice(1) }}
              </option>
            </select>
          </label>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            class="btn-gold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="savingEvent"
          >
            {{ savingEvent ? 'Saving…' : 'Save Changes' }}
          </button>
          <button
            type="button"
            class="text-sm text-warm-gray hover:text-charcoal transition-colors"
            @click="cancelEditEvent"
          >
            Cancel
          </button>
        </div>
        <p v-if="eventError" role="alert" class="text-sm text-red-600">{{ eventError }}</p>
      </form>

      <template v-else>
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="flex items-start gap-4 min-w-0">
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
            <div class="min-w-0">
              <h3 class="font-serif text-2xl text-charcoal">{{ event.couple }}</h3>
              <p class="text-sm text-warm-gray mt-1 break-words">{{ event.venue }}</p>
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

        <div
          v-if="authStore.canManage"
          class="mt-6 pt-4 border-t border-champagne/30 flex flex-wrap items-center gap-4"
        >
          <button
            class="text-sm text-gold-dark hover:text-gold transition-colors"
            @click="openEditEvent"
          >
            Edit Event
          </button>
          <button
            class="text-sm text-warm-gray hover:text-red-400 transition-colors disabled:opacity-50"
            :disabled="savingEvent"
            @click="handleDeleteEvent"
          >
            Delete Event
          </button>
        </div>
        <p v-if="eventError" role="alert" class="mt-3 text-sm text-red-600">{{ eventError }}</p>
      </template>
    </div>

    <!-- Song program -->
    <div class="card-luxe p-6">
      <div class="flex flex-col items-start gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="font-serif text-xl text-charcoal">Song Program</h3>
          <p class="text-xs text-warm-gray tracking-wider uppercase mt-1">
            {{ event.songs.length }} song{{ event.songs.length === 1 ? '' : 's' }} arranged
          </p>
        </div>
        <button
          v-if="authStore.canManage"
          @click="showAddForm = !showAddForm"
          class="btn-gold text-sm"
        >
          {{ showAddForm ? 'Cancel' : '+ Assign Song' }}
        </button>
        <RouterLink
          v-else-if="!authStore.isAuthenticated"
          to="/login"
          class="text-sm text-gold hover:text-gold-dark tracking-wide"
        >
          Sign in to edit
        </RouterLink>
        <span v-else class="text-xs text-warm-gray tracking-wider uppercase">Admin only</span>
      </div>

      <Transition name="fade">
        <div
          v-if="showAddForm && authStore.canManage"
          class="mb-6 p-4 rounded-sm border border-champagne/40 bg-champagne/5"
        >
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
            :disabled="savingSong || !selectedSongId || !moment.trim()"
            class="btn-gold text-sm mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ savingSong ? 'Adding…' : 'Add to Program' }}
          </button>
          <p v-if="availableSongs.length === 0" class="text-xs text-warm-gray mt-3">
            All library songs are already assigned to this event.
          </p>
          <p v-if="songError" role="alert" class="text-sm text-red-600 mt-3">{{ songError }}</p>
        </div>
      </Transition>

      <p v-if="songError && !showAddForm" role="alert" class="text-sm text-red-600 mb-4">
        {{ songError }}
      </p>

      <div v-if="event.songs.length" class="space-y-3">
        <div
          v-for="(song, songIndex) in event.songs"
          :key="song.id"
          class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-sm border border-champagne/30 hover:border-gold/40 hover:bg-champagne/10 transition-all duration-200"
        >
          <component
            :is="getSongFileUrl(song) ? 'a' : 'div'"
            :href="getSongFileUrl(song) || undefined"
            :target="getSongFileUrl(song) ? '_blank' : undefined"
            :rel="getSongFileUrl(song) ? 'noopener noreferrer' : undefined"
            :aria-label="getSongFileUrl(song) ? `Open sheet music for ${song.title}` : undefined"
            class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            :class="getSongFileUrl(song) ? 'cursor-pointer rounded-sm focus-visible:ring-2 focus-visible:ring-gold/60' : ''"
          >
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3 .895-3 2 1.343 2 3 2 3-.895 3-2-1.343-2-3-2-3 .895-3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="font-medium text-charcoal truncate">{{ song.title }}</p>
                <p class="text-sm text-warm-gray truncate">{{ song.artist }}</p>
              </div>
            </div>
            <span class="self-start text-xs px-3 py-1 rounded-full bg-gold/10 text-gold-dark tracking-wider uppercase">
              {{ song.moment }}
            </span>
          </component>
          <div v-if="authStore.canManage" class="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              :aria-label="`Move ${song.title} up`"
              :title="`Move ${song.title} up`"
              :disabled="savingSong || songIndex === 0"
              @click="handleMoveSong(song, 'up')"
              class="p-1 text-warm-gray hover:text-gold-dark transition-colors disabled:opacity-30"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 15 7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              :aria-label="`Move ${song.title} down`"
              :title="`Move ${song.title} down`"
              :disabled="savingSong || songIndex === event.songs.length - 1"
              @click="handleMoveSong(song, 'down')"
              class="p-1 text-warm-gray hover:text-gold-dark transition-colors disabled:opacity-30"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
              </svg>
            </button>
            <button
              type="button"
              :aria-label="`Edit moment for ${song.title}`"
              :title="`Edit moment for ${song.title}`"
              :disabled="savingSong"
              @click="openEditSongMoment(song)"
              class="p-1 text-gold-dark hover:text-gold transition-colors disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m16.862 4.487 2.651 2.651M8 16l8.5-8.5a2.121 2.121 0 0 1 3 3L11 19H8v-3Z" />
              </svg>
            </button>
            <button
              type="button"
              :aria-label="`Remove ${song.title}`"
              :title="`Remove ${song.title}`"
              :disabled="savingSong"
              @click="handleRemoveSong(song)"
              class="p-1 text-warm-gray hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M10 11v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3" />
              </svg>
            </button>
          </div>
          <form
            v-if="authStore.canManage && editingMomentSongId === String(song.id)"
            class="flex w-full flex-col gap-2 sm:flex-row"
            @submit.prevent="handleUpdateSongMoment(song)"
          >
            <input
              v-model="momentDraft"
              :aria-label="`Moment for ${song.title}`"
              class="input-luxe"
              maxlength="100"
              required
            />
            <button
              type="submit"
              :disabled="savingSong || !momentDraft.trim()"
              class="btn-gold text-sm disabled:opacity-50"
            >
              {{ savingSong ? 'Saving…' : 'Save moment' }}
            </button>
            <button
              type="button"
              :disabled="savingSong"
              @click="cancelEditSongMoment"
              class="text-sm text-warm-gray hover:text-charcoal disabled:opacity-50"
            >
              Cancel
            </button>
          </form>
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
