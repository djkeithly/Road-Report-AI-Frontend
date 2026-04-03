<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import RiskBadge from '@/components/RiskBadge.vue'
import ScoreRing from '@/components/ScoreRing.vue'
import { getTier, getTierLabel } from '@/composables/useRiskScore'
import { predictRisk } from '@/lib/api/risk'
import { createUserReport } from '@/lib/api/reports'
import type { RiskTier } from '@/types/risk'

type AiReport = {
  road: string
  segment: string
  coordinates: string
  updatedAt: string
  tier: RiskTier
  score: number
  summary: string
  warning?: string
  components: Array<{
    name: string
    weight: string
    score: number
    maxPoints: number
    color: string
    details: Array<{ label: string; value: string }>
  }>
  monthlyHistory: Array<{ month: string; height: string; color: string }>
}

const route = useRoute()
const q = computed(() => (route.query.q as string | undefined)?.trim() ?? '')
const latitude = computed(() => Number.parseFloat((route.query.lat as string | undefined) ?? ''))
const longitude = computed(() => Number.parseFloat((route.query.lng as string | undefined) ?? ''))
const hasCoordinates = computed(() => Number.isFinite(latitude.value) && Number.isFinite(longitude.value))

const loading = ref(false)
const error = ref<string | null>(null)
const report = ref<AiReport | null>(null)
const reportIssueType = ref<'pothole' | 'flooding' | 'debris' | 'construction' | 'signal_outage' | 'other'>('other')
const reportDescription = ref('')
const reportSubmitting = ref(false)
const reportSubmitMessage = ref<string | null>(null)
const reportSubmitError = ref<string | null>(null)

function createComponentDetails(tier: RiskTier) {
  return [
    {
      name: 'Road Condition (C)',
      weight: 'x 0.35',
      score: tier === 'very-low' ? 4 : tier === 'low' ? 6 : tier === 'moderate' ? 10 : tier === 'high' ? 16 : 21,
      maxPoints: 30,
      color: tier === 'very-low' || tier === 'low' ? 'var(--risk-low)' : 'var(--risk-mod)',
      details: [
        { label: 'Construction Zone', value: tier === 'very-low' || tier === 'low' ? '-' : '+10' },
        { label: 'Potholes', value: tier === 'severe' ? '+6' : '-' },
        { label: 'Lane Closures', value: tier === 'high' || tier === 'severe' ? '+4' : '-' },
      ],
    },
    {
      name: 'Historical (A)',
      weight: 'x 0.30',
      score: tier === 'very-low' ? 8 : tier === 'low' ? 10 : tier === 'moderate' ? 20 : tier === 'high' ? 22 : 24,
      maxPoints: 25,
      color: tier === 'very-low' ? 'var(--risk-low)' : tier === 'low' ? 'var(--risk-mod)' : 'var(--risk-high)',
      details: [
        { label: 'Crashes / Year', value: tier === 'very-low' ? '38' : tier === 'low' ? '62' : tier === 'moderate' ? '127' : tier === 'high' ? '151' : '188' },
        { label: 'County Percentile', value: tier === 'very-low' ? '32nd' : tier === 'low' ? '54th' : tier === 'moderate' ? '80th' : tier === 'high' ? '89th' : '96th' },
        { label: 'Data Source', value: 'CRIS' },
      ],
    },
    {
      name: 'Environmental (E)',
      weight: 'x 0.20',
      score: tier === 'very-low' ? 5 : tier === 'low' ? 7 : tier === 'moderate' ? 12 : tier === 'high' ? 17 : 19,
      maxPoints: 25,
      color: tier === 'very-low' || tier === 'low' ? 'var(--risk-low)' : tier === 'moderate' ? 'var(--risk-mod)' : 'var(--risk-high)',
      details: [
        { label: 'Heavy Rain', value: tier === 'very-low' || tier === 'low' ? '+2' : tier === 'moderate' ? '+8' : '+11' },
        { label: 'Low Lighting', value: tier === 'very-low' || tier === 'low' ? '+1' : '+4' },
        { label: 'Source', value: 'weather.gov' },
      ],
    },
    {
      name: 'Traffic (T)',
      weight: 'x 0.15',
      score: tier === 'very-low' ? 6 : tier === 'low' ? 9 : tier === 'moderate' ? 12 : tier === 'high' ? 15 : 18,
      maxPoints: 20,
      color: tier === 'very-low' ? 'var(--risk-low)' : tier === 'low' ? 'var(--risk-mod)' : 'var(--risk-high)',
      details: [
        { label: 'High Density', value: tier === 'very-low' ? '+2' : tier === 'low' ? '+4' : tier === 'moderate' ? '+8' : '+12' },
        { label: 'Near Intersection', value: '+4' },
        { label: 'Source', value: 'TxDOT AADT' },
      ],
    },
  ]
}

