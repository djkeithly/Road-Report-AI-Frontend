<script setup lang="ts">
import AppNav from '@/components/layout/AppNav.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useTheme } from '@/composables/useTheme'

useTheme()
</script>

<template>
  <div class="min-h-screen bg-bg-0 text-text-0 transition-colors duration-slow">
    <div class="relative flex min-h-screen flex-col">
      <div class="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(10,123,101,0.09),transparent_60%)] opacity-90" />
      <AppNav />
      <main class="relative z-10 flex-1">
        <RouterView />
      </main>
      <AppFooter />
    </div>
  </div>
</template>
