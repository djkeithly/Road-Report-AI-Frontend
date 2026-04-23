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

export interface ReportComponentDetail {
  label: string;
  value: string;
}

export interface ReportComponent {
  key: 'C' | 'A' | 'E' | 'T';
  name: string;
  score: number;
  maxPoints: number;
  weight: number;
  source: string;
  details: ReportComponentDetail[];
}

export interface ReportWeatherSnapshot {
  shortForecast: string | null;
  temperatureF: number | null;
  windSpeed: string | null;
  source: string;
}

export interface LiveReport {
  query: string;
  road: string;
  segment: string;
  latitude: number;
  longitude: number;
  bounds: [number, number, number, number];
  score: number;
  tier: RiskTier;
  summary: string;
  advice: string;
  warnings: string[];
  components: ReportComponent[];
  weather: ReportWeatherSnapshot | null;
  updatedAt: string;
  apiMessage: string;
}