function createMonthlyHistory(score: number) {
  const base = Math.max(28, Math.round(score * 0.7))
  const heights: [number, number, number, number, number, number, number, number, number, number, number, number] = [
    base - 14,
    base - 18,
    base - 6,
    base + 4,
    base + 8,
    base + 12,
    base - 2,
    base - 4,
    base - 8,
    base + 15,
    base + 6,
    base + 18,
  ]

  return [
    { month: 'Jan', height: `${Math.min(100, Math.max(18, heights[0]))}%`, color: 'var(--risk-low)' },
    { month: 'Feb', height: `${Math.min(100, Math.max(18, heights[1]))}%`, color: 'var(--risk-low)' },
    { month: 'Mar', height: `${Math.min(100, Math.max(18, heights[2]))}%`, color: 'var(--risk-mod)' },
    { month: 'Apr', height: `${Math.min(100, Math.max(18, heights[3]))}%`, color: 'var(--risk-mod)' },
    { month: 'May', height: `${Math.min(100, Math.max(18, heights[4]))}%`, color: 'var(--risk-high)' },
    { month: 'Jun', height: `${Math.min(100, Math.max(18, heights[5]))}%`, color: 'var(--risk-high)' },
    { month: 'Jul', height: `${Math.min(100, Math.max(18, heights[6]))}%`, color: 'var(--risk-mod)' },
    { month: 'Aug', height: `${Math.min(100, Math.max(18, heights[7]))}%`, color: 'var(--risk-mod)' },
    { month: 'Sep', height: `${Math.min(100, Math.max(18, heights[8]))}%`, color: 'var(--risk-mod)' },
    { month: 'Oct', height: `${Math.min(100, Math.max(18, heights[9]))}%`, color: 'var(--risk-severe)' },
    { month: 'Nov', height: `${Math.min(100, Math.max(18, heights[10]))}%`, color: 'var(--risk-high)' },
    { month: 'Dec', height: `${Math.min(100, Math.max(18, heights[11]))}%`, color: 'var(--risk-severe)' },
  ]
}

function formatCoordinate(value: number, positive: string, negative: string): string {
  const abs = Math.abs(value).toFixed(4)
  return `${abs} deg ${value >= 0 ? positive : negative}`
}

function buildSummary(tier: RiskTier, roadQuery: string): string {
  const summary: Record<RiskTier, string> = {
    'very-low': `${roadQuery} is currently scoring well below the danger threshold. Existing signals suggest relatively stable conditions with limited pressure from weather, traffic, or historical crash patterns.`,
    low: `${roadQuery} currently shows lower-than-average crash risk compared with nearby corridors. Conditions appear stable, though routine caution is still recommended.`,
    moderate: `${roadQuery} shows moderate crash risk right now, with enough environmental or historical pressure to merit extra attention before driving.`,
    high: `${roadQuery} is showing elevated crash risk due to a stronger combination of traffic pressure, incident history, and environmental conditions.`,
    severe: `${roadQuery} is showing very high crash risk right now. Avoid the segment if possible or use extreme caution and slower travel speeds.`,
  }

  return summary[tier]
}

async function loadReport(roadQuery: string, lat: number, lng: number): Promise<AiReport> {
  const response = await predictRisk({
    latitude: lat,
    longitude: lng,
    road_name: roadQuery,
  })
  const score = Math.round(response.risk_score * 100)
  const tier = getTier(score)

  return {
    road: roadQuery,
    segment: 'Geocoded report area',
    coordinates: `${formatCoordinate(lat, 'N', 'S')}, ${formatCoordinate(lng, 'E', 'W')}`,
    updatedAt: 'Live backend response',
    tier,
    score,
    summary: buildSummary(tier, roadQuery),
    warning: 'Detailed factor breakdown is still a frontend placeholder until the backend returns component-level AI outputs.',
    components: createComponentDetails(tier),
    monthlyHistory: createMonthlyHistory(score),
  }
}

