import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      /* ---- Colors (reference CSS variables for theme switching) ---- */
      colors: {
        bg: {
          0: 'var(--bg-0)',
          1: 'var(--bg-1)',
          2: 'var(--bg-2)',
          3: 'var(--bg-3)',
          card: 'var(--bg-card)',
          'card-hover': 'var(--bg-card-hover)',
          input: 'var(--bg-input)',
          overlay: 'var(--bg-overlay)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          muted: 'var(--accent-muted)',
          text: 'var(--accent-text)',
        },
        text: {
          0: 'var(--text-0)',
          1: 'var(--text-1)',
          2: 'var(--text-2)',
          3: 'var(--text-3)',
          inv: 'var(--text-inv)',
          'on-accent': 'var(--text-on-accent)',
        },
        border: {
          0: 'var(--border-0)',
          1: 'var(--border-1)',
        },
        risk: {
          vlow: 'var(--risk-vlow)',
          low: 'var(--risk-low)',
          mod: 'var(--risk-mod)',
          high: 'var(--risk-high)',
          severe: 'var(--risk-severe)',
        },
      },

      /* ---- Typography ---- */
      fontFamily: {
        sans: ['"DM Sans"', '-apple-system', 'sans-serif'],
        serif: ['"Newsreader"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },

      /* ---- Border radius ---- */
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },

      /* ---- Box shadows ---- */
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        ring: 'var(--shadow-ring)',
      },

      /* ---- Transitions ---- */
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
      },

      /* ---- Max width ---- */
      maxWidth: {
        content: 'var(--content-max)',
        layout: '1140px',
      },
    },
  },
  plugins: [],
} satisfies Config
