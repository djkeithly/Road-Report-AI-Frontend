/* ================================================================
   ROAD REPORT AI — TYPE DEFINITIONS
   Core types for the risk scoring system and chat
   ================================================================ */

/** Five-tier risk classification matching the design system */
export type RiskTier = 'very-low' | 'low' | 'moderate' | 'high' | 'severe'

/** Individual factor contributing to a risk component score */
export interface RiskDetail {
  label: string   // e.g. "Construction Zone", "Heavy Rain"
  value: string   // e.g. "+10", "—", "127"
}

/** One of the 4 RRS components (C, A, E, T) */
export interface RiskComponent {
  name: string        // e.g. "Road Condition"
  key: 'C' | 'A' | 'E' | 'T'
  score: number       // e.g. 10
  maxPoints: number   // e.g. 30
  weight: number      // e.g. 0.35
  details: RiskDetail[]
  source: string      // e.g. "CRIS", "weather.gov"
}

/** Full Road Risk Score for a road segment */
export interface RiskScore {
  total: number           // 0–100
  tier: RiskTier
  road: string            // e.g. "I-35 Southbound, Austin"
  segment: string         // e.g. "Near Exit 233"
  coordinates: {
    lat: number
    lng: number
  }
  updatedAt: string       // ISO timestamp
  components: {
    roadCondition: RiskComponent
    historical: RiskComponent
    environmental: RiskComponent
    traffic: RiskComponent
  }
  summary: string         // AI-generated summary text
  advice: string          // Actionable recommendation
  warnings?: string[]     // Optional data quality warnings
}

/** Chat message in the AI conversation */
export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  riskScore?: RiskScore   // Attached to AI responses that include a report
  timestamp: string
}

/** Chat session in the sidebar */
export interface ChatSession {
  id: string
  title: string
  lastMessage: string
  updatedAt: string
}

/** Monthly crash count for the history bar chart */
export interface MonthlyCrashData {
  month: string     // "Jan", "Feb", etc.
  count: number
  tier: RiskTier    // Color coding for the bar
}
