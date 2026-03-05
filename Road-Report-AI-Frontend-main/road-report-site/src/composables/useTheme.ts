import { ref, watchEffect } from 'vue'

export type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

/** Initialize theme from system preference */
function initTheme() {
  const stored = localStorage.getItem('rr-theme') as Theme | null
  if (stored) {
    theme.value = stored
  } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark'
  }
}

/** Apply theme to document and persist */
watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('rr-theme', theme.value)
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
