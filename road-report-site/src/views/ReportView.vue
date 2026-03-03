<script setup lang="ts">
/**
 * ReportView — Risk Report Detail
 * Wireframe: Screen 3 (Report)
 *
 * Shows: score ring, road info, 4-component breakdown, crash history, alerts
 * TODO: Make dynamic via route param /report/:roadId + API call
 */
import ScoreRing from '@/components/ScoreRing.vue'
import RiskBadge from '@/components/RiskBadge.vue'

// Placeholder data — will come from API in Phase 3
const report = {
  road: 'I-35 Southbound, Austin',
  segment: 'Near Exit 233',
  coords: '30.2672°N, 97.7431°W',
  updatedAt: '3 min ago',
  score: 64,
  tier: 'moderate' as const,
  warning: 'Traffic sensors unavailable for this segment — using the nearest TxDOT AADT estimate.',
  summary:
    'This road segment shows moderate crash risk driven primarily by a high historical accident rate (80th percentile in Travis County) and current weather conditions. The segment averages 127 reportable crashes per year based on CRIS data from 2016–2024. Current rain and rush-hour traffic are elevating the Environmental and Traffic components.',
}

const components = [
  {
    icon: '🛣',
    name: 'Road Condition (C)',
    weight: '× 0.35',
    score: 10,
    max: 30,
    pct: 33,
    color: 'var(--risk-mod)',
    details: [
      { label: 'Construction Zone', value: '+10' },
      { label: 'Potholes', value: '—' },
      { label: 'Lane Closures', value: '—' },
    ],
  },
  {
    icon: '📊',
    name: 'Historical (A)',
    weight: '× 0.30',
    score: 20,
    max: 25,
    pct: 80,
    color: 'var(--risk-high)',
    details: [
      { label: 'Crashes / Year', value: '127' },
      { label: 'County Percentile', value: '80th' },
      { label: 'Data Source', value: 'CRIS' },
    ],
  },
  {
    icon: '☁',
    name: 'Environmental (E)',
    weight: '× 0.20',
    score: 12,
    max: 25,
    pct: 48,
    color: 'var(--risk-mod)',
    details: [
      { label: 'Heavy Rain', value: '+8' },
      { label: 'Low Lighting', value: '+4' },
      { label: 'Source', value: 'weather.gov' },
    ],
  },
  {
    icon: '🚗',
    name: 'Traffic (T)',
    weight: '× 0.15',
    score: 12,
    max: 20,
    pct: 60,
    color: 'var(--risk-high)',
    details: [
      { label: 'High Density', value: '+8' },
      { label: 'Near Intersection', value: '+4' },
      { label: 'Source', value: 'TxDOT AADT' },
    ],
  },
]

const crashHistory = [
  { month: 'Jan', pct: 60 },
  { month: 'Feb', pct: 55 },
  { month: 'Mar', pct: 70 },
  { month: 'Apr', pct: 80 },
  { month: 'May', pct: 85 },
  { month: 'Jun', pct: 90 },
  { month: 'Jul', pct: 75 },
  { month: 'Aug', pct: 70 },
  { month: 'Sep', pct: 65 },
  { month: 'Oct', pct: 95 },
  { month: 'Nov', pct: 80 },
  { month: 'Dec', pct: 100 },
]
</script>

