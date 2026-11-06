<script setup>
import { ref } from 'vue'

const profile = ref({
  name: 'Ava Bennett',
  email: 'ava@holymatrimony.com',
  role: 'Music Director',
  parish: 'St. Mary\'s Cathedral',
})

const preferences = ref({
  defaultCategory: 'Classical',
  defaultStatus: 'planning',
  emailReminders: true,
  weeklyDigest: false,
})

const saved = ref(false)

function saveSettings() {
  saved.value = true
  window.setTimeout(() => {
    saved.value = false
  }, 2500)
}
</script>

<template>
  <div class="max-w-4xl space-y-6">
    <!-- Profile -->
    <div class="card-luxe p-6 lg:p-8">
      <div class="flex items-start gap-4 mb-6">
        <div class="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center">
          <span class="text-lg font-medium text-gold-dark">
            {{ profile.name.charAt(0) }}
          </span>
        </div>
        <div>
          <h3 class="font-serif text-xl text-charcoal">Profile</h3>
          <p class="text-sm text-warm-gray mt-1">Manage your account details.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="block">
          <span class="text-xs text-warm-gray tracking-wider uppercase">Full Name</span>
          <input v-model="profile.name" class="input-luxe mt-2" />
        </label>
        <label class="block">
          <span class="text-xs text-warm-gray tracking-wider uppercase">Email</span>
          <input v-model="profile.email" type="email" class="input-luxe mt-2" />
        </label>
        <label class="block">
          <span class="text-xs text-warm-gray tracking-wider uppercase">Role</span>
          <input v-model="profile.role" class="input-luxe mt-2" />
        </label>
        <label class="block">
          <span class="text-xs text-warm-gray tracking-wider uppercase">Parish</span>
          <input v-model="profile.parish" class="input-luxe mt-2" />
        </label>
      </div>
    </div>

    <!-- Preferences -->
    <div class="card-luxe p-6 lg:p-8">
      <h3 class="font-serif text-xl text-charcoal">Preferences</h3>
      <p class="text-sm text-warm-gray mt-1 mb-6">Defaults used when creating new events and songs.</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="block">
          <span class="text-xs text-warm-gray tracking-wider uppercase">Default Song Category</span>
          <select v-model="preferences.defaultCategory" class="input-luxe mt-2">
            <option>Classical</option>
            <option>Contemporary</option>
            <option>Sacred</option>
            <option>Pop</option>
          </select>
        </label>
        <label class="block">
          <span class="text-xs text-warm-gray tracking-wider uppercase">Default Event Status</span>
          <select v-model="preferences.defaultStatus" class="input-luxe mt-2">
            <option value="planning">Planning</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </div>

      <div class="mt-6 space-y-4">
        <label class="flex items-center justify-between gap-4 p-4 rounded-sm border border-champagne/30">
          <span>
            <span class="block text-sm font-medium text-charcoal">Email Reminders</span>
            <span class="block text-xs text-warm-gray mt-0.5">Get notified before each matrimony event.</span>
          </span>
          <input
            v-model="preferences.emailReminders"
            type="checkbox"
            class="w-5 h-5 accent-[#C9A96E]"
          />
        </label>
        <label class="flex items-center justify-between gap-4 p-4 rounded-sm border border-champagne/30">
          <span>
            <span class="block text-sm font-medium text-charcoal">Weekly Digest</span>
            <span class="block text-xs text-warm-gray mt-0.5">Receive a summary of upcoming events and songs.</span>
          </span>
          <input
            v-model="preferences.weeklyDigest"
            type="checkbox"
            class="w-5 h-5 accent-[#C9A96E]"
          />
        </label>
      </div>
    </div>

    <!-- Save -->
    <div class="flex items-center gap-4">
      <button @click="saveSettings" class="btn-gold text-sm">Save Changes</button>
      <Transition name="fade">
        <span v-if="saved" class="text-sm text-gold-dark">Settings saved.</span>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
