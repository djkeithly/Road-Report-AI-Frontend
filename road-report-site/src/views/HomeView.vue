<script setup lang="ts">
import MapDisplay from '@/components/MapDisplay.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const stats = [
  { value: '254', label: 'Texas counties monitored' },
  { value: '1.2M+', label: 'CRIS crash records analyzed' },
  { value: '< 2s', label: 'Prediction response time' },
  { value: '5', label: 'Risk tier classifications' },
]

const features = [
  {
    icon: 'RT',
    title: 'Real-Time Analysis',
    desc: 'Live weather from weather.gov and traffic data feed into crash risk predictions updated in real time.',
  },
  {
    icon: 'MAP',
    title: 'Interactive Map',
    desc: 'Visual risk heatmap across Texas with county-level drill-down and road segment highlighting.',
  },
  {
    icon: 'AI',
    title: 'AI Chat',
    desc: 'Ask about any road in natural language. Get structured safety reports with actionable insights.',
  },
]

const hints = ['I-35, Austin', 'US-290, Houston', 'Loop 1604, San Antonio', 'SH-130, Georgetown']

// Replaced goToChat with a geocoding search function
async function searchLocation(query?: string) {
  const trimmed = query?.trim() ?? searchQuery.value.trim()
  if (!trimmed) return

  try {
    // 1. Fetch coordinates from Nominatim API
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`)
    const data = await response.json()

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat)
      const lon = parseFloat(data[0].lon)

      // 2. Calculate a bounding box similar to the UTD size (0.030 lon x 0.020 lat)
      const w = (lon - 0.015).toFixed(5)
      const s = (lat - 0.010).toFixed(5)
      const e = (lon + 0.015).toFixed(5)
      const n = (lat + 0.010).toFixed(5)

      const boundsString = `${w},${s},${e},${n}`

      // 3. Push bounds to the URL so MapDisplay.vue detects the change
      router.push({
        path: '/', // Stay on HomeView
        query: { bounds: boundsString },
      })
    } else {
      alert("Location not found. Please try a different search term.")
    }
  } catch (error) {
    console.error("Geocoding error:", error)
    alert("There was an error connecting to the geocoding service.")
  }
}

function useHint(hint: string) {
  searchQuery.value = hint
  searchLocation(hint)
}
</script>

<template>
  <div class="animate-fade-in px-4 pb-12 pt-6 md:px-6">
    <div class="mx-auto w-full overflow-hidden rounded-[32px] border border-border-0 bg-bg-card shadow-[0_24px_80px_rgba(0,0,0,0.12)]" style="padding: 3rem;">

      <div style="display: flex; flex-direction: column; gap: 3rem;">

        <section class="relative flex flex-col items-center text-center">
          <div class="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(10,123,101,0.10),transparent_44%)]" />

          <div class="relative mb-8 inline-flex items-center gap-1.5 rounded-full border border-accent/15 bg-bg-0 px-4 py-1.5 font-mono text-[10px] font-medium tracking-wide text-accent-text shadow-[0_8px_18px_rgba(0,0,0,0.05)]">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Powered by CRIS + TxDOT Data
          </div>

          <h1 class="relative mb-6 max-w-[640px] text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-text-0 sm:text-5xl md:text-6xl" style="font-family: 'Cormorant Garamond', serif;">
            Know your risk<br>before you <span class="text-accent-text">drive</span>.
          </h1>

          <p class="relative mb-10 max-w-content text-base leading-relaxed text-text-1 sm:text-[17px]">
            AI-powered crash risk predictions for Texas roads, using historical accident data, real-time weather, and traffic analysis.
          </p>

          <form class="relative mb-6 flex w-full max-w-[620px] items-center gap-2.5 rounded-full border border-border-0 bg-bg-0 py-1.5 pl-4 pr-1.5 shadow-[0_14px_30px_rgba(0,0,0,0.08)] transition-all duration-fast focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/50" @submit.prevent="searchLocation()">
            <svg class="h-[1em] w-[1em] flex-shrink-0 text-sm text-text-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input v-model="searchQuery" type="text" placeholder="Search a road or location..." class="flex-1 border-none bg-transparent text-sm text-text-1 outline-none placeholder:text-text-2">
            <button type="submit" class="accent-glow flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-text-on-accent shadow-sm transition-all hover:scale-105 hover:bg-accent-hover" aria-label="Search road risk">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>

          <div class="relative flex flex-wrap justify-center gap-3">
            <button v-for="hint in hints" :key="hint" type="button" class="inline-flex items-center justify-center rounded-full border border-border-0 bg-bg-0 px-3.5 py-1.5 text-center text-xs text-text-1 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:bg-accent-muted hover:text-accent-text hover:shadow-[0_10px_20px_rgba(10,123,101,0.08)]" @click="useHint(hint)">
              {{ hint }}
            </button>
          </div>
        </section>

        <section class="w-full">
          <div class="flex items-center justify-center rounded-[30px] border border-border-0 bg-bg-1 shadow-[0_18px_42px_rgba(0,0,0,0.08)]" style="padding: 3rem;">
            <div class="w-[1080px] text-center">
              <MapDisplay/>
            </div>
          </div>
        </section>

        <section class="w-full">
          <div class="grid w-full grid-cols-4" style="gap: 1.5rem;">
            <div v-for="(stat, i) in stats" :key="stat.label" class="polish-card flex flex-col rounded-[24px] border border-border-0 bg-bg-0 shadow-[0_12px_28px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.08)]" style="padding: 1.5rem;">
              <div class="mb-2 font-serif text-[32px] font-normal tracking-tight text-text-0">{{ stat.value }}</div>
              <div class="text-sm leading-snug text-text-1">{{ stat.label }}</div>
            </div>
          </div>
        </section>

        <section class="w-full">
          <div class="grid w-full grid-cols-3" style="gap: 1.5rem;">
            <div v-for="feat in features" :key="feat.title" class="polish-card flex flex-col rounded-[24px] border border-border-0 bg-bg-0 shadow-[0_12px_28px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.08)]" style="padding: 1.5rem;">
              <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted font-mono text-xs font-semibold text-accent-text">{{ feat.icon }}</div>
              <div class="mb-2 text-[17px] font-semibold text-text-0">{{ feat.title }}</div>
              <div class="text-[13px] leading-relaxed text-text-1">{{ feat.desc }}</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>
