<script setup lang="ts">
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

function goToChat(query?: string) {
  const trimmed = query?.trim() ?? searchQuery.value.trim()
  router.push({
    path: '/chat',
    query: trimmed ? { query: trimmed } : undefined,
  })
}

function useHint(hint: string) {
  searchQuery.value = hint
  goToChat(hint)
}
</script>

<template>
  <div class="animate-fade-in px-4 pb-12 pt-6 md:px-6">
    <div class="mx-auto max-w-[1320px]">
      <div class="overflow-hidden rounded-[32px] border border-border-0 bg-bg-card shadow-[0_24px_80px_rgba(0,0,0,0.14)]">
        <section class="relative px-6 pb-10 pt-16 text-center md:px-10">
          <div class="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(10,123,101,0.10),transparent_44%)]" />
          <div class="pointer-events-none absolute left-1/2 top-10 h-[220px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_72%)]" />

          <div class="relative mb-6 inline-flex items-center gap-1.5 rounded-full border border-border-0 bg-bg-0 px-4 py-1.5 font-mono text-[11px] font-medium tracking-wide text-accent-text shadow-sm">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Powered by CRIS + TxDOT Data
          </div>

          <h1 class="relative mx-auto mb-4 max-w-[640px] font-serif text-4xl font-normal leading-[1.02] tracking-tight text-text-0 sm:text-5xl md:text-6xl">
            Know your risk<br>before you <span class="text-accent-text">drive</span>.
          </h1>

          <p class="relative mx-auto mb-8 max-w-content text-base leading-relaxed text-text-1 sm:text-[17px]">
            AI-powered crash risk predictions for Texas roads, using historical accident data, real-time weather, and traffic analysis.
          </p>

          <form
            class="relative mx-auto flex w-full max-w-[620px] items-center gap-3 rounded-full border border-border-0 bg-bg-0 py-2 pl-6 pr-2 shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-fast focus-within:border-accent focus-within:shadow-ring"
            @submit.prevent="goToChat()"
          >
            <svg class="h-4 w-4 flex-shrink-0 text-text-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>

            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search a road or location..."
              class="flex-1 border-none bg-transparent text-[15px] text-text-0 outline-none placeholder:text-text-2"
            >

            <button
              type="submit"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-accent text-text-on-accent shadow-[0_12px_24px_rgba(10,123,101,0.24)] transition-all duration-fast hover:scale-105 hover:bg-accent-hover"
              aria-label="Search road risk"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <div class="relative mt-3.5 flex flex-wrap justify-center gap-2">
            <button
              v-for="hint in hints"
              :key="hint"
              type="button"
              class="rounded-full border border-border-0 bg-bg-0 px-3.5 py-1.5 text-xs text-text-1 shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:border-accent hover:bg-accent-muted hover:text-accent-text"
              @click="useHint(hint)"
            >
              {{ hint }}
            </button>
          </div>
        </section>

        <section class="mb-5 px-6 md:px-10">
          <div class="mx-auto flex max-w-layout items-center justify-center rounded-[30px] border border-border-0 bg-bg-1 px-6 py-10 shadow-[0_16px_36px_rgba(0,0,0,0.08)]">
            <div class="max-w-[520px] text-center">
              <div class="mx-auto mb-3 inline-flex rounded-full border border-border-0 bg-bg-card px-3.5 py-1.5 font-mono text-[10px] text-text-1 shadow-xs">
                Interactive map preview coming next
              </div>
              <div class="text-lg font-semibold text-text-0">Search to view road risk</div>
              <div class="mt-2 text-sm leading-relaxed text-text-1">
                For now, use the search bar above to jump directly into a road report while we tighten the home screen layout.
              </div>
            </div>
          </div>
        </section>

        <section class="mx-auto mb-5 max-w-layout px-6 md:px-10">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="(stat, i) in stats"
              :key="stat.label"
              class="animate-fade-up rounded-[24px] border border-border-0 bg-bg-0 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all duration-fast hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(0,0,0,0.12)]"
              :class="`delay-${i + 1}`"
            >
              <div class="mb-0.5 font-serif text-[30px] font-normal tracking-tight text-text-0">
                {{ stat.value }}
              </div>
              <div class="text-sm text-text-1">{{ stat.label }}</div>
            </div>
          </div>
        </section>

        <section class="mx-auto max-w-layout px-6 pb-12 md:px-10">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div
              v-for="feat in features"
              :key="feat.title"
              class="rounded-[24px] border border-border-0 bg-bg-0 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all duration-fast hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(0,0,0,0.12)]"
            >
              <div class="mb-3 inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-accent-muted px-3 font-mono text-xs text-accent-text">
                {{ feat.icon }}
              </div>
              <div class="mb-1 text-base font-semibold text-text-0">{{ feat.title }}</div>
              <div class="text-[13px] leading-relaxed text-text-1">{{ feat.desc }}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