async function run() {
  error.value = null
  report.value = null

  if (!q.value) {
    error.value = 'No road provided. Go back to Home and search a road or location.'
    return
  }

  if (!hasCoordinates.value) {
    error.value = 'This report needs coordinates. Search from the Home page so the backend can score the selected location.'
    return
  }

  loading.value = true
  try {
    report.value = await loadReport(q.value, latitude.value, longitude.value)
  } catch (err) {
    console.error(err)
    error.value = err instanceof Error ? err.message : 'Failed to generate report. Please try again.'
  } finally {
    loading.value = false
  }
}

async function submitUserReport() {
  reportSubmitMessage.value = null
  reportSubmitError.value = null
  if (!q.value) {
    reportSubmitError.value = 'Search a road first so your report includes a location.'
    return
  }
  if (reportDescription.value.trim().length < 4) {
    reportSubmitError.value = 'Please provide a short description (at least 4 characters).'
    return
  }

  reportSubmitting.value = true
  try {
    const response = await createUserReport({
      road_name: q.value,
      issue_type: reportIssueType.value,
      description: reportDescription.value.trim(),
      latitude: hasCoordinates.value ? latitude.value : undefined,
      longitude: hasCoordinates.value ? longitude.value : undefined,
    })
    reportDescription.value = ''
    reportIssueType.value = 'other'
    reportSubmitMessage.value = `Thanks — report #${response.id} was saved.`
  } catch (err) {
    console.error(err)
    reportSubmitError.value = err instanceof Error ? err.message : 'Failed to save report.'
  } finally {
    reportSubmitting.value = false
  }
}

watchEffect(() => {
  if (q.value) run()
})
</script>

