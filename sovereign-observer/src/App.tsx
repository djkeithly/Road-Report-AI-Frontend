import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Bell, 
  Settings, 
  MessageSquare, 
  UserCircle,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Activity,
  Map as MapIcon,
  AlertTriangle,
  Clock,
  Thermometer,
  Layers,
  ChevronRight,
  Download,
  LifeBuoy,
  Zap,
  FileText
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from './lib/utils';
import { NAV_ITEMS, SIDEBAR_ITEMS, LANDING_STATS } from './constants';
import { Page } from './types';

// --- Components ---

const Navbar = ({ activePage, onPageChange }: { activePage: Page, onPageChange: (page: Page) => void }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-tertiary z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onPageChange('landing')}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-secondary">Sovereign Observer</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id as Page)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                activePage === item.id ? "text-primary border-b-2 border-primary py-5" : "text-secondary/60"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
          <input 
            type="text" 
            placeholder="Search roads..." 
            className="bg-tertiary/50 border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <button className="p-2 text-secondary/60 hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-secondary/60 hover:text-primary transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all">
          <MessageSquare className="w-4 h-4" />
          <span>AI Chat</span>
        </button>
        <button className="w-8 h-8 rounded-full overflow-hidden border border-tertiary">
          <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
        </button>
      </div>
    </nav>
  );
};

const Sidebar = ({ activeItem, onSelectItem }: { activeItem: string, onSelectItem: (id: string) => void }) => {
  return (
    <aside className="w-64 border-r border-tertiary bg-[#F8FAF9] h-[calc(100vh-4rem)] fixed left-0 top-16 p-6 flex flex-col justify-between">
      <div>
        <div className="mb-8">
          <h3 className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-4">System Intelligence</h3>
          <div className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  activeItem === item.id 
                    ? "bg-white text-primary shadow-sm border border-tertiary" 
                    : "text-secondary/60 hover:text-secondary hover:bg-tertiary/50"
                )}
              >
                <item.icon className={cn("w-4 h-4", activeItem === item.id ? "text-primary" : "text-secondary/40")} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button className="w-full bg-primary text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <X className="w-4 h-4 rotate-45" />
          NEW REPORT
        </button>
      </div>

      <div className="space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-tertiary/50 transition-all">
          <LifeBuoy className="w-4 h-4 text-secondary/40" />
          Support
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-tertiary/50 transition-all">
          <UserCircle className="w-4 h-4 text-secondary/40" />
          Account
        </button>
      </div>
    </aside>
  );
};

// --- Page Views ---

