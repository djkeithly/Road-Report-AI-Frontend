import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Zap, 
  Archive, 
  Map as MapIcon
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'map', label: 'Risk Map', icon: MapIcon },
  { id: 'reports', label: 'Safety Reports', icon: FileText },
  { id: 'methodology', label: 'Methodology', icon: BarChart3 },
  { id: 'documentation', label: 'Documentation', icon: Zap },
];

export const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'road-logs', label: 'Road Logs', icon: FileText },
  { id: 'ai-insights', label: 'AI Insights', icon: Zap },
  { id: 'archive', label: 'Archive', icon: Archive },
];

export const LANDING_STATS = [
  { label: 'COUNTIES MONITORED', value: '3,142', description: 'Comprehensive coverage across all major domestic arterial routes.' },
  { label: 'CRASH RECORDS ANALYZED', value: '42.8M', description: 'Historical context meeting real-time predictive modeling.' },
  { label: 'ANALYSIS LATENCY', value: '0.42s', description: 'Near-instantaneous interpretation of network disturbances.' },
];
