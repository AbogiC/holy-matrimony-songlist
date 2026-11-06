import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEventsStore = defineStore('events', () => {
  const events = ref([
    {
      id: 1,
      couple: 'Sarah & Michael',
      date: '2026-06-15',
      venue: 'St. Mary\'s Cathedral',
      status: 'upcoming',
      songs: [
        { id: 1, title: 'Ave Maria', artist: 'Schubert', moment: 'Processional' },
        { id: 2, title: 'Canon in D', artist: 'Pachelbel', moment: 'Bridal Entrance' },
        { id: 3, title: 'The Prayer', artist: 'Bocelli & Dion', moment: 'Communion' },
      ],
    },
    {
      id: 2,
      couple: 'Emily & James',
      date: '2026-07-22',
      venue: 'Garden Estate',
      status: 'planning',
      songs: [
        { id: 4, title: 'Perfect', artist: 'Ed Sheeran', moment: 'First Dance' },
      ],
    },
    {
      id: 3,
      couple: 'Olivia & David',
      date: '2026-09-10',
      venue: 'Cathedral Basilica',
      status: 'completed',
      songs: [],
    },
  ])

  const upcomingEvents = computed(() =>
    events.value.filter(e => e.status === 'upcoming' || e.status === 'planning')
  )

  const getEventById = (id) => events.value.find(e => e.id === Number(id))

  const addEvent = (event) => {
    events.value.push({ ...event, id: Date.now(), songs: [] })
  }

  const addSongToEvent = (eventId, song) => {
    const event = getEventById(eventId)
    if (event) event.songs.push({ ...song, id: Date.now() })
  }

  const removeSongFromEvent = (eventId, songId) => {
    const event = getEventById(eventId)
    if (event) event.songs = event.songs.filter(s => s.id !== songId)
  }

  const removeEvent = (id) => {
    events.value = events.value.filter(e => e.id !== Number(id))
  }

  return {
    events,
    upcomingEvents,
    getEventById,
    addEvent,
    addSongToEvent,
    removeSongFromEvent,
    removeEvent,
  }
})