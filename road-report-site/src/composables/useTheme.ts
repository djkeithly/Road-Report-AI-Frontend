import { ref, watchEffect } from 'vue'

export type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')
let initialized = false

function initTheme() {
  if (initialized || typeof window === 'undefined') {
    return
  }

  initialized = true
  const stored = localStorage.getItem('rr-theme') as Theme | null
  if (stored) {
    theme.value = stored
  } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark'
  }
}

watchEffect(() => {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.setAttribute('data-theme', theme.value)

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('rr-theme', theme.value)
  }
})

export function useTheme() {
  initTheme()

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(t: Theme) {
    theme.value = t
  }

  return {
    theme,
    toggleTheme,
    setTheme,
  }
}
