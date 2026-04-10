import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Clock,
  Download,
  FileText,
  Layers,
  LifeBuoy,
  Map as MapIcon,
  MessageSquare,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Thermometer,
  X,
  Zap,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { cn } from './lib/utils';
import { LANDING_STATS, NAV_ITEMS, SIDEBAR_ITEMS } from './constants';
import { geocodeLocation, predictRisk } from './lib/risk';
import type { Incident, LiveReport, Page, RiskTier } from './types';
import { RiskMap } from './RiskMap'; // Adjust path as needed

function getRiskTier(score: number): RiskTier {
  if (score >= 75) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 35) return 'Moderate';
  return 'Low';
}

function getRiskTone(tier: RiskTier): string {
  switch (tier) {
    case 'Critical':
      return 'text-red-500';
    case 'High':
      return 'text-orange-500';
    case 'Moderate':
      return 'text-primary';
    default:
      return 'text-emerald-500';
  }
}

function buildSummary(tier: RiskTier, query: string, apiMessage: string): string {
  const summary: Record<RiskTier, string> = {
    Low: `${query} is currently reading below the regional danger threshold.`,
    Moderate: `${query} is showing moderate crash risk right now.`,
    High: `${query} is showing elevated crash risk due to combined roadway pressure.`,
    Critical: `${query} is operating in a critical risk band right now.`,
  };
  return apiMessage?.trim() ? `${summary[tier]} ${apiMessage}` : summary[tier];
}

const Navbar = ({
  activePage,
  onPageChange,
  theme,
  onToggleTheme,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  isLoading,
}: {
  activePage: Page;
  onPageChange: (page: Page) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  isLoading: boolean;
}) => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-tertiary bg-white/80 px-6 backdrop-blur-md">
    <div className="flex items-center gap-8">
      <button className="flex items-center gap-2" onClick={() => onPageChange('landing')}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <span className="font-display text-xl font-bold tracking-tight text-secondary">Sovereign Observer</span>
      </button>
      <div className="hidden items-center gap-6 md:flex">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id as Page)}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              activePage === item.id ? 'border-b-2 border-primary py-5 text-primary' : 'text-secondary/60',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>

    <div className="flex items-center gap-4">
      <form
        className="relative hidden lg:block"
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit();
        }}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/40" />
        <input
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Search roads..."
          className="w-64 rounded-full border-none bg-tertiary/50 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
        />
      </form>
      <button className="p-2 text-secondary/60 hover:text-primary"><Bell className="h-5 w-5" /></button>
      <button className="p-2 text-secondary/60 hover:text-primary"><Settings className="h-5 w-5" /></button>
      <button
        onClick={onToggleTheme}
        className="flex items-center gap-2 rounded-lg border border-tertiary bg-white/80 px-3 py-2 text-sm font-medium text-secondary/70 hover:text-primary"
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
      </button>
      <button
        onClick={onSearchSubmit}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-70"
      >
        <MessageSquare className="h-4 w-4" />
        <span>{isLoading ? 'Analyzing...' : 'Analyze Route'}</span>
      </button>
    </div>
  </nav>
);

const Sidebar = ({ activeItem, onSelectItem }: { activeItem: string; onSelectItem: (id: string) => void }) => (
  <aside className="fixed left-0 top-16 flex h-[calc(100vh-4rem)] w-64 flex-col justify-between border-r border-tertiary bg-[#F8FAF9] p-6">
    <div>
      <div className="mb-8">
        <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-secondary/40">System Intelligence</h3>
        <div className="space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-left text-sm font-medium',
                activeItem === item.id ? 'border border-tertiary bg-white text-primary shadow-sm' : 'text-secondary/60 hover:bg-tertiary/50 hover:text-secondary',
              )}
            >
              <span className="flex items-center gap-3">
                <item.icon className={cn('h-4 w-4', activeItem === item.id ? 'text-primary' : 'text-secondary/40')} />
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90">
        <X className="h-4 w-4 rotate-45" />
        NEW REPORT
      </button>
    </div>
    <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-secondary/60 hover:bg-tertiary/50 hover:text-secondary">
      <LifeBuoy className="h-4 w-4 text-secondary/40" />
      Support
    </button>
  </aside>
);

