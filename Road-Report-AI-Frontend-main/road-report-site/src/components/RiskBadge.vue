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
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5
           rounded-full font-mono text-[10px] font-semibold
           tracking-wide border"
    :style="{
      color,
      borderColor: color,
    }"
  >
    <span
      class="w-1.5 h-1.5 rounded-full"
      :style="{ background: color }"
    />
    {{ text }}
  </span>
</template>
