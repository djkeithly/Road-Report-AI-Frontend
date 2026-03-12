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
  const map = { sm: 56, md: 72, lg: 88 }
  return map[props.size]
})

const fontSize = computed(() => {
  const map = { sm: '18px', md: '22px', lg: '26px' }
  return map[props.size]
})

const strokeWidth = computed(() => (props.size === 'lg' ? 5 : props.size === 'sm' ? 5 : 5))
const color = computed(() => getTierColor(props.tier))
const offset = computed(() => getScoreRingOffset(props.score))
const circumference = 2 * Math.PI * 40
</script>

<template>
  <div
    class="relative flex flex-shrink-0 items-center justify-center"
    :style="{ width: `${dimensions}px`, height: `${dimensions}px` }"
  >
    <svg viewBox="0 0 88 88" :style="{ width: `${dimensions}px`, height: `${dimensions}px` }">
      <circle cx="44" cy="44" r="40" fill="none" stroke="var(--bg-2)" :stroke-width="strokeWidth" />
      <circle
        cx="44"
        cy="44"
        r="40"
        fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        transform="rotate(-90 44 44)"
        class="transition-all duration-[1000ms]"
        style="transition-timing-function:cubic-bezier(0.33, 1, 0.68, 1);"
      />
    </svg>
    <span class="absolute font-sans font-bold" :style="{ fontSize, color }">
      {{ score }}
    </span>
  </div>
</template>
