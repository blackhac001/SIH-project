import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Globe2, Sparkles, TrendingUp, DollarSign, MapPin,
  Building2, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { getGlobalRegionDemands, GlobalRegionDemand } from '../services/intelligenceService';

export const GlobalSkillsMapPage: React.FC = () => {
  const [regions] = useState<GlobalRegionDemand[]>(getGlobalRegionDemands());
  const [selectedCode, setSelectedCode] = useState('NA');

  const selectedRegion = regions.find((r) => r.code === selectedCode) || regions[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <Globe2 className="w-3.5 h-3.5" />
          <span>Macroeconomic Labor & Skill Demand Indices</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Global Skills & Demand Intelligence Map
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Explore international technology hubs, active talent demand, regional compensation benchmarks, and remote hiring velocity.
        </p>
      </div>

      {/* Global Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card glow="cyan" className="p-5">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Worldwide Tracked Jobs</div>
          <div className="text-3xl font-black text-white mt-1 font-mono">1.34M+</div>
          <div className="text-xs text-cyan-400 mt-2">Across 150+ Sovereign Nations</div>
        </Card>

        <Card glow="purple" className="p-5">
          <div className="text-[11px] font-mono text-purple-400 uppercase">Fastest Growing Region</div>
          <div className="text-3xl font-black text-purple-300 mt-1 font-mono">APAC (+44%)</div>
          <div className="text-xs text-purple-400 mt-2">Driven by Singapore & India Tech</div>
        </Card>

        <Card glow="emerald" className="p-5">
          <div className="text-[11px] font-mono text-emerald-400 uppercase">Global Remote Index</div>
          <div className="text-3xl font-black text-emerald-400 mt-1 font-mono">67.4%</div>
          <div className="text-xs text-emerald-400 mt-2">Cross-border contracts</div>
        </Card>

        <Card glow="blue" className="p-5">
          <div className="text-[11px] font-mono text-blue-400 uppercase">Top Global Skill</div>
          <div className="text-3xl font-black text-cyan-300 mt-1 font-mono">GenAI / LLM</div>
          <div className="text-xs text-slate-400 mt-2">Present in 52% of new reqs</div>
        </Card>
      </div>

      {/* Region Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-slate-800">
        {regions.map((reg) => (
          <button
            key={reg.code}
            onClick={() => setSelectedCode(reg.code)}
            className={`px-4 py-3 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2.5 ${
              selectedCode === reg.code
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>{reg.region}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
              {(reg.activeJobs / 1000).toFixed(0)}k jobs
            </span>
          </button>
        ))}
      </div>

      {/* Interactive Regional Focus Card */}
      <Card glow="cyan" className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Region Info (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="cyan" size="sm" dot>Regional Deep Dive</Badge>
                <span className="text-xs font-mono text-slate-400">Code: {selectedRegion.code}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {selectedRegion.region}
              </h2>
              <p className="text-xs text-slate-300">
                Key Industrial Domain: <strong className="text-cyan-300">{selectedRegion.hotSector}</strong>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs">
              <div>
                <div className="text-[10px] text-slate-500 font-mono">ACTIVE JOBS</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  {selectedRegion.activeJobs.toLocaleString()}
                </div>
              </div>
              <div className="border-x border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">AVG TECH SALARY</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                  {selectedRegion.avgSalary}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-mono">REMOTE RATE</div>
                <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
                  {selectedRegion.remoteRate}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Top Required Skills in {selectedRegion.code}
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedRegion.topSkills.map((sk) => (
                  <span
                    key={sk}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 text-cyan-300 border border-cyan-500/40 font-mono"
                  >
                    🔥 {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Visual Simulated Map Projection (6 Cols) */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-full h-56 flex items-center justify-center">
              {/* Radar Orbit Concentric Rings */}
              <div className="absolute w-52 h-52 rounded-full border border-cyan-500/20 animate-ping opacity-25"></div>
              <div className="absolute w-40 h-40 rounded-full border border-purple-500/30"></div>
              <div className="absolute w-28 h-28 rounded-full border border-blue-500/40"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-black text-xl text-white shadow-2xl font-mono">
                {selectedRegion.code}
              </div>
            </div>

            <div className="text-xs text-slate-400 max-w-sm">
              <strong className="text-white">Active Hiring Telemetry: </strong>
              Enterprise requisitions in {selectedRegion.region} prioritized cloud architecture and artificial intelligence engineers with +38% cross-border visa allowances.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
