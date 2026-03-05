<script setup lang="ts">
/**
 * AboutView — About Page
 * Wireframe: Screen 4 (About)
 *
 * Sections: Data Sources, RRS Formula, Tech Stack, Team
 */

const dataSources = [
  {
    icon: '📊',
    name: 'TxDOT CRIS',
    desc: 'Crash Investigation System — historical accident records with location, date, time, weather, road conditions. Exportable as CSV, records back to 2016. 50K entries per query.',
  },
  {
    icon: '🌤',
    name: 'Weather.gov API',
    desc: 'National Weather Service API providing real-time weather alerts and conditions by zone. Free with registration. Feeds the Environmental Risk component.',
  },
  {
    icon: '🗺',
    name: 'Google Maps Platform',
    desc: 'Reverse geocoding (coordinates → addresses), Roads API for nearest road matching, and RouteTravelAdvisory for real-time traffic data.',
  },
  {
    icon: '🚗',
    name: 'TxDOT AADT',
    desc: 'Annual Average Daily Traffic counts — road-level traffic volume data. Includes the Top 100 most congested Texas roadways dataset.',
  },
]

const formulaComponents = [
  { weight: '35%', name: 'Road Condition (C)', range: '0–30 points' },
  { weight: '30%', name: 'Historical (A)', range: '0–25 points' },
  { weight: '20%', name: 'Environmental (E)', range: '0–25 points' },
  { weight: '15%', name: 'Traffic (T)', range: '0–20 points' },
]

const techStack = [
  { name: 'Vue.js + Vite', desc: 'Frontend framework', icon: '⚡' },
  { name: 'TypeScript', desc: 'Type-safe frontend', icon: '🎨' },
  { name: 'FastAPI', desc: 'Backend REST API', icon: '🐍' },
  { name: 'PostgreSQL', desc: 'Database', icon: '🐘' },
  { name: 'PyTorch', desc: 'ML model training', icon: '🔥' },
  { name: 'Pandas + NumPy', desc: 'Data processing', icon: '🐼' },
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
  <div class="animate-fade-in max-w-layout mx-auto px-6 pt-6 pb-10 space-y-10">

    <!-- ======== DATA SOURCES ======== -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Data Sources</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="ds in dataSources"
          :key="ds.name"
          class="bg-bg-card border border-border-0 rounded-md p-4 shadow-xs
                 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-fast"
        >
          <div
            class="w-8 h-8 rounded-md bg-bg-1 flex items-center justify-center
                   text-base mb-2"
          >
            {{ ds.icon }}
          </div>
          <div class="text-sm font-semibold mb-1">{{ ds.name }}</div>
          <div class="text-[11px] text-text-1 leading-relaxed">{{ ds.desc }}</div>
        </div>
      </div>
    </section>

    <!-- ======== RRS FORMULA ======== -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Road Risk Score Formula</h2>
      <div class="bg-bg-card border border-border-0 rounded-md p-5 shadow-xs text-center">
        <div class="font-mono text-lg font-semibold tracking-wide mb-5">
          RRS =
          <span class="text-accent-text">0.35</span>C +
          <span class="text-accent-text">0.30</span>A +
          <span class="text-accent-text">0.20</span>E +
          <span class="text-accent-text">0.15</span>T
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div
            v-for="fc in formulaComponents"
            :key="fc.name"
            class="border border-border-1 rounded-md p-3"
          >
            <div class="font-mono text-xl font-bold text-accent-text">{{ fc.weight }}</div>
            <div class="text-[11px] font-semibold mt-0.5">{{ fc.name }}</div>
            <div class="font-mono text-[9px] text-text-2">{{ fc.range }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======== TECH STACK ======== -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Tech Stack</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="tech in techStack"
          :key="tech.name"
          class="bg-bg-card border border-border-0 rounded-md p-3.5 shadow-xs
                 flex items-center gap-3
                 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-fast"
        >
          <div class="w-8 h-8 rounded-md bg-bg-1 flex items-center justify-center text-sm flex-shrink-0">
            {{ tech.icon }}
          </div>
          <div>
            <div class="text-xs font-semibold">{{ tech.name }}</div>
            <div class="text-[10px] text-text-2">{{ tech.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======== TEAM ======== -->
    <section>
      <h2 class="text-lg font-semibold mb-4">The Team</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          v-for="member in team"
          :key="member.initials"
          class="bg-bg-card border border-border-0 rounded-md p-4 text-center shadow-xs
                 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-fast"
        >
          <div
            class="w-10 h-10 rounded-full bg-bg-2 mx-auto mb-2
                   flex items-center justify-center
                   text-sm font-semibold text-text-1"
          >
            {{ member.initials }}
          </div>
          <div class="text-xs font-semibold">{{ member.name }}</div>
        </div>
      </div>
    </section>
  </div>
</template>
