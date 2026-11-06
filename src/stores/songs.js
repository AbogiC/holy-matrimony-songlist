import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSongsStore = defineStore('songs', () => {
  const songs = ref([
    { id: 1, title: 'Ave Maria', artist: 'Franz Schubert', key: 'Bb Major', category: 'Classical', duration: '4:30' },
    { id: 2, title: 'Canon in D', artist: 'Johann Pachelbel', key: 'D Major', category: 'Classical', duration: '5:00' },
    { id: 3, title: 'The Prayer', artist: 'Andrea Bocelli & Celine Dion', key: 'F Major', category: 'Contemporary', duration: '4:15' },
    { id: 4, title: 'Perfect', artist: 'Ed Sheeran', key: 'Ab Major', category: 'Pop', duration: '4:23' },
    { id: 5, title: 'Jesu, Joy of Man\'s Desiring', artist: 'J.S. Bach', key: 'G Major', category: 'Classical', duration: '3:45' },
    { id: 6, title: 'All of Me', artist: 'John Legend', key: 'Ab Major', category: 'Contemporary', duration: '4:30' },
    { id: 7, title: 'Panis Angelicus', artist: 'César Franck', key: 'A Major', category: 'Sacred', duration: '4:00' },
    { id: 8, title: 'Marry You', artist: 'Bruno Mars', key: 'F Major', category: 'Pop', duration: '3:50' },
  ])

  const categories = computed(() => [...new Set(songs.value.map(s => s.category))])

  const addSong = (song) => {
    songs.value.push({ ...song, id: Date.now() })
  }

  const removeSong = (id) => {
    songs.value = songs.value.filter(s => s.id !== id)
  }

  return { songs, categories, addSong, removeSong }
})