const LandingPage = ({ onLaunch }: { onLaunch: () => void }) => {
  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Network Intelligence Active</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-display font-bold text-secondary leading-[1.1] mb-8">
            Know your risk <span className="text-primary italic font-medium">before</span> you drive.
          </h1>
          <p className="text-lg text-secondary/60 mb-10 max-w-lg leading-relaxed">
            Harnessing deep neural analysis to transform cold road telemetry into clear, editorial safety insights. We don't just report traffic; we observe risk.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={onLaunch} className="btn-primary flex items-center gap-2">
              Launch Risk Map
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="btn-secondary">View Methodology</button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="aspect-square bg-tertiary rounded-3xl overflow-hidden shadow-2xl relative">
            <img 
              src="https://picsum.photos/seed/map-abstract/800/800" 
              alt="Risk Map Preview" 
              className="w-full h-full object-cover opacity-80 grayscale"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
            
            {/* Overlay UI Elements */}
            <div className="absolute top-8 right-8 bg-white p-4 rounded-xl shadow-xl border border-tertiary w-48">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-secondary/40">NOMINAL</span>
                <span className="text-[10px] font-bold text-primary">94%</span>
              </div>
              <div className="w-full bg-tertiary h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[94%]" />
              </div>
            </div>

            <div className="absolute bottom-8 left-8 bg-primary p-6 rounded-xl shadow-xl text-white max-w-[240px]">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">AI Insight</span>
              </div>
              <p className="text-sm font-medium leading-snug">
                System predicts 12% decrease in congestion on I-90 corridor within the next 45 minutes.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-12 mb-32">
        {LANDING_STATS.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="text-4xl font-display font-bold text-primary mb-2">{stat.value}</div>
            <div className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-4">{stat.label}</div>
            <p className="text-sm text-secondary/60 leading-relaxed">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-32">
        <div className="glass-card p-10 flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="w-10 h-10 bg-tertiary rounded-lg flex items-center justify-center mb-8">
              <Activity className="text-primary w-5 h-5" />
            </div>
            <h3 className="text-3xl font-display font-bold text-secondary mb-4">Real-Time Analysis</h3>
            <p className="text-secondary/60 leading-relaxed mb-8">
              We digest millions of data points per second—from weather sensors to vehicle telemetry—to give you a live editorial feed of road safety.
            </p>
          </div>
          <div className="flex gap-4">
            <span className="px-3 py-1 bg-tertiary rounded-full text-[10px] font-bold text-primary">Precipitation: 0%</span>
            <span className="px-3 py-1 bg-tertiary rounded-full text-[10px] font-bold text-primary">Friction: Optimal</span>
            <span className="px-3 py-1 bg-tertiary rounded-full text-[10px] font-bold text-primary">Density: Low</span>
          </div>
        </div>

        <div className="bg-primary p-10 rounded-2xl flex flex-col justify-between min-h-[400px] text-white">
          <div>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-8">
              <MessageSquare className="text-white w-5 h-5" />
            </div>
            <h3 className="text-3xl font-display font-bold mb-4">AI Chat Consultant</h3>
            <p className="text-white/70 leading-relaxed mb-8">
              Query the system directly. Ask about specific routes or upcoming travel hazards with natural language.
            </p>
          </div>
          <button className="w-full bg-white text-primary py-4 rounded-xl font-bold hover:bg-white/90 transition-all">
            Start Conversation
          </button>
        </div>
      </div>

      <div className="relative h-[500px] rounded-3xl overflow-hidden mb-32 group cursor-pointer">
        <img 
          src="https://picsum.photos/seed/winding-road/1200/600" 
          alt="Interactive Risk Mapping" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent opacity-80" />
        <div className="absolute bottom-12 left-12 right-12">
          <h3 className="text-4xl font-display font-bold text-white mb-4">Interactive Risk Mapping</h3>
          <p className="text-white/70 max-w-xl mb-8">
            Navigate the world through a lens of probability. Our high-fidelity maps highlight safety corridors and potential hazard zones before they manifest.
          </p>
          <button className="flex items-center gap-2 text-white font-bold group">
            Open Explorer
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <div className="text-center py-20">
        <h2 className="text-5xl font-display font-bold text-secondary mb-6">Ready for a safer journey?</h2>
        <p className="text-secondary/60 mb-12 max-w-2xl mx-auto">
          Join the thousands of observers using high-end data to navigate the road ahead.
        </p>
        <div className="flex max-w-md mx-auto gap-2">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-1 bg-tertiary/50 border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
          />
          <button className="btn-primary">Get Started</button>
        </div>
      </div>
    </div>
  );
};

