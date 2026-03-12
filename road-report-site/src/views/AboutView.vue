<script setup lang="ts">
const dataSources = [
  {
    icon: 'CRIS',
    name: 'TxDOT CRIS',
    desc: 'Crash Investigation System - historical accident records with location, date, time, weather, and road conditions. Exportable as CSV with records back to 2016. 50K entries per query.',
  },
  {
    icon: 'NWS',
    name: 'Weather.gov API',
    desc: 'National Weather Service API providing real-time weather alerts and conditions by zone. Feeds the Environmental Risk component.',
  },
  {
    icon: 'MAP',
    name: 'Google Maps Platform',
    desc: 'Reverse geocoding, Roads API for nearest road matching, and route-level traffic context for presenting risk by corridor.',
  },
  {
    icon: 'AADT',
    name: 'TxDOT AADT',
    desc: 'Annual Average Daily Traffic counts - road-level traffic volume data including the Top 100 most congested Texas roadways dataset.',
  },
]

const formulaComponents = [
  { weight: '35%', name: 'Road Condition (C)', range: '0-30 points' },
  { weight: '30%', name: 'Historical (A)', range: '0-25 points' },
  { weight: '20%', name: 'Environmental (E)', range: '0-25 points' },
  { weight: '15%', name: 'Traffic (T)', range: '0-20 points' },
]

const techStack = [
  { name: 'Vue.js + Vite', desc: 'Frontend framework', icon: 'UI' },
  { name: 'TypeScript', desc: 'Type-safe frontend', icon: 'TS' },
  { name: 'FastAPI', desc: 'Backend REST API', icon: 'API' },
  { name: 'PostgreSQL', desc: 'Database', icon: 'DB' },
  { name: 'PyTorch', desc: 'ML model training', icon: 'ML' },
  { name: 'Pandas + NumPy', desc: 'Data processing', icon: 'DS' },
]

const team = [
  { initials: 'DK', name: 'Dennis Keithly' },
  { initials: 'BS', name: 'Ben Stidham' },
  { initials: 'JR', name: 'Jose Rodas' },
  { initials: 'CC', name: 'Christopher Chaiban' },
  { initials: 'KO', name: "Kade O'Bar" },
]
</script>

<template>
  <div class="animate-fade-in mx-auto max-w-layout px-6 pb-10 pt-8" style="padding: 2rem 1.5rem;">

    <section class="relative mb-10 text-center" style="margin-bottom: 2.5rem;">
      <div class="pointer-events-none absolute left-1/2 top-[-40px] h-[200px] w-[420px] -translate-x-1/2 bg-[radial-gradient(ellipse,var(--accent-muted)_0%,transparent_70%)]" />
      <h1 class="relative mb-3 font-serif text-[42px] font-normal tracking-[-0.03em]" style="margin-bottom: 0.75rem;">About Road Report AI</h1>
      <p class="relative mx-auto max-w-content text-[15px] leading-[1.65] text-text-1">
        We use machine learning to analyze road conditions and historical accident data to predict crash risk levels. The model continuously learns from structured datasets to improve prediction accuracy across all 254 Texas counties.
      </p>
    </section>

    <section class="pb-10" style="margin-bottom: 2.5rem;">
      <h2 class="mb-4 font-serif text-[24px] font-normal tracking-[-0.015em]" style="margin-bottom: 1rem;">Data Sources</h2>
      <div class="grid grid-cols-1 md:grid-cols-2" style="display: grid; gap: 1rem;">
        <div v-for="ds in dataSources" :key="ds.name" class="rounded-[12px] border border-border-0 bg-bg-card shadow-xs transition-all duration-fast hover:-translate-y-0.5 hover:shadow-sm" style="padding: 1.25rem;">
          <div class="mb-[10px] inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-accent-muted font-mono text-[12px] text-accent-text" style="margin-bottom: 10px;">{{ ds.icon }}</div>
          <div class="mb-1 text-[14px] font-semibold" style="margin-bottom: 4px;">{{ ds.name }}</div>
          <div class="text-[12px] leading-[1.5] text-text-1">{{ ds.desc }}</div>
        </div>
      </div>
    </section>

    <section class="pb-10" style="margin-bottom: 2.5rem;">
      <h2 class="mb-4 font-serif text-[24px] font-normal tracking-[-0.015em]" style="margin-bottom: 1rem;">Road Risk Score Formula</h2>
      <div class="rounded-[18px] border border-border-0 bg-bg-card shadow-xs" style="padding: 1.75rem;">
        <div class="mb-5 rounded-[8px] bg-bg-1 text-center font-serif text-[22px] tracking-[-0.01em]" style="margin-bottom: 1.25rem; padding: 0.75rem;">
          RRS = <span class="font-medium text-accent-text">0.35</span>C + <span class="font-medium text-accent-text">0.30</span>A + <span class="font-medium text-accent-text">0.20</span>E + <span class="font-medium text-accent-text">0.15</span>T
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4" style="display: grid; gap: 10px;">
          <div v-for="fc in formulaComponents" :key="fc.name" class="rounded-[8px] border border-border-1 text-center transition-all duration-fast hover:border-border-0 hover:bg-bg-1" style="padding: 14px;">
            <div class="mb-[2px] font-mono text-[20px] font-semibold text-accent-text" style="margin-bottom: 2px;">{{ fc.weight }}</div>
            <div class="mb-[2px] text-[12px] font-semibold" style="margin-bottom: 2px;">{{ fc.name }}</div>
            <div class="font-mono text-[10px] text-text-2">{{ fc.range }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="pb-10" style="margin-bottom: 2.5rem;">
      <h2 class="mb-4 font-serif text-[24px] font-normal tracking-[-0.015em]" style="margin-bottom: 1rem;">Tech Stack</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style="display: grid; gap: 10px;">
        <div v-for="tech in techStack" :key="tech.name" class="rounded-[8px] border border-border-0 bg-bg-card shadow-xs transition-all duration-fast hover:-translate-y-px hover:shadow-sm" style="display: flex; align-items: center; gap: 0.75rem; padding: 14px 16px;">
          <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[4px] bg-bg-1 font-mono text-[12px] text-text-1">{{ tech.icon }}</div>
          <div>
            <div class="text-[13px] font-medium">{{ tech.name }}</div>
            <div class="text-[11px] text-text-2">{{ tech.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="pb-10" style="margin-bottom: 2.5rem;">
      <h2 class="mb-4 font-serif text-[24px] font-normal tracking-[-0.015em]" style="margin-bottom: 1rem;">The Team</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" style="display: grid; gap: 0.75rem;">
        <div v-for="member in team" :key="member.initials" class="rounded-[12px] border border-border-0 bg-bg-card text-center shadow-xs transition-all duration-fast hover:-translate-y-0.5 hover:shadow-sm" style="padding: 1.25rem 1rem;">
          <div class="mx-auto mb-[10px] flex h-12 w-12 items-center justify-center rounded-full bg-bg-2 text-[18px] font-semibold text-text-1" style="margin-bottom: 10px;">{{ member.initials }}</div>
          <div class="text-[13px] font-semibold">{{ member.name }}</div>
        </div>
      </div>
    </section>

  </div>
</template>
