<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'

const route = useRoute()
const sidebarOpen = ref(false)
const isPublicPage = computed(() => route.meta.public === true)
</script>

<template>
  <RouterView v-if="isPublicPage" />

  <div v-else class="min-h-screen flex bg-ivory">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <Transition name="page">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-charcoal/40 backdrop-blur-[2px] lg:hidden"
        @click="sidebarOpen = false"
      ></div>
    </Transition>
    <div class="flex-1 flex flex-col lg:ml-64">
      <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>