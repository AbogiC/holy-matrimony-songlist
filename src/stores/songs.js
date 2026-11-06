import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  addDoc,
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

const SONGS_COLLECTION = 'songs'

function getErrorMessage(error) {
  if (error?.code === 'permission-denied') {
    return 'Only administrators can change songs.'
  }
  return error?.message || 'Something went wrong while syncing songs.'
}

function mapSong(snapshot) {
  const data = snapshot.data()
  return {
    id: snapshot.id,
    title: data.title || '',
    artist: data.artist || '',
    key: data.key || '',
    category: data.category || 'Classical',
    duration: data.duration || '',
  }
}

function buildSongPayload(song) {
  return {
    title: (song.title || '').trim(),
    artist: (song.artist || '').trim(),
    key: (song.key || '').trim(),
    category: song.category || 'Classical',
    duration: (song.duration || '').trim(),
  }
}

export const useSongsStore = defineStore('songs', () => {
  const songs = ref([])
  const loading = ref(true)
  const error = ref('')

  let unsubscribe = null
  let started = false

  const categories = computed(() => [
    ...new Set(songs.value.map((song) => song.category).filter(Boolean)),
  ])

  function subscribe() {
    if (started) return
    started = true
    loading.value = true

    const songsQuery = query(collection(db, SONGS_COLLECTION), orderBy('title'))

    unsubscribe = onSnapshot(
      songsQuery,
      (snapshot) => {
        songs.value = snapshot.docs.map(mapSong)
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

  async function addSong(song) {
    error.value = ''

    try {
      const ref = await addDoc(collection(db, SONGS_COLLECTION), {
        ...buildSongPayload(song),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return ref.id
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    }
  }

  async function updateSong(id, song) {
    error.value = ''

    try {
      await updateDoc(doc(db, SONGS_COLLECTION, String(id)), {
        ...buildSongPayload(song),
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    }
  }

  async function removeSong(id) {
    error.value = ''

    try {
      await deleteDoc(doc(db, SONGS_COLLECTION, String(id)))
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    }
  }

  subscribe()

  return {
    songs,
    categories,
    loading,
    error,
    subscribe,
    stop,
    addSong,
    updateSong,
    removeSong,
  }
})
