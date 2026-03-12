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
    class="sticky top-0 z-50 border-b border-border-0/90 bg-bg-0/90
           backdrop-blur-xl transition-colors duration-base"
  >
    <nav class="mx-auto flex h-14 max-w-layout items-center px-5 md:px-8">
      <RouterLink to="/" class="flex items-center gap-2">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-md bg-accent
                 font-mono text-[10px] font-bold text-text-on-accent"
        >
          RR
        </div>
        <span class="font-serif text-lg font-medium tracking-tight text-text-0">
          Road Report <em class="text-accent-text">AI</em>
        </span>
      </RouterLink>

      <div class="ml-auto mr-4 hidden items-center gap-1 md:flex">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-full px-4 py-2 text-sm font-medium text-text-2
                 transition-all duration-fast hover:bg-bg-1 hover:text-text-0"
          active-class="!bg-bg-1 !text-text-0"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <div class="ml-auto flex items-center gap-2 md:ml-0">
        <button
          type="button"
          @click="toggleTheme"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-border-0 bg-bg-1/80 text-sm text-text-1 transition-all duration-fast hover:border-accent hover:text-accent-text"
          :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
          :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
        >
          <svg v-if="theme === 'dark'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2" />
            <path d="M12 21v2" />
            <path d="m4.22 4.22 1.42 1.42" />
            <path d="m18.36 18.36 1.42 1.42" />
            <path d="M1 12h2" />
            <path d="M21 12h2" />
            <path d="m4.22 19.78 1.42-1.42" />
            <path d="m18.36 5.64 1.42-1.42" />
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3c0 .34-.02.68-.02 1.03A7.77 7.77 0 0 0 18.97 11.8c.35 0 .69-.01 1.03-.02Z" />
          </svg>
        </button>

        <RouterLink
          to="/account"
          class="hidden rounded-full border border-border-0 bg-bg-card/90 px-4 py-2
                 text-xs font-medium text-text-1 shadow-xs transition-all duration-fast
                 hover:border-accent/25 hover:text-text-0 sm:inline-flex"
        >
          Sign in
        </RouterLink>
        <RouterLink
          to="/account?mode=register"
          class="hidden rounded-full bg-accent px-4 py-2 text-xs font-semibold
                 text-text-on-accent shadow-sm transition-all duration-fast
                 hover:bg-accent-hover sm:inline-flex"
        >
          Register
        </RouterLink>

        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-border-0
                 text-text-2 hover:text-text-0 md:hidden"
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
      class="border-t border-border-1 bg-bg-0 px-5 py-4 md:hidden"
    >
      <div class="grid grid-cols-2 gap-2">
        <RouterLink
          v-for="link in navLinks"
          :key="`mobile-${link.to}`"
          :to="link.to"
          class="rounded-full border border-border-0 bg-bg-card px-4 py-2 text-sm text-text-1 shadow-xs"
        >
          {{ link.label }}
        </RouterLink>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <RouterLink
          to="/account"
          class="rounded-full border border-border-0 bg-bg-card px-4 py-2 text-center text-sm text-text-1"
        >
          Sign in
        </RouterLink>
        <RouterLink
          to="/account?mode=register"
          class="rounded-full bg-accent px-4 py-2 text-center text-sm text-text-on-accent"
        >
          Register
        </RouterLink>
      </div>
    </div>
  </header>
</template>



