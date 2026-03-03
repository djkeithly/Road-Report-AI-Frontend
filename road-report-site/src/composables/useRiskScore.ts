import type { RiskTier } from '@/types/risk'

/** Map a total RRS score (0–100) to a risk tier */
export function getTier(score: number): RiskTier {
  if (score <= 20) return 'very-low'
  if (score <= 40) return 'low'
  if (score <= 60) return 'moderate'
  if (score <= 80) return 'high'
  return 'severe'
}

/** Map a risk tier to its CSS variable color */
export function getTierColor(tier: RiskTier): string {
  const map: Record<RiskTier, string> = {
    'very-low': 'var(--risk-vlow)',
    'low': 'var(--risk-low)',
    'moderate': 'var(--risk-mod)',
    'high': 'var(--risk-high)',
    'severe': 'var(--risk-severe)',
  }
  return map[tier]
}

/** Map a risk tier to a display label */
export function getTierLabel(tier: RiskTier): string {
  const map: Record<RiskTier, string> = {
    'very-low': 'Very Low',
    'low': 'Low',
    'moderate': 'Moderate',
    'high': 'High',
    'severe': 'Severe',
  }
  return map[tier]
}

/** Map a risk tier to a Tailwind-compatible class name */
export function getTierClass(tier: RiskTier): string {
  const map: Record<RiskTier, string> = {
    'very-low': 'risk-vlow',
    'low': 'risk-low',
    'moderate': 'risk-mod',
    'high': 'risk-high',
    'severe': 'risk-severe',
  }
  return map[tier]
}

/**
 * Calculate the SVG stroke-dashoffset for the score ring.
 * Full circumference = 2π × 40 ≈ 251.3
 * offset = circumference × (1 - score/100)
 */
export function getScoreRingOffset(score: number): number {
  const circumference = 2 * Math.PI * 40 // radius = 40 in the SVG viewBox
  return circumference * (1 - score / 100)
}

export function useRiskScore() {
  return {
    getTier,
    getTierColor,
    getTierLabel,
    getTierClass,
    getScoreRingOffset,
  }
}
