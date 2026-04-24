import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import maplibregl from 'maplibre-gl';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CloudSun,
  Database,
  ExternalLink,
  FileText,
  Map as MapIcon,
  MessageSquare,
  Moon,
  Route,
  Search,
  ShieldCheck,
  Sun,
  Thermometer,
  Zap,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { cn } from './lib/utils';
import { LANDING_STATS, NAV_ITEMS, TEAM_MEMBERS } from './constants';
import { fetchRoadSuggestions, geocodeLocation, predictRisk, submitUserReport } from './lib/risk';
import type { Incident, LiveReport, Page, ReportComponent, RiskTier } from './types';
import { RiskMap } from './RiskMap';

/* ------------------------------------------------------------------ */
/* Helpers                                                           */
/* ------------------------------------------------------------------ */

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

function getRiskBg(tier: RiskTier): string {
  switch (tier) {
    case 'Critical':
      return 'bg-red-500';
    case 'High':
      return 'bg-orange-500';
    case 'Moderate':
      return 'bg-primary';
    default:
      return 'bg-emerald-500';
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

function mapBackendTier(tier: string | undefined, score: number): RiskTier {
  switch (tier) {
    case 'severe':
      return 'Critical';
    case 'high':
      return 'High';
    case 'moderate':
      return 'Moderate';
    case 'low':
    case 'very-low':
      return 'Low';
    default:
      return getRiskTier(score);
  }
}

function sanitizeWarnings(warnings: string[] | undefined): string[] {
  if (!warnings || warnings.length === 0) return [];

  const hasWeatherFallback = warnings.some((warning) =>
    warning.includes('Live weather source unavailable'),
  );
  const hasConservativeWeatherEstimate = warnings.some((warning) =>
    warning.includes('Weather data unavailable; environmental component estimated conservatively.'),
  );

  const friendlyWarnings: string[] = [];

  if (hasWeatherFallback || hasConservativeWeatherEstimate) {
    friendlyWarnings.push(
      'Live weather conditions could not be confirmed for this lookup, so the environmental impact was estimated conservatively.',
    );
  }

  return friendlyWarnings;
}

function flattenComponents(components: NonNullable<Awaited<ReturnType<typeof predictRisk>>['components']>): ReportComponent[] {
  return [
    components.roadCondition,
    components.historical,
    components.environmental,
    components.traffic,
  ];
}

const DEFAULT_PAGE: Page = 'landing';
const VALID_PAGES = new Set<Page>(['landing', 'map', 'reports', 'methodology', 'documentation', 'about']);

function getPageFromLocation(): Page {
  if (typeof window === 'undefined') return DEFAULT_PAGE;

  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  return VALID_PAGES.has(hash as Page) ? (hash as Page) : DEFAULT_PAGE;
}

function getUrlForPage(page: Page): string {
  if (typeof window === 'undefined') return '';

  const base = `${window.location.pathname}${window.location.search}`;
  return page === DEFAULT_PAGE ? base : `${base}#/${page}`;
}

/* ------------------------------------------------------------------ */
/* Navbar                                                            */
/* ------------------------------------------------------------------ */

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
        <span className="font-display text-xl font-bold tracking-tight text-secondary">
          Road Report <span className="font-medium italic text-primary">AI</span>
        </span>
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
        id="route-search-form"
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
          list="road-suggestions"
          className="w-64 rounded-full border-none bg-tertiary/50 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
        />
      </form>
      <button
        onClick={onToggleTheme}
        className="flex items-center gap-2 rounded-lg border border-tertiary bg-white/80 px-3 py-2 text-sm font-medium text-secondary/70 hover:text-primary"
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
      </button>
      <button
        type="submit"
        form="route-search-form"
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-70"
      >
        <Search className="h-4 w-4" />
        <span>{isLoading ? 'Analyzing...' : 'Analyze Route'}</span>
      </button>
    </div>
  </nav>
);

/* ------------------------------------------------------------------ */
/* Hero Mini Map                                                     */
/* ------------------------------------------------------------------ */

const HeroMiniMap = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [-99.9018, 31.5], // Texas
      zoom: 5.2,
      interactive: false,
      attributionControl: false,
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
};

/* ------------------------------------------------------------------ */
/* Landing Page                                                      */
/* ------------------------------------------------------------------ */