const LandingPage = ({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  onOpenMethodology,
  isLoading,
  error,
}: {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  onOpenMethodology: () => void;
  isLoading: boolean;
  error: string | null;
}) => (
  <div className="mx-auto max-w-7xl px-6 pb-20 pt-24">
    <div className="mb-24 grid items-center gap-12 lg:grid-cols-2">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <div className="mb-6 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live Network Intelligence Active</span>
        </div>
        <h1 className="mb-8 text-6xl font-display font-bold leading-[1.1] text-secondary lg:text-7xl">
          Know your risk <span className="font-medium italic text-primary">before</span> you drive.
        </h1>
        <p className="mb-8 max-w-lg text-lg leading-relaxed text-secondary/60">
          Search any road, city, or corridor and generate a live crash-risk report using the existing backend model.
        </p>
        <form
          className="mb-4 flex max-w-xl flex-col gap-3 rounded-2xl border border-tertiary bg-white/85 p-3 shadow-xl md:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
        >
          <input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search a road or location..."
            className="flex-1 rounded-xl border-none bg-tertiary/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
          />
          <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Generate Report'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
        {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}
        <div className="flex flex-wrap gap-4">
          <button onClick={onSearchSubmit} className="btn-primary flex items-center gap-2">
            Launch Live Report
            <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={onOpenMethodology} className="btn-secondary">View Methodology</button>
        </div>
      </motion.div>

      <div className="relative aspect-square overflow-hidden rounded-3xl bg-tertiary shadow-2xl">
        <img src="https://picsum.photos/seed/map-abstract/800/800" alt="Risk Map Preview" className="h-full w-full object-cover grayscale opacity-80" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
        <div className="absolute right-8 top-8 w-48 rounded-xl border border-tertiary bg-white p-4 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-secondary/40">MODEL READY</span>
            <span className="text-[10px] font-bold text-primary">LIVE</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-tertiary"><div className="h-full w-[94%] bg-primary" /></div>
        </div>
        <div className="absolute bottom-8 left-8 max-w-[240px] rounded-xl bg-primary p-6 text-white shadow-xl">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Backend connected</span>
          </div>
          <p className="text-sm font-medium leading-snug">Route search now uses live geocoding plus the legacy risk prediction API.</p>
        </div>
      </div>
    </div>

    <div className="mb-20 grid gap-12 md:grid-cols-3">
      {LANDING_STATS.map((stat) => (
        <div key={stat.label}>
          <div className="mb-2 text-4xl font-display font-bold text-primary">{stat.value}</div>
          <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-secondary/40">{stat.label}</div>
          <p className="text-sm leading-relaxed text-secondary/60">{stat.description}</p>
        </div>
      ))}
    </div>
  </div>
);

