<script setup>
import { ref, computed } from 'vue'
import { useEventsStore } from '../stores/events'

const eventsStore = useEventsStore()

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const today = new Date()
const viewDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDate = ref(formatDate(today))

const monthLabel = computed(() =>
  viewDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

const monthStart = computed(() =>
  new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1)
)

const daysInMonth = computed(() =>
  new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 0).getDate()
)

const leadingBlanks = computed(() => monthStart.value.getDay())

const days = computed(() => {
  const cells = []
  for (let i = 0; i < leadingBlanks.value; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth.value; day++) {
    cells.push(
      new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), day)
    )
  }
  return cells
})

const eventsByDate = computed(() => {
  const map = {}
  eventsStore.events.forEach(event => {
    if (!map[event.date]) map[event.date] = []
    map[event.date].push(event)
  })
  return map
})

const selectedEvents = computed(() => eventsByDate.value[selectedDate.value] || [])

const monthEvents = computed(() =>
  eventsStore.events
    .filter(event => {
      const date = new Date(`${event.date}T00:00:00`)
      return (
        date.getFullYear() === viewDate.value.getFullYear() &&
        date.getMonth() === viewDate.value.getMonth()
      )
    })
    .sort((a, b) => a.date.localeCompare(b.date))
)

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function changeMonth(offset) {
  viewDate.value = new Date(
    viewDate.value.getFullYear(),
    viewDate.value.getMonth() + offset,
    1
  )
}

function goToToday() {
  viewDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
  selectedDate.value = formatDate(today)
}

function selectDay(day) {
  if (day) selectedDate.value = formatDate(day)
}
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <!-- Calendar -->
    <div class="card-luxe p-6 xl:col-span-2">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="font-serif text-xl text-charcoal">{{ monthLabel }}</h3>
          <p class="text-xs text-warm-gray tracking-wider uppercase mt-1">
            {{ monthEvents.length }} event{{ monthEvents.length === 1 ? '' : 's' }} this month
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="changeMonth(-1)"
            class="p-2 rounded-sm border border-champagne/50 text-warm-gray hover:text-gold hover:border-gold/40 transition-colors"
            aria-label="Previous month"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            @click="goToToday"
            class="px-3 py-2 text-xs tracking-wider uppercase text-gold border border-gold/40 rounded-sm hover:bg-gold/10 transition-colors"
          >
            Today
          </button>
          <button
            @click="changeMonth(1)"
            class="p-2 rounded-sm border border-champagne/50 text-warm-gray hover:text-gold hover:border-gold/40 transition-colors"
            aria-label="Next month"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="day in weekdays"
          :key="day"
          class="text-center text-xs text-warm-gray tracking-wider uppercase py-2"
        >
          {{ day }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <div v-for="(day, index) in days" :key="index" class="min-h-14 sm:min-h-20">
          <button
            v-if="day"
            @click="selectDay(day)"
            class="w-full h-full min-h-14 sm:min-h-20 p-1.5 sm:p-2 rounded-sm border text-left transition-all duration-200"
            :class="[
              formatDate(day) === selectedDate
                ? 'border-gold/60 bg-gold/10'
                : 'border-champagne/20 hover:border-gold/40 hover:bg-champagne/10',
              eventsByDate[formatDate(day)] ? 'bg-champagne/5' : '',
            ]"
          >
            <span
              class="text-sm"
              :class="formatDate(day) === formatDate(today) ? 'text-gold-dark font-semibold' : 'text-charcoal'"
            >
              {{ day.getDate() }}
            </span>
            <div v-if="eventsByDate[formatDate(day)]" class="mt-1 space-y-1">
              <span
                v-for="event in eventsByDate[formatDate(day)]"
                :key="event.id"
                class="hidden sm:block truncate text-[10px] px-1.5 py-0.5 rounded-full bg-gold/15 text-gold-dark"
              >
                {{ event.couple }}
              </span>
              <span class="sm:hidden block w-1.5 h-1.5 rounded-full bg-gold mt-1"></span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Selected day -->
    <div class="space-y-6">
      <div class="card-luxe p-6">
        <h3 class="font-serif text-xl text-charcoal mb-1">Selected Day</h3>
        <p class="text-xs text-warm-gray tracking-wider uppercase mb-4">
          {{ new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}
        </p>

        <div v-if="selectedEvents.length" class="space-y-3">
          <RouterLink
            v-for="event in selectedEvents"
            :key="event.id"
            :to="`/events/${event.id}`"
            class="block p-4 rounded-sm border border-champagne/30 hover:border-gold/40 hover:bg-champagne/10 transition-all duration-200 group"
          >
            <p class="font-medium text-charcoal group-hover:text-gold-dark transition-colors">
              {{ event.couple }}
            </p>
            <p class="text-sm text-warm-gray mt-1">{{ event.venue }}</p>
            <span class="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-gold/10 text-gold-dark tracking-wider uppercase">
              {{ event.songs.length }} songs
            </span>
          </RouterLink>
        </div>
        <p v-else class="text-sm text-warm-gray">No events scheduled for this day.</p>
      </div>

      <div class="card-luxe p-6">
        <h3 class="font-serif text-xl text-charcoal mb-4">This Month</h3>
        <div v-if="monthEvents.length" class="space-y-3">
          <RouterLink
            v-for="event in monthEvents"
            :key="event.id"
            :to="`/events/${event.id}`"
            class="flex items-center gap-3 p-3 rounded-sm hover:bg-champagne/10 transition-colors group"
          >
            <div class="w-10 h-10 rounded-full bg-gold/10 flex flex-col items-center justify-center shrink-0">
              <span class="text-[10px] text-gold-dark uppercase leading-none">
                {{ new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short' }) }}
              </span>
              <span class="text-sm font-medium text-gold-dark leading-tight">
                {{ new Date(`${event.date}T00:00:00`).getDate() }}
              </span>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-charcoal truncate group-hover:text-gold-dark transition-colors">
                {{ event.couple }}
              </p>
              <p class="text-xs text-warm-gray truncate">{{ event.venue }}</p>
            </div>
          </RouterLink>
        </div>
        <p v-else class="text-sm text-warm-gray">No events this month.</p>
      </div>
    </div>
  </div>
</template>
