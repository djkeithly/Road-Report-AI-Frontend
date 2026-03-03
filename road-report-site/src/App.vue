<script setup lang="ts">
import AppNav from '@/components/layout/AppNav.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useTheme } from '@/composables/useTheme'

// Initialize theme on app mount
useTheme()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg-0 text-text-0 transition-colors duration-slow">
    <AppNav />
    <main class="flex-1">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
