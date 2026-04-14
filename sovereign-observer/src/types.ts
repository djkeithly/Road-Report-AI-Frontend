export type Page = 'landing' | 'map' | 'reports' | 'methodology' | 'documentation' | 'about';

export interface Stat {
  label: string;
  value: string;
  description: string;
}

export interface Incident {
  id: string;
  type: string;
  date: string;
  time: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  location: string;
}

export type RiskTier = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface LiveReport {
  query: string;
  latitude: number;
  longitude: number;
  bounds: [number, number, number, number];
  score: number;
  tier: RiskTier;
  summary: string;
  updatedAt: string;
  apiMessage: string;
}
