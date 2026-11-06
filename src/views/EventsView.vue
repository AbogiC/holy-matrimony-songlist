<script setup>
import { ref, computed } from 'vue'
import { useEventsStore } from '../stores/events'

const eventsStore = useEventsStore()
const searchQuery = ref('')
const selectedStatus = ref('')
const showAddForm = ref(false)
const newEvent = ref({ couple: '', date: '', venue: '', status: 'planning' })

const statuses = ['upcoming', 'planning', 'completed']

const filteredEvents = computed(() => {
  return eventsStore.events
    .filter(event => {
      const query = searchQuery.value.toLowerCase()
      const matchesSearch =
        event.couple.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query)
      const matchesStatus = !selectedStatus.value || event.status === selectedStatus.value
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => a.date.localeCompare(b.date))
})

const statusClasses = {
  upcoming: 'bg-gold/10 text-gold-dark',
  planning: 'bg-champagne/40 text-gold-dark',
  completed: 'bg-charcoal/5 text-warm-gray',
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function handleAddEvent() {
  if (newEvent.value.couple && newEvent.value.date && newEvent.value.venue) {
    eventsStore.addEvent({ ...newEvent.value })
    newEvent.value = { couple: '', date: '', venue: '', status: 'planning' }
    showAddForm.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header actions -->
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search couples or venues..."
          class="input-luxe sm:w-72"
        />
        <select v-model="selectedStatus" class="input-luxe sm:w-48 text-warm-gray">
          <option value="">All Statuses</option>
          <option v-for="status in statuses" :key="status" :value="status">
            {{ status.charAt(0).toUpperCase() + status.slice(1) }}
          </option>
        </select>
      </div>
      <button @click="showAddForm = !showAddForm" class="btn-gold text-sm w-full sm:w-auto">
        {{ showAddForm ? 'Cancel' : '+ New Event' }}
      </button>
    </div>

    <!-- Add form -->
    <Transition name="fade">
      <div v-if="showAddForm" class="card-luxe p-6">
        <h4 class="font-serif text-lg mb-4">Create Matrimony Event</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input v-model="newEvent.couple" placeholder="Couple (e.g. Anna & John)" class="input-luxe" />
          <input v-model="newEvent.date" type="date" class="input-luxe" />
          <input v-model="newEvent.venue" placeholder="Venue" class="input-luxe" />
          <select v-model="newEvent.status" class="input-luxe">
            <option v-for="status in statuses" :key="status" :value="status">
              {{ status.charAt(0).toUpperCase() + status.slice(1) }}
            </option>
          </select>
          <button @click="handleAddEvent" class="btn-gold text-sm">Save Event</button>
        </div>
      </div>
    </Transition>

    <!-- Event list -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <RouterLink
        v-for="event in filteredEvents"
        :key="event.id"
        :to="`/events/${event.id}`"
        class="card-luxe reveal-item p-5 sm:p-6 hover:-translate-y-1 transition-all duration-300 group"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3 sm:gap-4 min-w-0">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="font-serif text-lg text-charcoal group-hover:text-gold-dark transition-colors truncate">
                {{ event.couple }}
              </p>
              <p class="text-sm text-warm-gray mt-1 truncate">{{ event.venue }}</p>
              <p class="text-xs text-warm-gray mt-1">{{ formatDate(event.date) }}</p>
            </div>
          </div>
          <span
            class="text-xs px-3 py-1 rounded-full tracking-wider uppercase shrink-0"
            :class="statusClasses[event.status] || statusClasses.planning"
          >
            {{ event.status }}
          </span>
        </div>

        <div class="flex items-center justify-between mt-4 pt-4 border-t border-champagne/30">
          <span class="text-xs text-warm-gray tracking-wider uppercase">
            {{ event.songs.length }} song{{ event.songs.length === 1 ? '' : 's' }} arranged
          </span>
          <span class="flex items-center gap-1 text-sm text-gold group-hover:text-gold-dark transition-colors">
            View details
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </RouterLink>
    </div>

    <div v-if="filteredEvents.length === 0" class="card-luxe p-12 text-center text-warm-gray text-sm">
      No events found. Create your first matrimony event.
    </div>
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