const LandingPage = ({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  onPageChange,
  isLoading,
  error,
}: {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: (query?: string) => void;
  onPageChange: (page: Page) => void;
  isLoading: boolean;
  error: string | null;
}) => (
  <div className="mx-auto max-w-7xl px-6 pb-20 pt-24">
    <div className="mb-24 grid items-center gap-12 lg:grid-cols-2">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <div className="mb-6 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Live Prediction Engine Active
          </span>
        </div>
        <h1 className="mb-8 font-display text-6xl font-bold leading-[1.1] text-secondary lg:text-7xl">
          Know your risk <span className="font-medium italic text-primary">before</span> you drive.
        </h1>
        <p className="mb-8 max-w-lg text-lg leading-relaxed text-secondary/60">
          AI-powered crash risk predictions for Texas roads, using historical accident data, real-time weather, and
          traffic analysis.
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
            list="road-suggestions"
            className="flex-1 rounded-xl border-none bg-tertiary/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
          />
          <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Generate Report'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
        {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}
        <div className="mt-2 flex flex-wrap gap-2">
          {['I-35, Austin', 'US-290, Houston', 'Loop 1604, San Antonio', 'SH-130, Georgetown'].map((hint) => (
            <button
              key={hint}
              onClick={() => {
                onSearchQueryChange(hint);
                onSearchSubmit(hint);
              }}
              className="rounded-full border border-tertiary px-3 py-1.5 text-xs text-secondary/50 transition-all hover:border-primary hover:text-primary"
            >
              {hint}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary shadow-2xl">
        <HeroMiniMap />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary/70 via-secondary/30 to-primary/20" />
        <div className="pointer-events-none absolute right-8 top-8 w-48 rounded-xl border border-white/15 bg-white/10 p-4 shadow-xl backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/60">MODEL STATUS</span>
            <span className="text-[10px] font-bold text-emerald-400">LIVE</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10">
            <div className="h-full w-[94%] rounded-full bg-primary" />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-8 left-8 max-w-[240px] rounded-xl bg-primary p-6 text-white shadow-xl">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Backend Connected</span>
          </div>
          <p className="text-sm font-medium leading-snug">
            Search uses live geocoding + PyTorch risk prediction API.
          </p>
        </div>
      </div>
    </div>

    <div className="mb-20 grid gap-12 md:grid-cols-3">
      {LANDING_STATS.map((stat) => (
        <div key={stat.label}>
          <div className="mb-2 font-display text-4xl font-bold text-primary">{stat.value}</div>
          <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-secondary/40">{stat.label}</div>
          <p className="text-sm leading-relaxed text-secondary/60">{stat.description}</p>
        </div>
      ))}
    </div>

    <div className="mb-20 grid gap-8 md:grid-cols-3">
      {[
        {
          icon: Activity,
          title: 'Real-Time Analysis',
          desc: 'Live weather from weather.gov and TxDOT traffic data feed into crash risk predictions updated in real time.',
        },
        {
          icon: MapIcon,
          title: 'Interactive Risk Map',
          desc: 'Visual risk scoring across Texas with road segment analysis via MapLibre and OpenStreetMap.',
        },
        {
          icon: MessageSquare,
          title: 'AI-Powered Reports',
          desc: 'Search any road and get a structured safety report with risk tier, score breakdown, and driving advice.',
        },
      ].map((feature) => (
        <div key={feature.title} className="glass-card p-8 transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <feature.icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-secondary">{feature.title}</h3>
          <p className="text-sm leading-relaxed text-secondary/60">{feature.desc}</p>
        </div>
      ))}
    </div>

    <div className="rounded-3xl bg-secondary p-12 text-center shadow-2xl lg:p-16">
      <h2 className="mb-4 font-display text-3xl font-bold text-white lg:text-4xl">Ready for a safer journey?</h2>
      <p className="mb-8 text-sm text-white/60">
        Search any Texas road to generate a live crash risk report.
      </p>
      <button onClick={() => onSearchSubmit()} className="btn-primary">
        Get Started →
      </button>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Risk Map Page                                                     */
/* ------------------------------------------------------------------ */

const RiskMapPage = ({ report }: { report: LiveReport | null }) => {
  return (
    <div className="min-h-screen pt-16">
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-secondary">
              {report ? report.query : 'Search a road to view the risk map'}
            </h2>
            {report ? (
              <p className="mt-1 text-sm text-secondary/60">
                Lat {report.latitude.toFixed(4)}, Lng {report.longitude.toFixed(4)} · Score: {report.score}/100 ·{' '}
                <span className={getRiskTone(report.tier)}>{report.tier}</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-secondary/60">
                Use the search bar above to geocode a location and generate a risk analysis.
              </p>
            )}
          </div>
          {report ? (
            <div className="flex items-center gap-3 rounded-xl border border-tertiary bg-white px-4 py-3 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-primary font-display text-sm font-bold text-primary">
                {report.score}%
              </div>
              <div>
                <div className="text-sm font-bold text-secondary">Risk Score</div>
                <div className={cn('text-xs font-bold', getRiskTone(report.tier))}>{report.tier}</div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Live MapLibre canvas powered by RiskMap.tsx */}
        <div
          className="relative overflow-hidden rounded-2xl border border-tertiary bg-secondary"
          style={{ height: 'calc(100vh - 200px)' }}
        >
          <RiskMap bounds={report?.bounds} report={report} />

          {report ? (
            <div className="pointer-events-none absolute left-6 top-6 z-10 max-w-md rounded-xl border border-white/10 bg-secondary/80 p-6 text-white shadow-lg backdrop-blur-md">
              <p className="text-sm leading-relaxed opacity-90">{report.summary}</p>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="rounded-xl bg-white/90 px-8 py-6 text-center shadow-lg backdrop-blur-md">
                <Search className="mx-auto mb-3 h-8 w-8 text-secondary/30" />
                <p className="text-sm font-medium text-secondary/60">Search a road to populate the map</p>
              </div>
            </div>
          )}

          {report ? (
            <div className="pointer-events-none absolute right-6 top-6 z-10 w-56 rounded-xl border border-tertiary bg-white p-5 shadow-xl">
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-secondary/40">
                Segment Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-secondary/60">Risk Tier</span>
                  <span className={cn('text-xs font-bold', getRiskTone(report.tier))}>{report.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-secondary/60">Score</span>
                  <span className="text-xs font-bold">{report.score}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-secondary/60">Segment</span>
                  <span className="max-w-[120px] truncate text-right font-mono text-xs font-bold" title={report.segment}>
                    {report.segment}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Safety Report Page                                                */
/* ------------------------------------------------------------------ */

const SafetyReportPage = ({
  report,
  isLoading,
  error,
  onSubmitIssue,
  issueSubmitting,
  issueFeedback,
}: {
  report: LiveReport | null;
  isLoading: boolean;
  error: string | null;
  onSubmitIssue: (payload: { roadName: string; issueType: string; description: string }) => Promise<void>;
  issueSubmitting: boolean;
  issueFeedback: string | null;
}) => {
  const [roadName, setRoadName] = useState('');
  const [issueType, setIssueType] = useState('other');
  const [description, setDescription] = useState('');
  const incidents: Incident[] = [
    { id: '1', type: 'Multi-Vehicle Collision', date: 'MAY 14, 2024', time: '08:42 AM', severity: 'Critical', location: 'I-35 Northbound' },
    { id: '2', type: 'Secondary Surface Hazard', date: 'MAY 12, 2024', time: '11:15 PM', severity: 'Low', location: 'Segment TX-32' },
    { id: '3', type: 'Single Lane Obstruction', date: 'MAY 11, 2024', time: '04:08 PM', severity: 'Moderate', location: 'Austin Central' },
  ];
  const ringOffset = report ? 364.4 - (364.4 * report.score) / 100 : 364.4;

  useEffect(() => {
    if (report?.query) {
      setRoadName(report.query);
    }
  }, [report?.query]);

  return (
    <div className="min-h-screen pt-16">
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {report ? `Live report · ${report.updatedAt}` : 'Awaiting search input'}
          </span>
        </div>
        <h2 className="mb-4 font-display text-4xl font-bold text-secondary">
          {report ? report.query : 'Search for a route to generate a report'}
        </h2>
        <p className="mb-10 max-w-3xl leading-relaxed text-secondary/60">
          {report ? report.summary : 'Use the search bar to geocode a corridor and score it against the backend API.'}
        </p>

        {isLoading ? (
          <div className="mb-8 flex items-center gap-3 rounded-xl bg-white p-5 shadow-sm">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-sm text-secondary/60">Generating AI prediction from the backend...</span>
          </div>
        ) : null}
        {error ? <div className="mb-8 rounded-xl bg-white p-5 text-sm text-red-500 shadow-sm">{error}</div> : null}

        <div className="mb-10 grid gap-6 md:grid-cols-2">
          <div className="glass-card p-8">
            <div className="mb-8 flex items-center justify-between">
              <h4 className="text-lg font-bold">Risk Score</h4>
              {report ? (
                <div className={cn('rounded-full px-3 py-1 text-[10px] font-bold uppercase text-white', getRiskBg(report.tier))}>
                  {report.tier}
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-10">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle cx="64" cy="64" r="58" fill="transparent" stroke="#EDE9FE" strokeWidth="12" />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    fill="transparent"
                    stroke="#6366F1"
                    strokeWidth="12"
                    strokeDasharray="364.4"
                    strokeDashoffset={ringOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.33,1,0.68,1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-3xl font-bold text-secondary">
                    {report ? report.score : '--'}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-secondary/40">out of 100</span>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between border-b border-tertiary pb-2">
                  <span className="text-xs text-secondary/60">Tier</span>
                  <span className={cn('text-xs font-bold', report ? getRiskTone(report.tier) : 'text-secondary/40')}>
                    {report ? report.tier : 'Waiting'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-tertiary pb-2">
                  <span className="text-xs text-secondary/60">Coordinates</span>
                  <span className="text-xs font-bold text-primary">
                    {report ? `${report.latitude.toFixed(3)}, ${report.longitude.toFixed(3)}` : '--'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-tertiary pb-2">
                  <span className="text-xs text-secondary/60">Model</span>
                  <span className="text-xs font-bold text-primary">{report ? 'Connected' : 'Standby'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-lg font-bold">Analysis Summary</h4>
            </div>
            <p className="mb-6 text-sm italic leading-relaxed text-secondary/60">
              {report ? `"${report.apiMessage || report.summary}"` : '"Waiting for backend output."'}
            </p>
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Recommendations</div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-xs font-medium">{report ? report.advice : 'Waiting for backend guidance.'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-xs font-medium">
                  Compare alternate routes using the risk score before departure.
                </span>
              </div>
              {report?.weather ? (
                <div className="rounded-xl border border-tertiary bg-white/70 p-4 text-xs text-secondary/60">
                  <div className="mb-2 font-bold uppercase tracking-widest text-secondary/40">Weather Input</div>
                  <div className="flex justify-between gap-4">
                    <span>{report.weather.shortForecast || 'Unavailable'}</span>
                    <span>{report.weather.temperatureF != null ? `${report.weather.temperatureF}F` : '--'}</span>
                  </div>
                  <div className="mt-1 text-secondary/45">{report.weather.source}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {report ? (
          <div className="mb-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="glass-card p-8">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="text-lg font-bold">Model Components</h4>
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">
                  Backend explainability
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {report.components.map((component) => (
                  <div key={component.key} className="rounded-2xl border border-tertiary bg-white/70 p-5">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-secondary">{component.name}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">
                          {Math.round(component.weight * 100)}% weight
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-2xl font-bold text-primary">{Math.round(component.score)}</div>
                        <div className="text-[10px] text-secondary/40">/ {component.maxPoints * 4}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {component.details.map((detail) => (
                        <div key={`${component.key}-${detail.label}`} className="flex justify-between gap-4 text-xs">
                          <span className="text-secondary/55">{detail.label}</span>
                          <span className="text-right font-medium text-secondary">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-[10px] uppercase tracking-widest text-secondary/35">{component.source}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8">
              <h4 className="mb-5 text-lg font-bold">Model Warnings</h4>
              {report.warnings.length > 0 ? (
                <div className="space-y-3">
                  {report.warnings.map((warning) => (
                    <div key={warning} className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                      {warning}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-tertiary bg-white/70 px-4 py-3 text-sm text-secondary/60">
                  No model warnings were returned for this request.
                </div>
              )}
            </div>
          </div>
        ) : null}

        {report ? (
          <div className="mb-10 glass-card p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-lg font-bold">Submit a roadway issue</h4>
            </div>
            <form
              className="grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                await onSubmitIssue({
                  roadName,
                  issueType,
                  description,
                });
                setDescription('');
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={roadName}
                  onChange={(event) => setRoadName(event.target.value)}
                  placeholder="Road name"
                  className="rounded-xl border border-tertiary bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
                />
                <select
                  value={issueType}
                  onChange={(event) => setIssueType(event.target.value)}
                  className="rounded-xl border border-tertiary bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
                >
                  <option value="pothole">Pothole</option>
                  <option value="flooding">Flooding</option>
                  <option value="debris">Debris</option>
                  <option value="construction">Construction</option>
                  <option value="signal_outage">Signal outage</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="Describe what drivers should know..."
                className="rounded-xl border border-tertiary bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
                required
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-secondary/50">
                  Saved reports include this search location's coordinates.
                </p>
                <button
                  type="submit"
                  disabled={issueSubmitting || !roadName.trim() || description.trim().length < 4}
                  className="btn-primary disabled:opacity-60"
                >
                  {issueSubmitting ? 'Saving...' : 'Submit Report'}
                </button>
              </div>
              {issueFeedback ? <p className="text-sm text-primary">{issueFeedback}</p> : null}
            </form>
          </div>
        ) : null}

        {report ? (
          <div>
            <h3 className="mb-6 text-xl font-bold">Historical Incident Logs</h3>
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="glass-card flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        incident.severity === 'Critical'
                          ? 'bg-red-100 text-red-500'
                          : incident.severity === 'Moderate'
                            ? 'bg-orange-100 text-orange-500'
                            : 'bg-primary/10 text-primary',
                      )}
                    >
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-secondary">{incident.type}</div>
                      <div className="text-[10px] font-medium text-secondary/40">
                        {incident.date} · {incident.time}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white',
                      incident.severity === 'Critical'
                        ? 'bg-red-500'
                        : incident.severity === 'Moderate'
                          ? 'bg-orange-500'
                          : 'bg-primary',
                    )}
                  >
                    {incident.severity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* About Page                                                        */
/* ------------------------------------------------------------------ */

const AboutPage = () => {
  const chartData = [
    { name: '01', value: 400 },
    { name: '02', value: 300 },
    { name: '03', value: 600 },
    { name: '04', value: 800 },
    { name: '05', value: 500 },
    { name: '06', value: 900 },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 pb-20 pt-24">
      <div className="mb-16">
        <h1 className="mb-6 font-display text-5xl font-bold text-secondary">
          About Road Report <span className="text-primary">AI</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-secondary/60">
          We use machine learning to analyze road conditions and historical accident data to predict crash risk levels
          across all 254 Texas counties. The model continuously learns from structured datasets to improve prediction
          accuracy.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="mb-8 font-display text-2xl font-bold text-secondary">Data Sources</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              icon: FileText,
              title: 'TxDOT CRIS',
              desc: 'Crash Records Information System — historical accident records with location, date, time, weather, and road conditions.',
            },
            {
              icon: Thermometer,
              title: 'Weather.gov API',
              desc: 'National Weather Service providing real-time weather alerts and conditions by zone.',
            },
            {
              icon: MapIcon,
              title: 'Nominatim / OpenStreetMap',
              desc: 'Free geocoding for road and location lookup. MapLibre GL for interactive map rendering.',
            },
            {
              icon: Activity,
              title: 'TxDOT AADT',
              desc: 'Annual Average Daily Traffic counts — road-level traffic volume data including the Top 100 most congested Texas roadways.',
            },
          ].map((ds) => (
            <div key={ds.title} className="glass-card flex gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <ds.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-secondary">{ds.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-secondary/60">{ds.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="mb-8 font-display text-2xl font-bold text-secondary">Road Risk Score Formula</h2>
        <div className="mb-8 rounded-2xl border border-tertiary bg-white p-8 text-center shadow-sm">
          <div className="font-display text-2xl font-bold text-secondary">
            RRS = <span className="text-primary">0.35</span>C + <span className="text-primary">0.30</span>A +{' '}
            <span className="text-primary">0.20</span>E + <span className="text-primary">0.15</span>T
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { weight: '35%', name: 'Road Condition (C)', range: '0–30 pts' },
            { weight: '30%', name: 'Historical (A)', range: '0–25 pts' },
            { weight: '20%', name: 'Environmental (E)', range: '0–25 pts' },
            { weight: '15%', name: 'Traffic (T)', range: '0–20 pts' },
          ].map((fc) => (
            <div key={fc.name} className="glass-card p-6 text-center">
              <div className="mb-1 font-display text-2xl font-bold text-primary">{fc.weight}</div>
              <div className="text-sm font-bold text-secondary">{fc.name}</div>
              <div className="mt-1 font-mono text-[10px] text-secondary/40">{fc.range}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="mb-8 font-display text-2xl font-bold text-secondary">Tech Stack</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'React + Vite', desc: 'Frontend framework' },
            { name: 'TypeScript', desc: 'Type-safe frontend and API layer' },
            { name: 'FastAPI', desc: 'Backend REST API' },
            { name: 'PostgreSQL', desc: 'Production database' },
            { name: 'PyTorch', desc: 'ML model training and inference' },
            { name: 'Tailwind CSS', desc: 'Utility-first styling' },
          ].map((tech) => (
            <div key={tech.name} className="glass-card flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary font-mono text-xs font-bold text-primary">
                {tech.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-secondary">{tech.name}</div>
                <div className="text-xs text-secondary/50">{tech.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { val: '99.4%', label: 'Training accuracy' },
          { val: '< 2s', label: 'Inference latency' },
          { val: '250K+', label: 'Training samples' },
          { val: '254', label: 'Texas counties' },
          { val: '5', label: 'Risk tiers' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5 text-center">
            <div className="font-display text-2xl font-bold text-secondary">{s.val}</div>
            <div className="mt-1 text-xs text-secondary/50">{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-8 font-display text-2xl font-bold text-secondary">The Team</h2>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {TEAM_MEMBERS.map((m) => (
            <div key={m.initials} className="glass-card p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-tertiary font-display text-lg font-bold text-secondary/60">
                {m.initials}
              </div>
              <div className="text-sm font-bold text-secondary">{m.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MethodologyPage = () => {
  const componentWeights = [
    { key: 'C', label: 'Road Condition', weight: 30, detail: 'Road class, surface condition estimate, corridor pressure.' },
    { key: 'A', label: 'Historical Pattern', weight: 30, detail: 'Time-window risk profile and historical crash context.' },
    { key: 'E', label: 'Environmental', weight: 25, detail: 'Live forecast, temperature, and severe-weather fallback logic.' },
    { key: 'T', label: 'Traffic Pattern', weight: 15, detail: 'Commute window behavior and congestion proxy estimates.' },
  ];

  const runtimeStages = [
    {
      step: '01',
      title: 'Query normalization',
      body: 'A user-entered road or place is normalized, geocoded, and matched to a corridor coordinate.',
    },
    {
      step: '02',
      title: 'Context assembly',
      body: 'The backend infers road class, fetches weather context, and constructs the model input row.',
    },
    {
      step: '03',
      title: 'Model + heuristic scoring',
      body: 'The logistic-regression model is blended with explainable component scoring when normalization is stable.',
    },
    {
      step: '04',
      title: 'Report generation',
      body: 'The API returns total score, tier, advice, warnings, weather snapshot, and component details for the UI.',
    },
  ];

  const dataLines = [
    { name: 'Coordinates', value: 'Latitude and longitude generated from user search input.' },
    { name: 'Road name', value: 'Normalized and mapped to the closest known model feature when possible.' },
    { name: 'Road class', value: 'Inferred from naming patterns such as Interstate, Tollway, or City Street.' },
    { name: 'Time window', value: 'Current local query time is used for commute-window and overnight behavior.' },
    { name: 'Weather', value: 'Weather.gov first, Open-Meteo fallback, then conservative estimate if both fail.' },
  ];

  const componentBars = [
    { name: 'Road', value: 30 },
    { name: 'History', value: 30 },
    { name: 'Weather', value: 25 },
    { name: 'Traffic', value: 15 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-24">
      <section className="mb-16 overflow-hidden rounded-[32px] bg-secondary px-8 py-10 text-white shadow-2xl lg:px-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Methodology Briefing
              </span>
            </div>
            <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.05] lg:text-6xl">
              How the platform translates a road search into a risk score.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/65">
              This page is the technical story of the product: what enters the model, how scoring is composed,
              where fallback logic appears, and what the report is actually telling the user.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Model family', value: 'Logistic regression runtime' },
              { label: 'Output package', value: 'Score, tier, advice, weather, components' },
              { label: 'Primary weather source', value: 'Weather.gov with Open-Meteo fallback' },
              { label: 'Display philosophy', value: 'Calibrated score with explainable breakdowns' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{item.label}</div>
                <div className="mt-2 text-sm font-medium text-white/85">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-16 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary">Pipeline</div>
          <h2 className="mb-5 font-display text-3xl font-bold text-secondary">Scoring workflow</h2>
          <p className="max-w-xl text-sm leading-relaxed text-secondary/60">
            The methodology is intentionally split into deterministic stages so the frontend can explain where a score
            came from, not just display a number.
          </p>
        </div>
        <div className="space-y-4">
          {runtimeStages.map((stage) => (
            <motion.div
              key={stage.step}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35 }}
              className="grid gap-4 rounded-2xl border border-tertiary bg-white/80 p-5 shadow-sm md:grid-cols-[72px_1fr]"
            >
              <div className="font-display text-3xl font-bold text-primary">{stage.step}</div>
              <div>
                <h3 className="text-base font-bold text-secondary">{stage.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-secondary/60">{stage.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mb-16 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card p-8">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary">Weights</div>
          <h2 className="mb-6 font-display text-3xl font-bold text-secondary">Risk components</h2>
          <div className="mb-8 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={componentBars}>
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {componentBars.map((entry, index) => (
                    <Cell key={entry.name} fill={index < 2 ? '#0A705E' : index === 2 ? '#2EA38D' : '#9BBEB6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {componentWeights.map((component) => (
              <div key={component.key} className="grid gap-3 rounded-2xl border border-tertiary bg-white/70 p-4 md:grid-cols-[72px_1fr]">
                <div>
                  <div className="font-display text-2xl font-bold text-primary">{component.weight}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">{component.key}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-secondary">{component.label}</div>
                  <div className="mt-1 text-sm leading-relaxed text-secondary/60">{component.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary">Inputs</div>
          <h2 className="mb-6 font-display text-3xl font-bold text-secondary">What the backend consumes</h2>
          <div className="space-y-4">
            {dataLines.map((item) => (
              <div key={item.name} className="border-b border-tertiary pb-4 last:border-b-0 last:pb-0">
                <div className="text-sm font-bold text-secondary">{item.name}</div>
                <div className="mt-1 text-sm leading-relaxed text-secondary/60">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-secondary p-6 text-white">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">Runtime note</div>
            <p className="text-sm leading-relaxed text-white/70">
              If model normalization is not trustworthy for a given lookup, the API falls back to heuristic scoring
              rather than returning a misleading flat score. Weather also has a secondary provider path to reduce empty reports.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="glass-card p-8">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary">Interpretation</div>
          <h2 className="mb-5 font-display text-3xl font-bold text-secondary">How to read the score</h2>
          <div className="space-y-4 text-sm leading-relaxed text-secondary/60">
            <p>A score is not a guarantee that a crash will or will not occur. It is a compact signal combining model output and explainable risk context for the selected corridor.</p>
            <p>Higher scores indicate a more elevated crash profile for the queried segment at the time of the request. The component cards show which part of the system pushed the score upward.</p>
            <p>Warnings should be interpreted as quality notes about context availability, not as errors in the report.</p>
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary">Boundaries</div>
          <h2 className="mb-5 font-display text-3xl font-bold text-secondary">Known limitations</h2>
          <div className="space-y-3">
            {[
              'Historical and traffic components still include heuristic estimation rather than full live roadway telemetry.',
              'Road-name matching is strongest when the search resembles a corridor already represented in the model features.',
              'Weather quality depends on external provider availability and may use fallback conditions when primary APIs fail.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-tertiary bg-white/70 px-4 py-3 text-sm text-secondary/60">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const DocumentationPage = () => {
  const dataSources = [
    {
      icon: Database,
      code: 'CRIS',
      title: 'TxDOT CRIS',
      desc: 'Crash Investigation System records with location, date, weather, road condition, and incident context. Legacy exports support large CSV pulls dating back to 2016.',
    },
    {
      icon: CloudSun,
      code: 'NWS',
      title: 'Weather.gov API',
      desc: 'National Weather Service conditions and alerts that feed the environmental portion of the risk score in near real time.',
    },
    {
      icon: Route,
      code: 'MAP',
      title: 'Geocoding + Routing',
      desc: 'Location lookup, nearest-road matching, and corridor context used to anchor a report to the right road segment.',
    },
    {
      icon: Activity,
      code: 'AADT',
      title: 'TxDOT AADT',
      desc: 'Annual Average Daily Traffic counts used as a pressure indicator for high-volume corridors and congestion-sensitive segments.',
    },
  ];

  const formulaComponents = [
    { weight: '35%', name: 'Road Condition (C)', range: '0-30 points' },
    { weight: '30%', name: 'Historical (A)', range: '0-25 points' },
    { weight: '20%', name: 'Environmental (E)', range: '0-25 points' },
    { weight: '15%', name: 'Traffic (T)', range: '0-20 points' },
  ];

  const techStack = [
    { name: 'React + Vite', desc: 'Current frontend framework', icon: 'UI' },
    { name: 'TypeScript', desc: 'Typed UI and API integration', icon: 'TS' },
    { name: 'FastAPI', desc: 'Backend REST API layer', icon: 'API' },
    { name: 'PostgreSQL', desc: 'Persistent data store', icon: 'DB' },
    { name: 'PyTorch', desc: 'Model training and inference', icon: 'ML' },
    { name: 'Pandas + NumPy', desc: 'Data preparation and feature engineering', icon: 'DS' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-24">
      <section className="mb-16 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              System Documentation
            </span>
          </div>
          <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-secondary lg:text-6xl">
            Documentation for the <span className="italic text-primary">Road Report AI</span> stack.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary/60">
            This page captures the practical reference material from the legacy site: source systems, scoring logic,
            platform architecture, and team ownership. It is meant to explain how the product works, not just how it
            looks.
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-secondary/40">
            Quick Reference
          </div>
          <div className="space-y-3 text-sm text-secondary/70">
            <div className="flex items-start justify-between gap-4 border-b border-tertiary pb-3">
              <span>Coverage</span>
              <span className="font-bold text-secondary">254 Texas counties</span>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-tertiary pb-3">
              <span>Backend</span>
              <span className="font-bold text-secondary">FastAPI risk prediction service</span>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-tertiary pb-3">
              <span>Frontend</span>
              <span className="font-bold text-secondary">React + Vite web client</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span>Primary output</span>
              <span className="font-bold text-secondary">Route-level risk reports</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary">Workflow</div>
          <h2 className="mb-5 font-display text-3xl font-bold text-secondary">How a report is generated</h2>
          <div className="space-y-4 text-sm leading-relaxed text-secondary/65">
            <p>The frontend first geocodes a road or location query, then sends coordinates to the prediction API.</p>
            <p>The backend combines historical crash patterns, weather context, and road pressure signals to return a normalized risk score.</p>
            <p>The UI translates that score into a tier, a summary, and map/report surfaces that can be reviewed by users in seconds.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: '01', title: 'Locate', desc: 'Road names and places are geocoded into a usable corridor coordinate.' },
            { step: '02', title: 'Score', desc: 'The API evaluates the location against the trained crash-risk model.' },
            { step: '03', title: 'Render', desc: 'The frontend returns a map view, risk tier, and structured report summary.' },
          ].map((item) => (
            <div key={item.step} className="glass-card p-6">
              <div className="mb-4 font-display text-3xl font-bold text-primary">{item.step}</div>
              <div className="mb-2 text-sm font-bold text-secondary">{item.title}</div>
              <p className="text-sm leading-relaxed text-secondary/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary">Sources</div>
            <h2 className="font-display text-3xl font-bold text-secondary">Data sources and external inputs</h2>
          </div>
          <div className="hidden text-xs text-secondary/40 md:block">Legacy source content preserved from the original site</div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {dataSources.map((ds) => (
            <div key={ds.title} className="glass-card flex gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <ds.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-3">
                  <span className="rounded-full bg-tertiary px-2 py-1 font-mono text-[10px] font-bold text-secondary/50">
                    {ds.code}
                  </span>
                  <h3 className="text-sm font-bold text-secondary">{ds.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-secondary/60">{ds.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-8">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary">Scoring</div>
          <h2 className="mb-6 font-display text-3xl font-bold text-secondary">Road Risk Score formula</h2>
          <div className="mb-8 rounded-2xl bg-secondary px-6 py-8 text-center shadow-inner">
            <div className="font-display text-3xl font-bold text-white">
              RRS = <span className="text-primary">0.35</span>C + <span className="text-primary">0.30</span>A +{' '}
              <span className="text-primary">0.20</span>E + <span className="text-primary">0.15</span>T
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {formulaComponents.map((fc) => (
              <div key={fc.name} className="rounded-2xl border border-tertiary bg-white/80 p-5">
                <div className="mb-1 font-display text-2xl font-bold text-primary">{fc.weight}</div>
                <div className="text-sm font-bold text-secondary">{fc.name}</div>
                <div className="mt-1 text-xs text-secondary/45">{fc.range}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary">Implementation</div>
          <h2 className="mb-6 font-display text-3xl font-bold text-secondary">Technology stack</h2>
          <div className="space-y-3">
            {techStack.map((tech) => (
              <div key={tech.name} className="flex items-center gap-4 rounded-2xl border border-tertiary bg-white/80 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary font-mono text-xs font-bold text-primary">
                  {tech.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-secondary">{tech.name}</div>
                  <div className="text-xs text-secondary/50">{tech.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary">Ownership</div>
            <h2 className="font-display text-3xl font-bold text-secondary">Project team</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {TEAM_MEMBERS.map((member) => (
            <div key={member.initials} className="glass-card p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-tertiary font-display text-lg font-bold text-secondary/60">
                {member.initials}
              </div>
              <div className="text-sm font-bold text-secondary">{member.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">External references</div>
          <h2 className="font-display text-2xl font-bold text-secondary">Key systems referenced by the platform</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Weather.gov', href: 'https://www.weather.gov/documentation/services-web-api' },
            { label: 'TxDOT CRIS', href: 'https://cris.dot.state.tx.us/public/Query/app/home' },
            { label: 'OpenStreetMap', href: 'https://www.openstreetmap.org/' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-tertiary px-4 py-2 text-sm font-medium text-secondary/70 transition-colors hover:border-primary hover:text-primary"
            >
              {link.label}
              <ExternalLink className="h-4 w-4" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* App Root                                                          */
/* ------------------------------------------------------------------ */

export default function App() {
  const [activePage, setActivePage] = useState<Page>(() => getPageFromLocation());
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof window !== 'undefined' && window.localStorage.getItem('rr-theme') === 'dark' ? 'dark' : 'light',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [roadSuggestions, setRoadSuggestions] = useState<string[]>([]);
  const [report, setReport] = useState<LiveReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issueSubmitting, setIssueSubmitting] = useState(false);
  const [issueFeedback, setIssueFeedback] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('rr-theme', theme);
  }, [theme]);

  useEffect(() => {
    const syncPageFromLocation = () => {
      setActivePage(getPageFromLocation());
    };

    syncPageFromLocation();
    window.addEventListener('popstate', syncPageFromLocation);
    window.addEventListener('hashchange', syncPageFromLocation);

    return () => {
      window.removeEventListener('popstate', syncPageFromLocation);
      window.removeEventListener('hashchange', syncPageFromLocation);
    };
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setRoadSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const suggestions = await fetchRoadSuggestions(trimmed);
        setRoadSuggestions(suggestions);
      } catch {
        setRoadSuggestions([]);
      }
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const navigateToPage = (page: Page, options?: { replace?: boolean }) => {
    setActivePage((currentPage) => {
      if (typeof window === 'undefined') return page;

      const nextUrl = getUrlForPage(page);
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (currentUrl !== nextUrl) {
        const historyMethod = options?.replace ? 'replaceState' : 'pushState';
        window.history[historyMethod]({ page }, '', nextUrl);
      }

      return currentPage === page ? currentPage : page;
    });
  };

  const handleSearchSubmit = async (directQuery?: string) => {
    const trimmed = (directQuery ?? searchQuery).trim();
    if (directQuery) setSearchQuery(directQuery);
    if (!trimmed) {
      setError('Please enter a road or location first.');
      navigateToPage('landing');
      return;
    }

    navigateToPage('reports');
    setIsLoading(true);
    setError(null);

    try {
      const geocode = await geocodeLocation(trimmed);
      const geocodedRoadName = geocode.displayName.split(',')[0]?.trim();
      const normalizedRoadName = geocodedRoadName || trimmed.split(',')[0]?.trim() || trimmed;
      const prediction = await predictRisk({
        latitude: geocode.latitude,
        longitude: geocode.longitude,
        road_name: normalizedRoadName,
        segment: geocode.displayName,
      });
      const score = prediction.total ?? Math.round(prediction.risk_score * 100);
      const tier = mapBackendTier(prediction.tier, score);
      setReport({
        query: trimmed,
        road: prediction.road ?? normalizedRoadName,
        segment: prediction.segment ?? geocode.displayName,
        latitude: geocode.latitude,
        longitude: geocode.longitude,
        bounds: geocode.bounds,
        score,
        tier,
        summary: prediction.summary?.trim() || buildSummary(tier, trimmed, prediction.message),
        advice:
          prediction.advice?.trim() ||
          'Proceed carefully, compare alternate routes, and monitor roadway conditions before departure.',
        warnings: sanitizeWarnings(prediction.warnings),
        components: prediction.components ? flattenComponents(prediction.components) : [],
        weather: prediction.weather ?? null,
        updatedAt: prediction.updatedAt ? new Date(prediction.updatedAt).toLocaleString() : new Date().toLocaleString(),
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

  const handleIssueSubmit = async (payload: {
    roadName: string;
    issueType: string;
    description: string;
  }) => {
    if (!report) {
      setIssueFeedback('Search a location first so we can attach coordinates.');
      return;
    }

    setIssueSubmitting(true);
    setIssueFeedback(null);
    try {
      const response = await submitUserReport({
        road_name: payload.roadName.trim(),
        issue_type: payload.issueType as
          | 'pothole'
          | 'flooding'
          | 'debris'
          | 'construction'
          | 'signal_outage'
          | 'other',
        description: payload.description.trim(),
        latitude: report.latitude,
        longitude: report.longitude,
      });
      setIssueFeedback(`Saved report #${response.id}. Thanks for submitting.`);
    } catch (submitError) {
      setIssueFeedback(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to submit report. Please try again.',
      );
    } finally {
      setIssueSubmitting(false);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'landing':
        return (
          <LandingPage
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            onPageChange={navigateToPage}
            isLoading={isLoading}
            error={error}
          />
        );
      case 'map':
        return <RiskMapPage report={report} />;
      case 'reports':
        return (
          <SafetyReportPage
            report={report}
            isLoading={isLoading}
            error={error}
            onSubmitIssue={handleIssueSubmit}
            issueSubmitting={issueSubmitting}
            issueFeedback={issueFeedback}
          />
        );
      case 'methodology':
        return <MethodologyPage />;
      case 'documentation':
        return <DocumentationPage />;
      case 'about':
        return <AboutPage />;
      default:
        return (
          <LandingPage
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            onPageChange={navigateToPage}
            isLoading={isLoading}
            error={error}
          />
        );
    }
  };

  return (
    <div className={`theme-${theme} min-h-screen bg-[#FAFAFF]`}>
      <Navbar
        activePage={activePage}
        onPageChange={navigateToPage}
        theme={theme}
        onToggleTheme={() => setTheme((c) => (c === 'light' ? 'dark' : 'light'))}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        isLoading={isLoading}
      />
      <datalist id="road-suggestions">
        {roadSuggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
      <footer className="border-t border-tertiary bg-white px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <span className="font-display text-sm font-bold text-secondary">
              Road Report <span className="italic text-primary">AI</span>
            </span>
            <span className="ml-3 text-[10px] text-secondary/40">
              AI-powered crash risk predictions for Texas roads.
            </span>
          </div>
          <div className="flex gap-6">
            {['GitHub', 'TxDOT CRIS', 'Weather.gov'].map((link) => (
              <span key={link} className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">
                {link}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
