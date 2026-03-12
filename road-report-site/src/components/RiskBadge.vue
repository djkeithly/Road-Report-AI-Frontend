<script setup lang="ts">
import { computed } from 'vue'
import { useRiskScore } from '@/composables/useRiskScore'
import type { RiskTier } from '@/types/risk'

const props = defineProps<{
  tier: RiskTier
  label?: string
}>()

const { getTierColor, getTierLabel } = useRiskScore()

const color = computed(() => getTierColor(props.tier))
const text = computed(() => props.label ?? getTierLabel(props.tier))
const tint = computed(() => {
  const map: Record<RiskTier, string> = {
    'very-low': 'rgba(60,165,122,0.10)',
    low: 'rgba(91,184,138,0.10)',
    moderate: 'rgba(228,166,59,0.10)',
    high: 'rgba(224,115,56,0.10)',
    severe: 'rgba(212,64,64,0.10)',
  }
  return map[props.tier]
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold tracking-[0.01em]"
    :style="{
      color,
      background: tint,
    }"
  >
    <span class="h-[5px] w-[5px] rounded-full" :style="{ background: color }" />
    {{ text }}
  </span>
</template>
