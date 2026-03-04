<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <nav
    class="sticky top-0 z-50 flex items-center h-14 px-5 md:px-8
           bg-bg-card border-b border-border-0
           backdrop-blur-lg transition-colors duration-base"
  >
    <!-- Brand -->
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

    <!-- Nav links (hidden on mobile) -->
    <div class="hidden md:flex items-center gap-1 ml-auto mr-4">
      <RouterLink
        v-for="link in [
          { to: '/', label: 'Home' },
          { to: '/chat', label: 'Chat' },
          { to: '/report', label: 'Report' },
          { to: '/about', label: 'About' },
        ]"
        :key="link.to"
        :to="link.to"
        class="px-3 py-1.5 rounded-md text-sm font-medium text-text-2
               hover:text-text-0 hover:bg-bg-1 transition-colors duration-fast"
        active-class="!text-text-0 !bg-bg-1"
      >
        {{ link.label }}
      </RouterLink>
    </div>

    <!-- Right side: theme toggle + auth buttons -->
    <div class="flex items-center gap-2 ml-auto md:ml-0">
      <!-- Theme toggle -->
      <button
        @click="toggleTheme"
        class="w-8 h-8 rounded-full border border-border-0
               flex items-center justify-center
               text-text-2 hover:text-text-0 hover:border-border-0
               transition-all duration-fast"
        :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
      >
        {{ theme === 'dark' ? '☀' : '☾' }}
      </button>

      <!-- Auth buttons (placeholder) -->
      <button
        class="hidden sm:inline-flex px-3 py-1.5 rounded-md
               border border-border-0 bg-bg-card text-text-1
               text-xs font-medium hover:text-text-0
               transition-colors duration-fast"
      >
        Sign in
      </button>
      <button
        class="hidden sm:inline-flex px-3 py-1.5 rounded-md
               bg-accent text-text-on-accent
               text-xs font-medium hover:bg-accent-hover
               transition-colors duration-fast"
      >
        Register
      </button>

      <!-- Mobile menu button (TODO: implement slide-out drawer) -->
      <button
        class="md:hidden w-8 h-8 rounded-md border border-border-0
               flex items-center justify-center text-text-2"
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
</template>