<template>
  <div class="animate-fade-in max-w-layout mx-auto px-6 pt-6 pb-10">

    <!-- ======== HERO: SCORE + ROAD INFO ======== -->
    <section class="flex flex-col sm:flex-row gap-5 mb-6">
      <!-- Score block -->
      <div
        class="bg-bg-card border border-border-0 rounded-lg p-5 text-center
               shadow-sm flex-shrink-0 sm:min-w-[180px]"
      >
        <ScoreRing :score="report.score" :tier="report.tier" size="lg" class="mx-auto" />
        <div class="font-mono text-[9px] font-semibold uppercase tracking-widest text-text-2 mt-2">
          ROAD RISK SCORE
        </div>
        <div class="mt-1.5">
          <RiskBadge :tier="report.tier" label="Moderate Risk" />
        </div>
      </div>

      <!-- Road info -->
      <div class="flex-1">
        <h1 class="font-serif text-2xl font-normal tracking-tight mb-1">
          {{ report.road }}
        </h1>
        <div class="flex flex-wrap gap-3 text-text-2 font-mono text-[11px] mb-3">
          <span>📍 {{ report.segment }}</span>
          <span>📐 {{ report.coords }}</span>
          <span>🕐 Updated {{ report.updatedAt }}</span>
        </div>

        <!-- Warning callout -->
        <div
          class="px-3 py-2 rounded-md border border-[rgba(228,166,59,0.3)]
                 bg-[rgba(228,166,59,0.06)] text-[12px] text-text-1 mb-3"
        >
          ⚠️ {{ report.warning }}
        </div>

        <!-- Summary -->
        <p class="text-[13px] text-text-1 leading-relaxed max-w-content">
          {{ report.summary }}
        </p>
      </div>
    </section>

    <!-- ======== 4-COMPONENT BREAKDOWN ======== -->
    <section class="mb-6">
      <h2 class="text-sm font-semibold mb-3">RRS Component Breakdown</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="c in components"
          :key="c.name"
          class="bg-bg-card border border-border-0 rounded-md p-4 shadow-xs
                 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-fast"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-semibold">{{ c.icon }} {{ c.name }}</span>
            <span class="font-mono text-[9px] text-text-2 bg-bg-1 px-1.5 py-0.5 rounded-full">
              {{ c.weight }}
            </span>
          </div>
          <div class="text-2xl font-bold mb-0.5" :style="{ color: c.color }">
            {{ c.score }}
          </div>
          <div class="font-mono text-[9px] text-text-2 mb-2">of {{ c.max }} possible points</div>
          <div class="h-[5px] rounded-full bg-bg-2 overflow-hidden mb-3">
            <div
              class="h-full rounded-full transition-all duration-[800ms]"
              :style="{ width: c.pct + '%', background: c.color }"
            />
          </div>
          <div class="space-y-1">
            <div
              v-for="d in c.details"
              :key="d.label"
              class="flex justify-between font-mono text-[9px]"
            >
              <span class="text-text-2">{{ d.label }}</span>
              <span class="font-semibold text-text-1">{{ d.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======== CRASH HISTORY ======== -->
    <section class="mb-6">
      <div class="bg-bg-card border border-border-0 rounded-md p-5 shadow-xs">
        <div class="flex justify-between items-center mb-4">
          <div>
            <div class="text-sm font-semibold">Crash History — I-35 S, Exit 233</div>
            <div class="text-xs text-text-2">Monthly average from CRIS data, 2020–2024</div>
          </div>
          <RiskBadge tier="moderate" label="127 avg/yr" />
        </div>
        <div class="flex items-end gap-1.5 h-[100px]">
          <div
            v-for="bar in crashHistory"
            :key="bar.month"
            class="flex-1 flex flex-col items-center gap-1 h-full justify-end"
          >
            <div
              class="w-full rounded-t bg-text-3 transition-all duration-[800ms]"
              :style="{ height: bar.pct + '%' }"
            />
            <span class="font-mono text-[8px] text-text-3">{{ bar.month }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ======== LIVE ALERTS ======== -->
    <section>
      <div class="bg-bg-card border border-border-0 rounded-md p-5 shadow-xs">
        <div class="flex justify-between items-center mb-3">
          <div>
            <div class="text-sm font-semibold">Live Alerts</div>
            <div class="text-xs text-text-2">Road closures, severe weather, and incident reports</div>
          </div>
          <RiskBadge tier="low" label="None" />
        </div>
        <div
          class="border border-dashed border-border-0 rounded-md p-4 text-center
                 bg-accent-muted/30"
        >
          <div class="text-xs font-semibold mb-0.5">No active alerts in this area</div>
          <div class="text-[11px] text-text-2">If new incidents occur, they'll appear here as they're reported.</div>
        </div>
      </div>
    </section>
  </div>
</template>
