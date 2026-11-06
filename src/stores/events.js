import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const EVENTS_COLLECTION = 'events'

function getErrorMessage(error) {
  if (error?.code === 'permission-denied') {
    return 'Only administrators can change events.'
  }
  return error?.message || 'Something went wrong while syncing events.'
}

function mapEvent(snapshot) {
  const data = snapshot.data()
  return {
    id: snapshot.id,
    couple: data.couple || '',
    date: data.date || '',
    venue: data.venue || '',
    status: data.status || 'planning',
    songs: Array.isArray(data.songs) ? data.songs : [],
  }
}

function buildEventPayload(event) {
  return {
    couple: (event.couple || '').trim(),
    date: event.date || '',
    venue: (event.venue || '').trim(),
    status: event.status || 'planning',
  }
}

export const useEventsStore = defineStore('events', () => {
  const events = ref([])
  const loading = ref(true)
  const error = ref('')

  let unsubscribe = null
  let started = false

  const upcomingEvents = computed(() =>
    events.value.filter((event) => event.status === 'upcoming' || event.status === 'planning')
  )

  const getEventById = (id) => events.value.find((event) => String(event.id) === String(id))

  function subscribe() {
    if (started) return
    started = true
    loading.value = true

    const eventsQuery = query(collection(db, EVENTS_COLLECTION), orderBy('date'))

    unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        events.value = snapshot.docs.map(mapEvent)
        loading.value = false
        error.value = ''
      },
      (err) => {
        error.value = getErrorMessage(err)
        loading.value = false
      }
    )
  }

  function stop() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    started = false
  }

  async function addEvent(event) {
    error.value = ''

    try {
      const payload = {
        ...buildEventPayload(event),
        songs: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      const ref = await addDoc(collection(db, EVENTS_COLLECTION), payload)
      return ref.id
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    }
  }

  async function updateEvent(id, event) {
    error.value = ''

    try {
      await updateDoc(doc(db, EVENTS_COLLECTION, String(id)), {
        ...buildEventPayload(event),
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    }
  }

  async function removeEvent(id) {
    error.value = ''

    try {
      await deleteDoc(doc(db, EVENTS_COLLECTION, String(id)))
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    }
  }

  async function addSongToEvent(eventId, song) {
    error.value = ''

    const newSong = {
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : String(Date.now()),
      title: (song.title || '').trim(),
      artist: (song.artist || '').trim(),
      moment: (song.moment || '').trim(),
      librarySongId: String(song.librarySongId || ''),
      fileUrl: (song.fileUrl || '').trim(),
    }

    try {
      await updateDoc(doc(db, EVENTS_COLLECTION, String(eventId)), {
        songs: arrayUnion(newSong),
        updatedAt: serverTimestamp(),
      })
      return newSong
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    }
  }

  async function removeSongFromEvent(eventId, songId) {
    const event = getEventById(eventId)
    const song = event?.songs.find((item) => String(item.id) === String(songId))

    if (!song) return

    error.value = ''

    try {
      await updateDoc(doc(db, EVENTS_COLLECTION, String(eventId)), {
        songs: arrayRemove({ ...song }),
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    }
  }

  subscribe()

  return {
    events,
    loading,
    error,
    upcomingEvents,
    getEventById,
    subscribe,
    stop,
    addEvent,
    updateEvent,
    removeEvent,
    addSongToEvent,
    removeSongFromEvent,
  }
})
