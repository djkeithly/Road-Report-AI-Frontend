<script setup lang="ts">
import { computed } from 'vue'
import { useRiskScore } from '@/composables/useRiskScore'
import type { RiskTier } from '@/types/risk'

const props = withDefaults(defineProps<{
  score: number
  tier: RiskTier
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

const { getTierColor, getScoreRingOffset } = useRiskScore()

const dimensions = computed(() => {
  const map = { sm: 48, md: 64, lg: 88 }
  return map[props.size]
})

const fontSize = computed(() => {
  const map = { sm: '14px', md: '18px', lg: '26px' }
  return map[props.size]
})

const color = computed(() => getTierColor(props.tier))
const offset = computed(() => getScoreRingOffset(props.score))

// SVG circle: viewBox is always 88×88, radius=40, center=44
const circumference = 2 * Math.PI * 40 // ≈ 251.3
</script>

<template>
  <div
    class="relative flex items-center justify-center flex-shrink-0"
    :style="{ width: `${dimensions}px`, height: `${dimensions}px` }"
  >
    <!-- SVG ring -->
    <svg
      viewBox="0 0 88 88"
      :style="{ width: `${dimensions}px`, height: `${dimensions}px` }"
    >
      <!-- Background ring -->
      <circle
        cx="44" cy="44" r="40"
        fill="none"
        stroke="var(--bg-2)"
        stroke-width="6"
      />
      <!-- Score fill ring -->
      <circle
        cx="44" cy="44" r="40"
        fill="none"
        :stroke="color"
        stroke-width="6"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        transform="rotate(-90 44 44)"
        class="transition-all duration-[1s]"
        style="transition-timing-function: cubic-bezier(0.33, 1, 0.68, 1);"
      />
    </svg>
    <!-- Score number -->
    <span
      class="absolute font-sans font-bold"
      :style="{ fontSize, color }"
    >
      {{ score }}
    </span>
  </div>
</template>
