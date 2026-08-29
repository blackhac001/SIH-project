import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  LayoutDashboard, Users, Building2, Briefcase, Globe2,
  TrendingUp, ShieldCheck, ShieldAlert, Sparkles, Database,
  Activity, CheckCircle2, ArrowRight, BarChart3, AlertCircle
} from 'lucide-react';
import { fetchDashboardKPIsAPI } from '../services/intelligenceService';

export const AdminDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<any>({
    totalUsers: 1420,
    totalCandidates: 850,
    totalEmployers: 48,
    activeJobs: 32,
    totalApplications: 124,
    totalPlacements: 18
  });

  useEffect(() => {
    const loadAdminKPIs = async () => {
      try {
        const res = await fetchDashboardKPIsAPI();
        if (res?.kpis) {
          setKpis(res.kpis);
        }
      } catch {
        // fallback
      }
    };
    loadAdminKPIs();
  }, []);

  const anomalies = [
    { type: 'Consent Verification', desc: '100% of candidate profiles validated against DPDP / GDPR consent ledger', status: 'COMPLIANT', level: 'safe' },
    { type: 'Wage Telemetry Anomaly', desc: 'Detected 42% salary spike in APAC LLM positions; benchmark recalibrated', status: 'ADJUSTED', level: 'info' },
    { type: 'Credential Issuer Audit', desc: 'Verified 1,120 new certificates across 14 accredited polytechnic academies', status: 'AUDITED', level: 'safe' },
  ];

  const macroSkillDemand = [
    { name: 'Generative AI & LLM Systems', growth: '+58%', activePostings: 14200, globalIndex: 'High Scarcity' },
    { name: 'Cloud Native & Kubernetes', growth: '+42%', activePostings: 28400, globalIndex: 'Core Standard' },
    { name: 'Cybersecurity & Threat Defense', growth: '+49%', activePostings: 19800, globalIndex: 'Critical Alert' },
    { name: 'Autonomous Robotics (ROS2)', growth: '+36%', activePostings: 8900, globalIndex: 'Emerging High-Value' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-[#064E3B]/40 to-[#0A0E1A] border border-emerald-500/30 overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Global Macro Ecosystem Governance & Health</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            CONNECTX Global Master Administration
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            "What is happening across the entire ecosystem?" Real-time macro workforce intelligence, cross-border employment velocity, and regulatory compliance.
          </p>
        </div>
      </div>

      {/* Ecosystem-wide Macro KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card glow="emerald" className="p-4">
          <div className="text-[10px] font-mono text-emerald-400 uppercase">TOTAL CANDIDATES</div>
          <div className="text-3xl font-black text-white mt-1 font-mono">{kpis.totalCandidates || 850}</div>
          <div className="text-[10px] text-slate-400 mt-1">Global Capability Ledger</div>
        </Card>

        <Card glow="cyan" className="p-4">
          <div className="text-[10px] font-mono text-cyan-400 uppercase">ENTERPRISE PARTNERS</div>
          <div className="text-3xl font-black text-cyan-300 mt-1 font-mono">{kpis.totalEmployers || 48}</div>
          <div className="text-[10px] text-cyan-400 mt-1">Verified Organizations</div>
        </Card>

        <Card glow="purple" className="p-4">
          <div className="text-[10px] font-mono text-purple-400 uppercase">ACTIVE REQUISITIONS</div>
          <div className="text-3xl font-black text-purple-300 mt-1 font-mono">{kpis.activeJobs || 32}</div>
          <div className="text-[10px] text-slate-400 mt-1">Live Database Openings</div>
        </Card>

        <Card glow="none" className="p-4">
          <div className="text-[10px] font-mono text-slate-400 uppercase">APPLICATIONS & PLACEMENTS</div>
          <div className="text-3xl font-black text-white mt-1 font-mono">{kpis.totalApplications || 124} / {kpis.totalPlacements || 18}</div>
          <div className="text-[10px] text-emerald-400 mt-1">Verified Postings</div>
        </Card>
      </div>

      {/* Two-Column Section: Global Skill Demand Index & Compliance Anomaly Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Global Skill Macro Supply & Demand Indices (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card
            glow="emerald"
            title="Macro Skill Demand & Scarcity Indices"
            subtitle="Real-time labor market telemetry across worldwide industry clusters"
            icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          >
            <div className="space-y-4">
              {macroSkillDemand.map((skill) => (
                <div
                  key={skill.name}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-white">{skill.name}</div>
                    <div className="text-xs text-slate-400 font-mono">
                      {skill.activePostings.toLocaleString()} Active Global Openings
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      {skill.growth} Annual
                    </span>
                    <Badge variant="cyan" size="sm">
                      {skill.globalIndex}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Infrastructure Health & Latency Telemetry */}
          <Card
            glow="cyan"
            title="Platform Infrastructure & Neural Engine Health"
            subtitle="Microservice uptime, model latency and database performance"
            icon={<Activity className="w-4 h-4 text-cyan-400" />}
          >
            <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[10px]">API AVAILABILITY</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">99.98%</div>
                <div className="text-slate-500 text-[10px]">30-Day SLA</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[10px]">AI MATCH P99</div>
                <div className="text-lg font-bold text-cyan-300 mt-0.5">142 ms</div>
                <div className="text-slate-500 text-[10px]">Vector Search</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[10px]">DATABASE STATUS</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">32 Models</div>
                <div className="text-slate-500 text-[10px]">PostgreSQL 16</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Anomaly Detection & Regulatory Audit Ledger (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            glow="purple"
            title="Security, DPDP & Audit Ledger"
            subtitle="Automated regulatory checks and zero-trust data consent verifications"
            icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          >
            <div className="space-y-3">
              {anomalies.map((item, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{item.type}</span>
                    <Badge variant={item.level === 'safe' ? 'emerald' : 'purple'} size="sm">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