const RiskMapPage = ({ report }: { report: LiveReport | null }) => {
  const [activeSidebarItem, setActiveSidebarItem] = useState('analytics');
  
  return (
    <div className="flex h-screen pt-16">
      <Sidebar activeItem={activeSidebarItem} onSelectItem={setActiveSidebarItem} />
      <main className="ml-64 flex flex-1 flex-col overflow-hidden bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Live Incident Analysis</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-secondary">{report ? report.query : 'High-Risk Convergence at Sector 7'}</h2>
          </div>
          <div className="glass-card flex items-center gap-3 px-4 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary text-xs font-bold text-primary">{report ? `${report.score}%` : '88%'}</div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Data Veracity</div>
              <div className="text-[10px] text-secondary/60">{report ? `Lat ${report.latitude.toFixed(4)}, Lng ${report.longitude.toFixed(4)}` : 'Cross-referenced with 4 local sensor clusters.'}</div>
            </div>
          </div>
        </div>
        
        <div className="relative flex-1 overflow-hidden rounded-2xl bg-secondary">
          
          <RiskMap bounds={report?.bounds} />

          <div className="pointer-events-none absolute left-6 top-6 max-w-md rounded-xl border border-white/10 bg-secondary/80 p-6 text-white backdrop-blur-md">
            <p className="text-sm leading-relaxed opacity-80">{report ? report.summary : 'Search from the landing page to load a live backend-connected corridor report.'}</p>
          </div>
          
          <div className="pointer-events-none absolute right-6 top-6 w-64 rounded-xl border border-tertiary bg-white p-6 shadow-xl">
            <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-secondary/40">Sector Metadata</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-secondary/60">Risk Tier</span>
                <span className={cn('text-xs font-bold', report ? getRiskTone(report.tier) : 'text-red-500')}>{report ? report.tier : 'Critical'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-secondary/60">Risk Score</span>
                <span className="text-xs font-bold">{report ? `${report.score}/100` : '75/100'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-secondary/60">Segment ID</span>
                <span className="font-mono text-xs font-bold">{report ? `TX-${Math.abs(Math.round(report.latitude * 100))}-${Math.abs(Math.round(report.longitude * 100))}` : 'TX-8852-X'}</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
const SafetyReportPage = ({ report, isLoading, error }: { report: LiveReport | null; isLoading: boolean; error: string | null }) => {
  const [activeSidebarItem, setActiveSidebarItem] = useState('road-logs');
  const incidents: Incident[] = [
    { id: '1', type: 'Multi-Vehicle Collision', date: 'MAY 14, 2024', time: '08:42 AM', severity: 'Critical', location: 'I-35 Northbound' },
    { id: '2', type: 'Secondary Surface Hazard', date: 'MAY 12, 2024', time: '11:15 PM', severity: 'Low', location: 'Segment TX-32' },
    { id: '3', type: 'Single Lane Obstruction', date: 'MAY 11, 2024', time: '04:08 PM', severity: 'Moderate', location: 'Austin Central' },
  ];
  const ringOffset = report ? 364.4 - (364.4 * report.score) / 100 : 91.1;

  return (
    <div className="flex h-screen pt-16">
      <Sidebar activeItem={activeSidebarItem} onSelectItem={setActiveSidebarItem} />
      <main className="ml-64 flex-1 overflow-y-auto bg-[#F8FAF9] p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{report ? `Live backend report • ${report.updatedAt}` : 'Live backend report pending'}</span>
          </div>
          <h2 className="mb-4 text-4xl font-display font-bold text-secondary">{report ? report.query : 'Search for a route to generate a report'}</h2>
          <p className="mb-10 max-w-3xl leading-relaxed text-secondary/60">{report ? report.summary : 'Use the new landing page search to geocode a corridor and score it against the existing backend API.'}</p>
          {isLoading ? <div className="mb-8 rounded-xl bg-white p-5 text-sm text-secondary/60 shadow-sm">Generating AI prediction from the backend...</div> : null}
          {error ? <div className="mb-8 rounded-xl bg-white p-5 text-sm text-red-500 shadow-sm">{error}</div> : null}

          <div className="mb-10 grid gap-6 md:grid-cols-2">
            <div className="glass-card p-8">
              <div className="mb-8 flex items-center justify-between">
                <h4 className="text-lg font-bold">Dynamic Risk Factor</h4>
                <div className="flex items-center gap-2 rounded bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary"><div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />ACTIVE SCAN</div>
              </div>
              <div className="flex items-center gap-10">
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full -rotate-90 transform">
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="#ECF0ED" strokeWidth="12" />
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="#0A705E" strokeWidth="12" strokeDasharray="364.4" strokeDashoffset={ringOffset} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-display font-bold text-secondary">{report ? `${report.score}%` : '--'}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-secondary/40">Risk Level</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between border-b border-tertiary pb-2"><span className="text-xs text-secondary/60">Backend tier</span><span className={cn('text-xs font-bold', report ? getRiskTone(report.tier) : 'text-secondary/40')}>{report ? report.tier : 'Waiting'}</span></div>
                  <div className="flex justify-between border-b border-tertiary pb-2"><span className="text-xs text-secondary/60">Coordinates</span><span className="text-xs font-bold text-primary">{report ? `${report.latitude.toFixed(3)}, ${report.longitude.toFixed(3)}` : '--'}</span></div>
                  <div className="flex justify-between border-b border-tertiary pb-2"><span className="text-xs text-secondary/60">Model status</span><span className="text-xs font-bold text-primary">{report ? 'Connected' : 'Standby'}</span></div>
                </div>
              </div>
            </div>
            <div className="glass-card p-8">
              <div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Zap className="h-5 w-5 text-primary" /></div><h4 className="text-lg font-bold">Predictive Analysis Summary</h4></div>
              <p className="mb-6 text-sm italic leading-relaxed text-secondary/60">{report ? `"${report.apiMessage || report.summary}"` : '"Waiting for backend output."'}</p>
              <div className="space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Priority Recommendation</div>
                <div className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-primary" /><span className="text-xs font-medium">{report?.tier === 'Critical' ? 'Delay travel or reroute to a lower-pressure corridor.' : 'Proceed with caution and monitor corridor conditions.'}</span></div>
                <div className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-primary" /><span className="text-xs font-medium">Use the live risk score to compare alternate routes before departure.</span></div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold">Historical Incident Logs</h3>
                <button className="text-[10px] font-bold uppercase tracking-widest text-primary">Export Full Archive</button>
              </div>
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="glass-card flex items-center justify-between p-4 hover:border-primary/30">
                    <div className="flex items-center gap-4">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', incident.severity === 'Critical' ? 'bg-red-100 text-red-500' : incident.severity === 'Moderate' ? 'bg-orange-100 text-orange-500' : 'bg-primary/10 text-primary')}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div><div className="text-sm font-bold text-secondary">{incident.type}</div><div className="text-[10px] font-medium text-secondary/40">{incident.date} - {incident.time}</div></div>
                    </div>
                    <div className="text-right">
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-secondary/40">Impact Level</div>
                      <div className={cn('rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white', incident.severity === 'Critical' ? 'bg-red-500' : incident.severity === 'Moderate' ? 'bg-orange-500' : 'bg-primary')}>{incident.severity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card bg-tertiary/30 p-6">
              <h3 className="mb-6 text-xl font-bold">Actionable Directives</h3>
              <div className="space-y-6">
                <div>
                  <span className="rounded bg-secondary px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white">Driver Focus</span>
                  <h4 className="mb-2 mt-2 text-sm font-bold">Maintain Merging</h4>
                  <p className="text-xs leading-relaxed text-secondary/60">{report?.tier === 'Critical' ? 'Current model output suggests delaying aggressive merges and increasing following distance beyond the normal baseline.' : 'Maintain a clean merge pattern and avoid abrupt braking near intersections and lane shifts.'}</p>
                </div>
                <div>
                  <span className="rounded bg-primary px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white">Environmental Advisory</span>
                  <h4 className="mb-2 mt-2 text-sm font-bold">Backend-Informed Route Signal</h4>
                  <p className="text-xs leading-relaxed text-secondary/60">This report is generated from the live backend score instead of static mock data.</p>
                </div>
              </div>
              <button className="mt-10 flex w-full items-center justify-center gap-2 rounded-lg border border-tertiary bg-white py-3 text-xs font-bold text-secondary hover:bg-tertiary"><Download className="h-4 w-4" />Download Safety PDF</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const MethodologyPage = () => {
  const data = [{ name: '01', value: 400 }, { name: '02', value: 300 }, { name: '03', value: 600 }, { name: '04', value: 800 }, { name: '05', value: 500 }, { name: '06', value: 900 }];
  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-24">
      <div className="mb-20 max-w-3xl">
        <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-primary">Statistical Framework 2.4</div>
        <h1 className="mb-8 text-5xl font-display font-bold text-secondary">The Synthesis of <br /><span className="text-primary">Predictive Authority.</span></h1>
        <p className="text-lg leading-relaxed text-secondary/60">Sovereign Observer employs a multi-vector Bayesian approach to road safety, combining historical crash telemetry with real-time atmospheric data to generate high-confidence risk narratives.</p>
      </div>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="mb-8 text-3xl font-display font-bold text-secondary">Primary Data Streams</h2>
          <div className="space-y-6">
            {[{ title: 'CRIS (Crash Records)', desc: 'Historical incident logging.', icon: FileText }, { title: 'TxDOT Telemetry', desc: 'Real-time sensor and infrastructure health.', icon: Activity }, { title: 'Weather.gov (NOAA)', desc: 'Atmospheric pressure and visibility indices.', icon: Thermometer }].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tertiary"><item.icon className="h-6 w-6 text-primary" /></div>
                <div><h4 className="font-bold text-secondary">{item.title}</h4><p className="text-sm text-secondary/60">{item.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-secondary p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="relative z-10">
            <div className="mb-6 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((_, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0A705E' : '#14B8A6'} opacity={0.6 + index / 20} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
              <h4 className="mb-2 font-bold text-white">Real-Time Ingestion Layer</h4>
              <p className="text-sm text-white/60">Processing 1.4 million data points per minute across the regional transportation grid.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activePage, setActivePage] = useState<Page>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && window.localStorage.getItem('sovereign-theme') === 'dark' ? 'dark' : 'light'));
  const [searchQuery, setSearchQuery] = useState('');
  const [report, setReport] = useState<LiveReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('sovereign-theme', theme);
  }, [theme]);

  const handleSearchSubmit = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setError('Please enter a road or location first.');
      setActivePage('landing');
      return;
    }

    setActivePage('reports');
    setIsLoading(true);
    setError(null);

    try {
      const geocode = await geocodeLocation(trimmed);
      const prediction = await predictRisk({ latitude: geocode.latitude, longitude: geocode.longitude });
      const score = Math.round(prediction.risk_score * 100);
      const tier = getRiskTier(score);
      setReport({
        query: trimmed,
        latitude: geocode.latitude,
        longitude: geocode.longitude,
        bounds: geocode.bounds,
        score,
        tier,
        summary: buildSummary(tier, trimmed, prediction.message),
        updatedAt: new Date().toLocaleString(),
        apiMessage: prediction.message,
      });
    } catch (err) {
      console.error(err);
      setReport(null);
      setError(err instanceof Error ? err.message : 'Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const footerCopy = useMemo(() => (report ? `Live report loaded for ${report.query} - score ${report.score}/100` : 'Road safety frontend with live backend-connected reporting.'), [report]);

  const renderPage = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} onSearchSubmit={handleSearchSubmit} onOpenMethodology={() => setActivePage('methodology')} isLoading={isLoading} error={error} />;
      case 'map':
        return <RiskMapPage report={report} />;
      case 'reports':
        return <SafetyReportPage report={report} isLoading={isLoading} error={error} />;
      case 'methodology':
        return <MethodologyPage />;
      default:
        return <LandingPage searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} onSearchSubmit={handleSearchSubmit} onOpenMethodology={() => setActivePage('methodology')} isLoading={isLoading} error={error} />;
    }
  };

  return (
    <div className={`sovereign-app theme-${theme} min-h-screen bg-[#F8FAF9]`}>
      <Navbar activePage={activePage} onPageChange={setActivePage} theme={theme} onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} onSearchSubmit={handleSearchSubmit} isLoading={isLoading} />
      <AnimatePresence mode="wait">
        <motion.div key={activePage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
          {renderPage()}
        </motion.div>
      </AnimatePresence>
      <footer className="border-t border-tertiary bg-white px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-[10px] font-medium text-secondary/40">{footerCopy}</div>
          <div className="flex gap-8">
            {['Privacy Policy', 'Terms of Service', 'API Access', 'Contact Support'].map((link) => <button key={link} className="text-[10px] font-bold uppercase tracking-widest text-secondary/40 hover:text-primary">{link}</button>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