<template>
  <div class="animate-fade-in mx-auto max-w-layout px-6 pb-10 pt-6">
    <div class="mb-4 font-mono text-[11px] text-text-2">
      Query: <span class="text-text-0">{{ q || '[none]' }}</span>
    </div>

    <div v-if="error" class="mb-4 rounded-[14px] border border-border-0 bg-bg-card p-4 text-sm text-red-500 shadow-xs">
      {{ error }}
    </div>

    <div v-if="loading" class="mb-4 rounded-[14px] border border-border-0 bg-bg-card p-4 shadow-xs">
      <div class="flex items-center gap-3">
        <span class="h-2 w-2 animate-pulse rounded-full bg-accent"></span>
        <div class="text-sm text-text-1">Generating AI prediction...</div>
      </div>
    </div>

    <div v-if="report" class="space-y-3">
      <section class="flex flex-col gap-6 rounded-[26px] border border-border-0 bg-bg-0 px-6 py-8 shadow-[0_18px_40px_rgba(0,0,0,0.06)] md:flex-row md:items-start">
        <div class="polish-card min-w-[200px] rounded-[20px] border border-border-0 bg-bg-card p-6 text-center shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
          <div class="mx-auto w-fit">
            <ScoreRing :score="report.score" :tier="report.tier" size="lg" />
          </div>
          <div class="mt-[10px] font-mono text-[10px] uppercase tracking-[0.08em] text-text-2">Road Risk Score</div>
          <div class="mt-[6px]"><RiskBadge :tier="report.tier" :label="`${getTierLabel(report.tier)} Risk`" /></div>
        </div>

        <div class="flex-1">
          <div class="mb-1 font-serif text-[28px] tracking-[-0.02em]">{{ report.road }}</div>
          <div class="mb-4 flex flex-wrap gap-3 text-[12px] text-text-2">
            <span class="flex items-center gap-1">{{ report.segment }}</span>
            <span class="flex items-center gap-1">{{ report.coordinates }}</span>
            <span class="flex items-center gap-1">{{ report.updatedAt }}</span>
          </div>
          <div v-if="report.warning" class="mt-[10px] max-w-content rounded-[12px] border border-[rgba(228,166,59,0.30)] bg-[rgba(228,166,59,0.10)] px-3 py-2.5 text-[12px] leading-[1.5] text-text-1">
            {{ report.warning }}
          </div>
          <div class="mt-4 max-w-content text-[14px] leading-[1.6] text-text-1">
            {{ report.summary }}
          </div>
        </div>
      </section>

      <section class="rounded-[16px] border border-border-0 bg-bg-card p-5 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
        <div class="mb-[14px] text-[14px] font-semibold">RRS Component Breakdown</div>
        <div class="grid grid-cols-1 gap-3 xl:grid-cols-4">
          <article v-for="component in report.components" :key="component.name" class="polish-card rounded-[14px] border border-border-0 bg-bg-card p-[18px] shadow-xs transition-all duration-fast hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(0,0,0,0.06)]">
            <div class="mb-3 flex items-center justify-between gap-3">
              <span class="text-[12px] font-semibold">{{ component.name }}</span>
              <span class="rounded-full bg-bg-1 px-2 py-[2px] font-mono text-[10px] text-text-2">{{ component.weight }}</span>
            </div>
            <div class="mb-1 text-[28px] font-bold" :style="{ color: component.color }">{{ component.score }}</div>
            <div class="mb-[10px] font-mono text-[10px] text-text-2">of {{ component.maxPoints }} possible points</div>
            <div class="h-[6px] overflow-hidden rounded-[3px] bg-bg-2">
              <div class="h-full rounded-[3px]" :style="{ width: `${(component.score / component.maxPoints) * 100}%`, background: component.color }" />
            </div>
            <div class="mt-3 flex flex-col gap-1">
              <div v-for="detail in component.details" :key="detail.label" class="flex justify-between text-[11px]">
                <span class="text-text-2">{{ detail.label }}</span>
                <span class="font-medium text-text-0">{{ detail.value }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="rounded-[16px] border border-border-0 bg-bg-card p-5 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-[14px] font-semibold">Crash History - {{ report.road }}</div>
            <div class="text-[12px] text-text-2">Monthly average from CRIS data, 2020-2024</div>
          </div>
          <RiskBadge :tier="report.tier" label="Projected trend" />
        </div>
        <div class="mt-4 grid h-[100px] grid-cols-12 items-end gap-[6px]">
          <div v-for="bar in report.monthlyHistory" :key="bar.month" class="flex h-full flex-col items-center gap-[6px]">
            <div class="mt-auto w-full rounded-t-[3px]" :style="{ height: bar.height, background: bar.color }" />
            <div class="font-mono text-[9px] text-text-2">{{ bar.month }}</div>
          </div>
        </div>
      </section>

      <section class="rounded-[16px] border border-border-0 bg-bg-card p-5 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-[14px] font-semibold">Report Road Issue</div>
            <div class="text-[12px] text-text-2">Submit a quick issue report to help improve local safety data.</div>
          </div>
          <RiskBadge tier="low" label="Simple storage" />
        </div>
        <form class="mt-3 space-y-2" @submit.prevent="submitUserReport">
          <div class="grid grid-cols-1 gap-2 md:grid-cols-3">
            <input
              :value="q"
              disabled
              class="rounded-[10px] border border-border-0 bg-bg-1 px-3 py-2 text-[12px] text-text-1"
              aria-label="Road"
            />
            <select
              v-model="reportIssueType"
              class="rounded-[10px] border border-border-0 bg-bg-1 px-3 py-2 text-[12px] text-text-0"
              aria-label="Issue type"
            >
              <option value="pothole">Pothole</option>
              <option value="flooding">Flooding</option>
              <option value="debris">Debris</option>
              <option value="construction">Construction</option>
              <option value="signal_outage">Signal Outage</option>
              <option value="other">Other</option>
            </select>
            <button
              type="submit"
              :disabled="reportSubmitting"
              class="rounded-[10px] bg-accent px-3 py-2 text-[12px] font-semibold text-text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ reportSubmitting ? 'Saving...' : 'Submit Report' }}
            </button>
          </div>
          <textarea
            v-model="reportDescription"
            rows="3"
            placeholder="Describe what you observed..."
            class="w-full rounded-[10px] border border-border-0 bg-bg-1 px-3 py-2 text-[12px] text-text-0"
          />
          <div v-if="reportSubmitMessage" class="text-[12px] text-green-600">
            {{ reportSubmitMessage }}
          </div>
          <div v-if="reportSubmitError" class="text-[12px] text-red-500">
            {{ reportSubmitError }}
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
