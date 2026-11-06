<script setup>
import { ref, computed } from 'vue'
import { useSongsStore } from '../stores/songs'
import { storeToRefs } from 'pinia'

const songsStore = useSongsStore()
const { songs, categories } = storeToRefs(songsStore)
const searchQuery = ref('')
const selectedCategory = ref('')
const showAddForm = ref(false)
const newSong = ref({ title: '', artist: '', key: '', category: 'Classical', duration: '' })

const filteredSongs = computed(() => {
  return songs.value.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          song.artist.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || song.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const handleAddSong = () => {
  if (newSong.value.title && newSong.value.artist) {
    songsStore.addSong({ ...newSong.value })
    newSong.value = { title: '', artist: '', key: '', category: 'Classical', duration: '' }
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
          placeholder="Search songs..."
          class="w-full sm:w-72 px-4 py-2.5 bg-white border border-champagne/50 rounded-sm 
                 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20"
        />
        <select
          v-model="selectedCategory"
          class="px-4 py-2.5 bg-white border border-champagne/50 rounded-sm text-sm 
                 focus:outline-none focus:border-gold/60 text-warm-gray"
        >
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <button @click="showAddForm = !showAddForm" class="btn-gold text-sm w-full sm:w-auto">
        {{ showAddForm ? 'Cancel' : '+ Add Song' }}
      </button>
    </div>

    <!-- Add form -->
    <Transition name="fade">
      <div v-if="showAddForm" class="card-luxe p-6">
        <h4 class="font-serif text-lg mb-4">Add New Song</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input v-model="newSong.title" placeholder="Title" class="input-luxe" />
          <input v-model="newSong.artist" placeholder="Artist" class="input-luxe" />
          <input v-model="newSong.key" placeholder="Key" class="input-luxe" />
          <select v-model="newSong.category" class="input-luxe">
            <option>Classical</option>
            <option>Contemporary</option>
            <option>Sacred</option>
            <option>Pop</option>
          </select>
          <input v-model="newSong.duration" placeholder="Duration" class="input-luxe" />
          <button @click="handleAddSong" class="btn-gold text-sm">Save Song</button>
        </div>
      </div>
    </Transition>

    <!-- Song list -->
    <div class="card-luxe overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-champagne/30">
              <th class="text-left px-6 py-4 text-[10px] text-warm-gray tracking-[0.16em] uppercase font-medium">Title</th>
              <th class="text-left px-6 py-4 text-[10px] text-warm-gray tracking-[0.16em] uppercase font-medium">Artist</th>
              <th class="text-left px-6 py-4 text-[10px] text-warm-gray tracking-[0.16em] uppercase font-medium">Key</th>
              <th class="text-left px-6 py-4 text-[10px] text-warm-gray tracking-[0.16em] uppercase font-medium">Category</th>
              <th class="text-left px-6 py-4 text-[10px] text-warm-gray tracking-[0.16em] uppercase font-medium">Duration</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="song in filteredSongs" :key="song.id"
                class="border-b border-champagne/20 last:border-0 hover:bg-champagne/5 transition-colors">
              <td data-label="Title" class="px-6 py-4 font-medium text-charcoal">{{ song.title }}</td>
              <td data-label="Artist" class="px-6 py-4 text-sm text-warm-gray">{{ song.artist }}</td>
              <td data-label="Key" class="px-6 py-4 text-sm text-warm-gray">{{ song.key || '—' }}</td>
              <td data-label="Category" class="px-6 py-4">
                <span class="text-xs px-3 py-1 rounded-full bg-gold/10 text-gold-dark">{{ song.category }}</span>
              </td>
              <td data-label="Duration" class="px-6 py-4 text-sm text-warm-gray">{{ song.duration || '—' }}</td>
              <td data-label="Actions" class="px-6 py-4">
                <button @click="songsStore.removeSong(song.id)" 
                        class="text-warm-gray hover:text-red-400 transition-colors text-sm">
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredSongs.length === 0" class="p-12 text-center text-warm-gray text-sm">
        No songs found. Add your first song to the library.
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .overflow-x-auto {
    overflow-x: visible;
  }

  table,
  tbody,
  tbody tr,
  tbody td {
    display: block;
    width: 100%;
  }

  thead {
    display: none;
  }

  tbody tr {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 8px 16px;
  }

  tbody td {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-width: 0;
    padding: 8px 0;
  }

  tbody td::before {
    content: attr(data-label);
    color: #8a817c;
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  tbody td:first-child,
  tbody td:last-child {
    grid-column: 1 / -1;
  }

  tbody td:last-child {
    align-items: flex-end;
  }
}
</style>