const RiskMapPage = () => {
  const [activeSidebarItem, setActiveSidebarItem] = useState('analytics');

  return (
    <div className="flex h-screen pt-16">
      <Sidebar activeItem={activeSidebarItem} onSelectItem={setActiveSidebarItem} />
      <main className="flex-1 ml-64 p-6 bg-white overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live Incident Analysis</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-secondary">High-Risk Convergence at Sector 7</h2>
          </div>
          <div className="flex gap-3">
            <div className="glass-card px-4 py-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">88%</div>
              <div>
                <div className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">Data Veracity</div>
                <div className="text-[10px] text-secondary/60">Cross-referenced with 4 local sensor clusters.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative rounded-2xl overflow-hidden bg-secondary">
          <img 
            src="https://picsum.photos/seed/sector7/1200/800" 
            alt="Map View" 
            className="w-full h-full object-cover opacity-40 grayscale"
            referrerPolicy="no-referrer"
          />
          
          {/* Map Overlays */}
          <div className="absolute top-6 left-6 max-w-md">
            <div className="bg-secondary/80 backdrop-blur-md p-6 rounded-xl border border-white/10 text-white">
              <p className="text-sm leading-relaxed opacity-80">
                AI analysis indicates a 68% probability of surface degradation due to abnormal moisture levels and heavy freight loads over the last 72 hours.
              </p>
            </div>
          </div>

          <div className="absolute top-6 right-6 space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-xl border border-tertiary w-64">
              <h4 className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-4">Sector Metadata</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary/60">Surface Temp</span>
                  <span className="text-xs font-bold">14.2°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary/60">Risk Factor</span>
                  <span className="text-xs font-bold text-red-500">Critical</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary/60">Segment ID</span>
                  <span className="text-xs font-bold font-mono">TX-8852-X</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4">
            <div className="flex-1 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-tertiary flex items-center gap-6">
              <div className="flex items-center gap-3 pr-6 border-r border-tertiary">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Clock className="text-white w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">Playback</div>
                  <div className="text-xs font-bold text-primary">REAL-TIME</div>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-4">
                <span className="text-[10px] font-bold text-secondary/40">00:00</span>
                <div className="flex-1 h-1.5 bg-tertiary rounded-full relative">
                  <div className="absolute left-0 top-0 bottom-0 bg-primary w-2/3 rounded-full" />
                  <div className="absolute left-2/3 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md" />
                </div>
                <span className="text-[10px] font-bold text-secondary/40">23:59</span>
              </div>
              <div className="flex items-center gap-2 pl-6 border-l border-tertiary">
                <button className="p-2 hover:bg-tertiary rounded-lg transition-colors">
                  <Layers className="w-4 h-4 text-secondary/60" />
                </button>
                <button className="p-2 hover:bg-tertiary rounded-lg transition-colors">
                  <Settings className="w-4 h-4 text-secondary/60" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SafetyReportPage = () => {
  const [activeSidebarItem, setActiveSidebarItem] = useState('road-logs');

  const incidents = [
    { id: '1', type: 'Multi-Vehicle Collision', date: 'MAY 14, 2024', time: '08:42 AM', severity: 'Critical', location: 'I-35 Northbound' },
    { id: '2', type: 'Secondary Surface Hazard', date: 'MAY 12, 2024', time: '11:15 PM', severity: 'Low', location: 'Segment TX-32' },
    { id: '3', type: 'Single Lane Obstruction', date: 'MAY 11, 2024', time: '04:08 PM', severity: 'Moderate', location: 'Austin Central' },
  ];

  return (
    <div className="flex h-screen pt-16">
      <Sidebar activeItem={activeSidebarItem} onSelectItem={setActiveSidebarItem} />
      <main className="flex-1 ml-64 p-8 bg-[#F8FAF9] overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Segment Analysis ID: TX-32-126-09</span>
          </div>
          <h2 className="text-4xl font-display font-bold text-secondary mb-4">I-35, Austin: Central Corridor</h2>
          <p className="text-secondary/60 max-w-3xl leading-relaxed mb-10">
            A critical diagnostic view of North-South artery safety performance. AI analysis suggests a structural shift in traffic-to-incident correlation during peak heat cycles.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="glass-card p-8">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-lg font-bold">Dynamic Risk Factor</h4>
                <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 rounded text-[10px] font-bold text-primary">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  ACTIVE SCAN
                </div>
              </div>
              <div className="flex items-center gap-10">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="#ECF0ED" strokeWidth="12" />
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="#0A705E" strokeWidth="12" strokeDasharray="364.4" strokeDashoffset="91.1" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-display font-bold text-secondary">75%</span>
                    <span className="text-[8px] font-bold text-secondary/40 uppercase tracking-widest">Risk Level</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-tertiary">
                    <span className="text-xs text-secondary/60">Heat-Induced Congestion</span>
                    <span className="text-xs font-bold text-red-500">Critical</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-tertiary">
                    <span className="text-xs text-secondary/60">Lane Departure Probability</span>
                    <span className="text-xs font-bold text-primary">Moderate</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Zap className="text-primary w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold">Predictive Analysis Summary</h4>
              </div>
              <p className="text-sm text-secondary/60 italic leading-relaxed mb-6">
                "Current traffic patterns coupled with 95°F surface temperature suggest an elevated risk of tire failure in commercial vehicles near the 6th Street exit. High-speed weave movements are trending 15% above baseline."
              </p>
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">Priority Recommendation</div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-medium">Deploy auxiliary messaging for Exit 234C.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-medium">Adjust variable speed limits to 55 MPH.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-[400px] rounded-2xl overflow-hidden bg-secondary mb-12">
            <img 
              src="https://picsum.photos/seed/austin-map/1200/600" 
              alt="Spatial Incident Cluster" 
              className="w-full h-full object-cover opacity-30 grayscale"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-6 left-6 bg-secondary/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white">
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2">Spatial Incident Cluster</h4>
              <div className="text-[10px] opacity-60 mb-4">ZONE: SECTOR 4 (I-35/HWY 290)</div>
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-60">Severity Index:</span>
                <span className="text-xs font-bold text-red-500">9.2/10</span>
              </div>
            </div>
            <div className="absolute bottom-6 right-6 flex gap-2">
              <button className="p-3 bg-primary text-white rounded-lg shadow-lg"><MapIcon className="w-5 h-5" /></button>
              <button className="p-3 bg-white text-secondary rounded-lg shadow-lg"><Settings className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Historical Incident Logs</h3>
                <button className="text-[10px] font-bold text-primary uppercase tracking-widest">Export Full Archive</button>
              </div>
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        incident.severity === 'Critical' ? "bg-red-100 text-red-500" : 
                        incident.severity === 'Moderate' ? "bg-orange-100 text-orange-500" : "bg-primary/10 text-primary"
                      )}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-secondary">{incident.type}</div>
                        <div className="text-[10px] text-secondary/40 font-medium">{incident.date} — {incident.time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-1">Impact Level</div>
                      <div className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                        incident.severity === 'Critical' ? "bg-red-500 text-white" : 
                        incident.severity === 'Moderate' ? "bg-orange-500 text-white" : "bg-primary text-white"
                      )}>
                        {incident.severity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-6 bg-tertiary/30">
                <h3 className="text-xl font-bold mb-6">Actionable Directives</h3>
                
                <div className="space-y-6">
                  <div>
                    <span className="px-2 py-0.5 bg-secondary text-white text-[8px] font-bold rounded uppercase tracking-widest">Driver Focus</span>
                    <h4 className="text-sm font-bold mt-2 mb-2">Maintain Merging</h4>
                    <p className="text-xs text-secondary/60 leading-relaxed">
                      AI detection shows merging behavior that 20% often suffers from ghost braking. Maintain a 3-second gap and utilize the full length of the acceleration lane.
                    </p>
                  </div>

                  <div>
                    <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-bold rounded uppercase tracking-widest">Environmental Advisory</span>
                    <h4 className="text-sm font-bold mt-2 mb-2">Sun Glare Blindspots</h4>
                    <p className="text-xs text-secondary/60 leading-relaxed">
                      Between 07:15 - 08:30 AM, eastbound traffic faces severe glare risk. Reduce speeds by 10% and increase following distance.
                    </p>
                  </div>
                </div>

                <button className="w-full mt-10 border border-tertiary bg-white text-secondary py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-tertiary transition-all">
                  <Download className="w-4 h-4" />
                  Download Safety PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const MethodologyPage = () => {
  const data = [
    { name: '01', value: 400 },
    { name: '02', value: 300 },
    { name: '03', value: 600 },
    { name: '04', value: 800 },
    { name: '05', value: 500 },
    { name: '06', value: 900 },
    { name: '07', value: 700 },
    { name: '08', value: 1100 },
    { name: '09', value: 850 },
    { name: '10', value: 1200 },
  ];

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <div className="max-w-3xl mb-20">
        <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Statistical Framework 2.4</div>
        <h1 className="text-5xl font-display font-bold text-secondary mb-8">
          The Synthesis of <br /><span className="text-primary">Predictive Authority.</span>
        </h1>
        <p className="text-lg text-secondary/60 leading-relaxed">
          Sovereign Observer employs a multi-vector Bayesian approach to road safety, combining historical crash telemetry with real-time atmospheric data to generate high-confidence risk narratives.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
        <div>
          <h2 className="text-3xl font-display font-bold text-secondary mb-8">Primary Data Streams</h2>
          <p className="text-secondary/60 mb-10 leading-relaxed">
            Our intelligence is anchored in verified institutional feeds. We do not rely on crowdsourced noise; we ingest raw data from authorized structural authorities to maintain editorial integrity.
          </p>
          <div className="space-y-6">
            {[
              { title: 'CRIS (Crash Records)', desc: 'Comprehensive historical incident logging for longitudinal trend analysis.', icon: FileText },
              { title: 'TxDOT Telemetry', desc: 'Real-time highway sensor data and infrastructure health metrics.', icon: Activity },
              { title: 'Weather.gov (NOAA)', desc: 'Atmospheric pressure, visibility indices, and surface friction variables.', icon: Thermometer },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-12 h-12 bg-tertiary rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary">{item.title}</h4>
                  <p className="text-sm text-secondary/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-secondary rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="relative z-10">
            <div className="h-[300px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0A705E' : '#14B8A6'} opacity={0.6 + (index / 20)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10">
              <h4 className="text-white font-bold mb-2">Real-Time Ingestion Layer</h4>
              <p className="text-white/60 text-sm">
                Processing 1.4 million data points per minute across the regional transportation grid.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-20">
        <h2 className="text-4xl font-display font-bold text-secondary mb-4">Neural Architecture</h2>
        <div className="w-20 h-1 bg-primary mx-auto" />
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-32">
        <div className="md:col-span-2 bg-primary p-10 rounded-2xl text-white">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-8">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-display font-bold mb-6">Ensemble Forecasting</h3>
          <p className="text-white/70 leading-relaxed mb-10 text-lg">
            Our proprietary model utilizes a Random Forest regressor stacked with a Long Short-Term Memory (LSTM) network to account for both spatial hazards and temporal decay in road safety conditions.
          </p>
          <div className="flex gap-4">
            <span className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold border border-white/20">GRADIENT BOOSTING</span>
            <span className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold border border-white/20">DEEP LEARNING</span>
          </div>
        </div>

        <div className="glass-card p-10">
          <h3 className="text-2xl font-display font-bold text-secondary mb-8">Feature Weighting</h3>
          <p className="text-sm text-secondary/60 mb-10">How our AI prioritizes variables in every calculation.</p>
          <div className="space-y-8">
            {[
              { label: 'PAVEMENT QUALITY', value: 42 },
              { label: 'LUMINANCE LEVEL', value: 28 },
              { label: 'VEHICLE DENSITY', value: 55 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">{item.label}</span>
                  <span className="text-[10px] font-bold text-primary">{item.value}%</span>
                </div>
                <div className="w-full bg-tertiary h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'BACKTEST ACCURACY', value: '98.2%' },
            { label: 'INFERENCE LATENCY', value: '0.4s' },
            { label: 'DAILY VALIDATIONS', value: '12k' },
            { label: 'CONTINUOUS LEARNING', value: '∞' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6">
              <div className="text-2xl font-display font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-[8px] font-bold text-secondary/40 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-3xl font-display font-bold text-secondary mb-6">Rigorous Human-in-the-Loop Validation.</h2>
          <p className="text-secondary/60 leading-relaxed mb-8">
            Data accuracy is not a destination; it is a persistent audit. Our models undergo weekly "Back-Testing" where predicted risks are mapped against actual reported incidents to refine the weight of every neural synapse.
          </p>
          <ul className="space-y-4">
            {[
              'Bias mitigation through diverse training sets.',
              'External audit by 3rd party safety engineers.',
              'Direct integration with city planning feedback loops.',
            ].map((text) => (
              <li key={text} className="flex items-center gap-3 text-sm font-medium text-secondary">
                <ShieldCheck className="text-primary w-5 h-5" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-32 text-center">
        <p className="text-2xl font-display font-bold italic text-secondary mb-4">"Information is the only armor in a world of variables."</p>
        <p className="text-secondary/40 text-sm mb-12">Deep dive into our full technical whitepaper and API specs.</p>
        <div className="flex justify-center gap-4">
          <button className="btn-primary">Download Full Whitepaper</button>
          <button className="btn-secondary">Browse API Docs</button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activePage, setActivePage] = useState<Page>('landing');

  const renderPage = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage onLaunch={() => setActivePage('map')} />;
      case 'map':
        return <RiskMapPage />;
      case 'reports':
        return <SafetyReportPage />;
      case 'methodology':
        return <MethodologyPage />;
      default:
        return <LandingPage onLaunch={() => setActivePage('map')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <Navbar activePage={activePage} onPageChange={setActivePage} />
      
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

      <footer className="bg-white border-t border-tertiary py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-medium text-secondary/40">
            © 2024 Sovereign Observer. High-End Data Editorial for Road Safety.
          </div>
          <div className="flex gap-8">
            {['Privacy Policy', 'Terms of Service', 'API Access', 'Contact Support'].map((link) => (
              <button key={link} className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest hover:text-primary transition-colors">
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
