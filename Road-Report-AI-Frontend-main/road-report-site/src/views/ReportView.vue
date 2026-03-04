<script setup lang="ts">
/**
 * ReportView — AI Risk Report (demo-ready)
 *
 * Reads query param: /report?q=...
 * Shows mock AI classification output (tier + confidence + explanation)
 * Later: replace mockPredict() with backend API call.
 */

import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import RiskBadge from '@/components/RiskBadge.vue'

type RiskTier = 'low' | 'moderate' | 'high' | 'severe'

type AiReport = {
  road: string
  updatedAt: string
  tier: RiskTier
  confidence: number // 0-100
  summary: string
  factors: string[]
}

const route = useRoute()
const q = computed(() => (route.query.q as string | undefined)?.trim() ?? '')

const loading = ref(false)
const error = ref<string | null>(null)
const report = ref<AiReport | null>(null)

const tierToLabel: Record<RiskTier, string> = {
  low: 'Low Risk',
  moderate: 'Moderate Risk',
  high: 'High Risk',
  severe: 'Severe Risk',
}

// Mock AI prediction (replace later with real backend call)
async function mockPredict(roadQuery: string): Promise<AiReport> {
  await new Promise((r) => setTimeout(r, 650))

  // deterministic-ish based on input so demos are repeatable
  let hash = 0
  for (let i = 0; i < roadQuery.length; i++) hash = (hash * 31 + roadQuery.charCodeAt(i)) >>> 0
  const tiers: RiskTier[] = ['low', 'moderate', 'high', 'severe']
  const tier = tiers[hash % tiers.length]
  const confidence = Math.min(95, 70 + (hash % 26)) // 70–95

  const pool = [
    'Historical crash patterns in similar road segments',
    'Traffic exposure proxy (AADT-like feature)',
    'Weather sensitivity proxy (rain/ice conditions)',
    'Intersection density and turning complexity',
    'Speed environment and roadway class',
    'Low-light / nighttime risk proxy',
    'Work-zone likelihood proxy',
  ]
  const factors = [pool[hash % pool.length], pool[(hash + 2) % pool.length], pool[(hash + 4) % pool.length]]

  const summary: Record<RiskTier, string> = {
    low: 'Model indicates relatively low crash likelihood under typical conditions.',
    moderate: 'Model indicates moderate risk; conditions and exposure may elevate crash likelihood.',
    high: 'Model indicates elevated crash likelihood; drive with caution and stay alert.',
    severe: 'Model indicates very high crash likelihood; avoid if possible or use extreme caution.',
  }

  return {
    road: roadQuery,
    updatedAt: 'Just now',
    tier,
    confidence,
    summary: summary[tier],
    factors,
  }
}

async function run() {
  error.value = null
  report.value = null

  if (!q.value) {
    error.value = 'No road provided. Go back to Home and search a road or location.'
    return
  }

  loading.value = true
  try {
    // later: replace with real API call to backend
    report.value = await mockPredict(q.value)
  } catch {
    error.value = 'Failed to generate report. Please try again.'
  } finally {
    loading.value = false
  }
}

watchEffect(() => {
  if (q.value) run()
})
</script>

<template>
  <div class="animate-fade-in max-w-layout mx-auto px-6 pt-6 pb-10">
    <h1 class="font-serif text-2xl font-normal tracking-tight mb-2">Risk Report</h1>

    <div class="text-text-2 font-mono text-[11px] mb-4">
      Query: <span class="text-text-0">{{ q || '[none]' }}</span>
    </div>

    <div v-if="error" class="bg-bg-card border border-border-0 rounded-md p-4 text-sm text-red-500 mb-4">
      {{ error }}
    </div>

    <div v-if="loading" class="bg-bg-card border border-border-0 rounded-md p-4 mb-4">
      <div class="flex items-center gap-3">
        <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
        <div class="text-sm text-text-1">Generating AI prediction…</div>
      </div>
    </div>

    <div v-if="report" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Main card -->
      <div class="bg-bg-card border border-border-0 rounded-lg p-5 shadow-sm">
        <div class="text-xs font-mono text-text-2 mb-2">PREDICTION</div>

        <div class="flex items-center justify-between mb-2">
          <div class="font-serif text-xl">{{ tierToLabel[report.tier] }}</div>
          <RiskBadge :tier="report.tier" :label="tierToLabel[report.tier]" />
        </div>

        <div class="text-sm text-text-1 mb-4">{{ report.summary }}</div>

        <div class="flex items-center justify-between text-sm">
          <span class="text-text-2 font-mono text-[10px]">CONFIDENCE</span>
          <span class="font-semibold">{{ report.confidence }}%</span>
        </div>

        <div class="mt-3 text-xs text-text-2">
          Updated: <span class="font-mono">{{ report.updatedAt }}</span>
        </div>
      </div>

      <!-- Factors -->
      <div class="bg-bg-card border border-border-0 rounded-lg p-5 shadow-sm lg:col-span-2">
        <div class="text-xs font-mono text-text-2 mb-3">MODEL INSIGHTS (PLACEHOLDERS)</div>

        <ul class="space-y-2 text-[13px] text-text-1">
          <li v-for="f in report.factors" :key="f" class="flex gap-2">
            <span class="mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"></span>
            <span>{{ f }}</span>
          </li>
        </ul>

        <div class="mt-5 p-4 rounded-md bg-bg-2 border border-border-1 text-xs text-text-2">
          Note: This page is using a mock AI prediction for demo purposes. It will be replaced with a real backend
          inference API.
        </div>
      </div>
    </div>

    <!-- Map placeholder -->
    <section class="mt-6">
      <div
        class="mx-auto h-[260px] rounded-lg bg-bg-2 border border-border-0
               relative overflow-hidden flex items-center justify-center"
      >
        <div
          class="absolute inset-0 opacity-60"
          style="background-image:
            linear-gradient(var(--border-1) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-1) 1px, transparent 1px);
            background-size: 36px 36px;"
        />
        <p class="relative font-mono text-xs text-text-2">Google Maps + Risk Overlay · Phase 3</p>
      </div>
    </section>
  </div>
</template>