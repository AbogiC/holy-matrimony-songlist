<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSongsStore } from '../stores/songs'
import { useAuthStore } from '../stores/auth'
import {
  DRIVE_ACCEPT,
  isAllowedDriveFile,
  preloadGoogleDrive,
  uploadFileToDrive,
} from '../services/googleDrive'

const songsStore = useSongsStore()
const authStore = useAuthStore()
const { songs, categories } = storeToRefs(songsStore)

const searchQuery = ref('')
const selectedCategory = ref('')
const formOpen = ref(false)
const editingId = ref(null)
const saving = ref(false)
const uploading = ref(false)
const formError = ref('')
const songForm = ref(emptySong())
const selectedFile = ref(null)
const fileInput = ref(null)

const isEditing = computed(() => Boolean(editingId.value))

function handleKeydown(event) {
  if (event.key === 'Escape') requestClose()
}

onMounted(() => {
  preloadGoogleDrive()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

watch(formOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

const filteredSongs = computed(() => {
  return songs.value.filter((song) => {
    const query = searchQuery.value.toLowerCase()
    const matchesSearch =
      (song.title || '').toLowerCase().includes(query) ||
      (song.artist || '').toLowerCase().includes(query)
    const matchesCategory = !selectedCategory.value || song.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

function emptySong() {
  return {
    title: '',
    artist: '',
    key: '',
    category: 'Classical',
    duration: '',
    fileId: '',
    fileName: '',
    fileUrl: '',
    fileType: '',
  }
}

function resetFileSelection() {
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function openAddForm() {
  editingId.value = null
  songForm.value = emptySong()
  resetFileSelection()
  formError.value = ''
  formOpen.value = true
}

function openEditForm(song) {
  editingId.value = song.id
  songForm.value = {
    title: song.title || '',
    artist: song.artist || '',
    key: song.key || '',
    category: song.category || 'Classical',
    duration: song.duration || '',
    fileId: song.fileId || '',
    fileName: song.fileName || '',
    fileUrl: song.fileUrl || '',
    fileType: song.fileType || '',
  }
  resetFileSelection()
  formError.value = ''
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
  editingId.value = null
  formError.value = ''
  resetFileSelection()
}

function requestClose() {
  if (!saving.value) closeForm()
}

function handleFileSelected(event) {
  const file = event.target.files?.[0]

  if (!file) {
    resetFileSelection()
    return
  }

  if (!isAllowedDriveFile(file)) {
    formError.value = 'Only PDF or Word documents (.pdf, .doc, .docx) can be uploaded.'
    resetFileSelection()
    return
  }

  selectedFile.value = file
  formError.value = ''
}

function handleRemoveAttachment() {
  songForm.value.fileId = ''
  songForm.value.fileName = ''
  songForm.value.fileUrl = ''
  songForm.value.fileType = ''
  resetFileSelection()
}

async function handleSaveSong() {
  if (!authStore.canManage) return

  const payload = {
    title: songForm.value.title.trim(),
    artist: songForm.value.artist.trim(),
    key: songForm.value.key.trim(),
    category: songForm.value.category,
    duration: songForm.value.duration.trim(),
    fileId: songForm.value.fileId,
    fileName: songForm.value.fileName,
    fileUrl: songForm.value.fileUrl,
    fileType: songForm.value.fileType,
  }

  if (!payload.title || !payload.artist) {
    formError.value = 'Title and artist are required.'
    return
  }

  saving.value = true
  uploading.value = false
  formError.value = ''

  try {
    if (selectedFile.value) {
      uploading.value = true
      const uploaded = await uploadFileToDrive(selectedFile.value)
      payload.fileId = uploaded.id
      payload.fileName = uploaded.name
      payload.fileUrl = uploaded.url
      payload.fileType = uploaded.mimeType
      uploading.value = false
    }

    if (editingId.value) {
      await songsStore.updateSong(editingId.value, payload)
    } else {
      await songsStore.addSong(payload)
    }
    closeForm()
  } catch (err) {
    formError.value = err?.message || songsStore.error || 'Could not save this song.'
  } finally {
    uploading.value = false
    saving.value = false
  }
}

async function handleRemoveSong(song) {
  if (!authStore.canManage) return
  if (!window.confirm(`Remove "${song.title}" from the library?`)) return

  try {
    await songsStore.removeSong(song.id)
  } catch {
    // The store exposes the error message.
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
      <button
        v-if="authStore.canManage"
        class="btn-gold text-sm w-full sm:w-auto"
        @click="openAddForm"
      >
        + Add Song
      </button>
    </div>

    <!-- Guest notice -->
    <div
      v-if="!authStore.canManage"
      class="card-luxe flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5"
    >
      <p class="text-sm text-warm-gray">
        {{
          authStore.isAuthenticated
            ? 'Your account has guest access. Only administrators can add or remove songs.'
            : 'You are viewing the song library as a guest. Sign in with an admin account to manage songs.'
        }}
      </p>
      <RouterLink
        v-if="!authStore.isAuthenticated"
        to="/login"
        class="btn-gold text-sm shrink-0 text-center"
      >
        Sign In
      </RouterLink>
    </div>

    <!-- Add / edit song modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="formOpen && authStore.canManage"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          :aria-label="isEditing ? 'Edit Song' : 'Add New Song'"
        >
          <div
            class="modal-backdrop absolute inset-0 bg-charcoal/50 backdrop-blur-[2px]"
            @click="requestClose"
          ></div>

          <div
            class="modal-panel relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col
                   bg-white shadow-2xl rounded-t-xl sm:rounded-sm"
          >
            <div class="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-champagne/30">
              <h4 class="font-serif text-lg text-charcoal">
                {{ isEditing ? 'Edit Song' : 'Add New Song' }}
              </h4>
              <button
                type="button"
                aria-label="Close"
                class="text-2xl leading-none text-warm-gray hover:text-charcoal transition-colors disabled:opacity-50"
                :disabled="saving"
                @click="requestClose"
              >
                &times;
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input v-model="songForm.title" placeholder="Title" class="input-luxe" />
                <input v-model="songForm.artist" placeholder="Artist" class="input-luxe" />
                <input v-model="songForm.key" placeholder="Key" class="input-luxe" />
                <input v-model="songForm.duration" placeholder="Duration" class="input-luxe" />
                <select v-model="songForm.category" class="input-luxe sm:col-span-2">
                  <option>Classical</option>
                  <option>Contemporary</option>
                  <option>Sacred</option>
                  <option>Pop</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="block text-xs text-warm-gray tracking-[0.12em] uppercase">
                  Sheet Document (PDF / DOC only)
                </label>
                <input
                  ref="fileInput"
                  type="file"
                  :accept="DRIVE_ACCEPT"
                  class="block w-full text-sm text-warm-gray file:mr-4 file:px-4 file:py-2.5 
                         file:rounded-sm file:border-0 file:bg-gold/10 file:text-gold-dark 
                         file:text-sm hover:file:bg-gold/20 cursor-pointer"
                  @change="handleFileSelected"
                />
                <p v-if="selectedFile" class="text-xs text-warm-gray">
                  Ready to upload: <span class="text-charcoal">{{ selectedFile.name }}</span>
                </p>
                <p v-else-if="songForm.fileName" class="text-xs text-warm-gray flex items-center gap-2">
                  <a
                    :href="songForm.fileUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-gold-dark hover:text-gold underline"
                  >
                    {{ songForm.fileName }}
                  </a>
                  <button
                    type="button"
                    class="text-warm-gray hover:text-red-400 transition-colors"
                    @click="handleRemoveAttachment"
                  >
                    Remove
                  </button>
                </p>
              </div>

              <p v-if="formError" role="alert" class="text-sm text-red-600">{{ formError }}</p>
            </div>

            <div
              class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-5 sm:px-6 py-4 
                     border-t border-champagne/30"
            >
              <button
                type="button"
                class="px-4 py-2.5 text-sm border border-champagne/60 rounded-sm text-warm-gray
                       hover:bg-champagne/10 transition-colors disabled:opacity-50"
                :disabled="saving"
                @click="requestClose"
              >
                Cancel
              </button>
              <button
                class="btn-gold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="saving"
                @click="handleSaveSong"
              >
                {{
                  uploading
                    ? 'Uploading to Drive…'
                    : saving
                      ? 'Saving…'
                      : isEditing
                        ? 'Update Song'
                        : 'Save Song'
                }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Firestore error -->
    <div
      v-if="songsStore.error && !formOpen"
      role="alert"
      class="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
    >
      {{ songsStore.error }}
    </div>

    <!-- Song list -->
    <div class="card-luxe overflow-hidden">
      <div v-if="songsStore.loading" class="p-12 text-center text-warm-gray text-sm">
        Loading songs from Firestore…
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-champagne/30">
              <th class="text-left px-6 py-4 text-[10px] text-warm-gray tracking-[0.16em] uppercase font-medium">Title</th>
              <th class="text-left px-6 py-4 text-[10px] text-warm-gray tracking-[0.16em] uppercase font-medium">Artist</th>
              <th class="text-left px-6 py-4 text-[10px] text-warm-gray tracking-[0.16em] uppercase font-medium">Key</th>
              <th class="text-left px-6 py-4 text-[10px] text-warm-gray tracking-[0.16em] uppercase font-medium">Category</th>
              <th class="text-left px-6 py-4 text-[10px] text-warm-gray tracking-[0.16em] uppercase font-medium">Duration</th>
              <th class="text-left px-6 py-4 text-[10px] text-warm-gray tracking-[0.16em] uppercase font-medium">Document</th>
              <th v-if="authStore.canManage" class="px-6 py-4"></th>
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
              <td data-label="Document" class="px-6 py-4 text-sm">
                <a
                  v-if="song.fileUrl"
                  :href="song.fileUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-gold-dark hover:text-gold underline"
                >
                  Open
                </a>
                <span v-else class="text-warm-gray">—</span>
              </td>
              <td data-label="Actions" v-if="authStore.canManage" class="px-6 py-4">
                <div class="flex items-center justify-end gap-3">
                  <button
                    class="text-gold-dark hover:text-gold transition-colors text-sm"
                    @click="openEditForm(song)"
                  >
                    Edit
                  </button>
                  <button
                    class="text-warm-gray hover:text-red-400 transition-colors text-sm"
                    @click="handleRemoveSong(song)"
                  >
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="!songsStore.loading && filteredSongs.length === 0"
        class="p-12 text-center text-warm-gray text-sm"
      >
        No songs found. Add your first song to the library.
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: translateY(32px);
  opacity: 0;
}

@media (min-width: 640px) {
  .modal-enter-from .modal-panel,
  .modal-leave-to .modal-panel {
    transform: translateY(0) scale(0.96);
  }
}

@media (max-width: 639px) {
  .modal-panel {
    padding-bottom: env(safe-area-inset-bottom);
  }
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
