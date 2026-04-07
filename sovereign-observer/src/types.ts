export type Page = 'landing' | 'map' | 'reports' | 'methodology' | 'documentation';

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
