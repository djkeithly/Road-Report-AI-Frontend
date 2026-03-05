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
    desc: 'Live weather and traffic signals feed into crash risk predictions updated continuously.',
  },
  {
    icon: 'MAP',
    title: 'Interactive Map',
    desc: 'View road risk by area with quick drill-down for county and segment-level details.',
  },
  {
    icon: 'AI',
    title: 'AI Chat',
    desc: 'Ask about any road in plain language and get a structured safety summary in seconds.',
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
  <div class="animate-fade-in">
    <section class="text-center pt-12 pb-8 px-6 relative">
      <div
        class="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[500px] h-[300px]
               bg-[radial-gradient(ellipse,var(--accent-muted)_0%,transparent_70%)]
               pointer-events-none"
      />

      <div
        class="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium
               text-accent-text bg-accent-muted border border-accent/15
               px-3.5 py-1 rounded-full mb-5 tracking-wide"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        Powered by CRIS and TxDOT data
      </div>

      <h1
        class="font-serif text-4xl sm:text-5xl font-normal tracking-tight
               leading-[1.07] mb-4 max-w-[600px] mx-auto"
      >
        Know your risk<br>before you <span class="text-accent-text">drive</span>.
      </h1>

      <p class="text-base text-text-1 max-w-content mx-auto mb-8 leading-relaxed">
        AI-powered crash risk predictions for Texas roads using historical accident data,
        real-time weather, and traffic patterns.
      </p>

      <form
        class="flex items-center gap-2.5 bg-bg-input border-[1.5px] border-border-0
               rounded-full py-1.5 pl-5 pr-1.5 w-full max-w-[500px] mx-auto
               shadow-md transition-all duration-fast
               focus-within:border-accent focus-within:shadow-ring"
        @submit.prevent="goToChat()"
      >
        <svg class="w-4 h-4 text-text-3 flex-shrink-0" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search a road or location..."
          class="flex-1 bg-transparent border-none outline-none text-[15px]
                 text-text-0 placeholder:text-text-3"
        />
        <button
          type="submit"
          class="w-10 h-10 rounded-full bg-accent text-text-on-accent
                 flex items-center justify-center flex-shrink-0
                 hover:bg-accent-hover hover:scale-105 transition-all duration-fast"
          aria-label="Search road risk"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </form>

      <div class="flex justify-center gap-1.5 mt-3.5 flex-wrap">
        <button
          v-for="hint in hints"
          :key="hint"
          type="button"
          class="text-xs text-text-2 bg-bg-1 border border-border-1
                 px-2.5 py-1 rounded-full
                 hover:text-accent-text hover:border-accent hover:bg-accent-muted
                 transition-all duration-fast"
          @click="useHint(hint)"
        >
          {{ hint }}
        </button>
      </div>
    </section>

    <section class="px-6 mb-5">
      <div
        class="mx-auto max-w-layout h-[260px] rounded-lg bg-bg-2 border border-border-0
               relative overflow-hidden flex items-center justify-center"
      >
        <div
          class="absolute inset-0 opacity-60"
          style="background-image:
            linear-gradient(var(--border-1) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-1) 1px, transparent 1px);
            background-size: 36px 36px;"
        />
        <p class="relative font-mono text-xs text-text-2">
          Map Integration - Phase 3
        </p>
      </div>
    </section>

    <section class="px-6 mb-5 max-w-layout mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="bg-bg-card border border-border-0 rounded-md p-4 shadow-xs
                 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-fast
                 animate-fade-up"
          :class="`delay-${i + 1}`"
        >
          <div class="font-serif text-[28px] font-normal tracking-tight mb-0.5">
            {{ stat.value }}
          </div>
          <div class="text-xs text-text-2">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <section class="px-6 pb-10 max-w-layout mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          v-for="feat in features"
          :key="feat.title"
          class="bg-bg-card border border-border-0 rounded-md p-5 shadow-xs
                 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-fast"
        >
          <div
            class="min-w-10 h-9 px-2 rounded-sm bg-accent-muted text-accent-text
                   inline-flex items-center justify-center text-xs font-mono mb-3"
          >
            {{ feat.icon }}
          </div>
          <div class="text-sm font-semibold mb-1">{{ feat.title }}</div>
          <div class="text-[13px] text-text-1 leading-relaxed">{{ feat.desc }}</div>
        </div>
      </div>
    </section>
  </div>
</template>