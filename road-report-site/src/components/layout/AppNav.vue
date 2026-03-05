<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const { theme, toggleTheme } = useTheme()
const isMobileMenuOpen = ref(false)

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/chat', label: 'Chat' },
  { to: '/report', label: 'Report' },
  { to: '/about', label: 'About' },
]

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false
  },
)
</script>

<template>
  <header
    class="sticky top-0 z-50 bg-bg-card border-b border-border-0
           backdrop-blur-lg transition-colors duration-base"
  >
    <nav class="flex items-center h-14 px-5 md:px-8">
      <RouterLink to="/" class="flex items-center gap-2 no-underline">
        <div
          class="w-7 h-7 rounded-md bg-accent text-text-on-accent
                 flex items-center justify-center
                 font-mono text-[10px] font-bold"
        >
          RR
        </div>
        <span class="font-serif text-lg font-medium tracking-tight text-text-0">
          Road Report <em class="text-accent-text">AI</em>
        </span>
      </RouterLink>

      <div class="hidden md:flex items-center gap-1 ml-auto mr-4">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-3 py-1.5 rounded-md text-sm font-medium text-text-2
                 hover:text-text-0 hover:bg-bg-1 transition-colors duration-fast"
          active-class="!text-text-0 !bg-bg-1"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <div class="flex items-center gap-2 ml-auto md:ml-0">
        <button
          type="button"
          @click="toggleTheme"
          class="px-2.5 h-8 rounded-md border border-border-0 text-xs font-medium
                 text-text-2 hover:text-text-0 hover:bg-bg-1
                 transition-colors duration-fast"
          :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
        >
          {{ theme === 'dark' ? 'Light' : 'Dark' }}
        </button>

        <RouterLink
          to="/account"
          class="hidden sm:inline-flex px-3 py-1.5 rounded-md
                 border border-border-0 bg-bg-card text-text-1
                 text-xs font-medium hover:text-text-0 hover:bg-bg-1
                 transition-colors duration-fast"
        >
          Sign in
        </RouterLink>
        <RouterLink
          to="/account?mode=register"
          class="hidden sm:inline-flex px-3 py-1.5 rounded-md
                 bg-accent text-text-on-accent
                 text-xs font-medium hover:bg-accent-hover
                 transition-colors duration-fast"
        >
          Register
        </RouterLink>

        <button
          type="button"
          class="md:hidden w-8 h-8 rounded-md border border-border-0
                 flex items-center justify-center text-text-2 hover:text-text-0"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="mobile-nav-panel"
          aria-label="Toggle navigation menu"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </nav>

    <div
      v-if="isMobileMenuOpen"
      id="mobile-nav-panel"
      class="md:hidden border-t border-border-1 px-5 py-3 bg-bg-0"
    >
      <div class="grid grid-cols-2 gap-2">
        <RouterLink
          v-for="link in navLinks"
          :key="`mobile-${link.to}`"
          :to="link.to"
          class="px-3 py-2 rounded-md text-sm text-text-1 bg-bg-1 hover:text-text-0"
        >
          {{ link.label }}
        </RouterLink>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <RouterLink
          to="/account"
          class="text-center px-3 py-2 rounded-md border border-border-0 text-sm text-text-1"
        >
          Sign in
        </RouterLink>
        <RouterLink
          to="/account?mode=register"
          class="text-center px-3 py-2 rounded-md bg-accent text-text-on-accent text-sm"
        >
          Register
        </RouterLink>
      </div>
    </div>
  </header>
</template>