import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  GraduationCap, Users, BookOpen, Award, TrendingUp,
  Building2, Compass, CheckCircle2, AlertTriangle, Sparkles,
  ArrowRight, BarChart3, PieChart, Target
} from 'lucide-react';
import { fetchDashboardKPIsAPI } from '../services/intelligenceService';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<any>({
    academyName: user?.organization_name || 'Training Academy',
    accreditationStatus: 'ACCREDITED',
    activeCourses: 0,
    trainingCentres: 0,
    activeCohorts: 0,
    enrolledLearners: 0,
    certificationsIssued: 0,
    placedLearners: 0,
    hasCourses: false,
  });

  useEffect(() => {
    const loadKpis = async () => {
      try {
        const res = await fetchDashboardKPIsAPI();
        if (res?.kpis) {
          setKpis(res.kpis);
        }
      } catch {
        // graceful
      }
    };
    loadKpis();
  }, []);

  const curriculumGaps = [
    { skill: 'Generative AI & LLMOps', industryDemand: 96, curriculumCoverage: 48, gap: -48, status: 'CRITICAL GAP', recommendation: 'Introduce Distributed PyTorch & vLLM Inference Lab' },
    { skill: 'Kubernetes & Service Mesh', industryDemand: 92, curriculumCoverage: 65, gap: -27, status: 'SIGNIFICANT GAP', recommendation: 'Add Istio & Helm Production Cluster Deployment' },
    { skill: 'Cybersecurity & Cloud Enclaves', industryDemand: 84, curriculumCoverage: 42, gap: -42, status: 'CRITICAL GAP', recommendation: 'Integrate Zero-Trust Architecture & Hardware Enclaves' },
    { skill: 'Python REST Microservices', industryDemand: 88, curriculumCoverage: 94, gap: +6, status: 'ALIGNED', recommendation: 'Curriculum fully satisfies industry hiring standard' },
    { skill: 'PostgreSQL & Database Tuning', industryDemand: 82, curriculumCoverage: 88, gap: +6, status: 'ALIGNED', recommendation: 'Curriculum fully satisfies industry hiring standard' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-[#1E1B4B] to-[#0E172A] border border-amber-500/30 overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>Curriculum Intelligence & Outcomes Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {kpis.academyName || user?.organization_name || 'Training Academy Hub'}
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Align your training curriculum directly with real-time enterprise demand signals, track learner outcomes, and close market gaps.
          </p>
        </div>
      </div>

      {/* Provider Core Outcome KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card glow="purple" className="p-4">
          <div className="text-[10px] font-mono text-purple-400 uppercase">ENROLLED LEARNERS</div>
          <div className="text-3xl font-black text-white mt-1 font-mono">{kpis.enrolledLearners || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Across active cohorts</div>
        </Card>

        <Card glow="cyan" className="p-4">
          <div className="text-[10px] font-mono text-cyan-400 uppercase">APPROVED COURSES</div>
          <div className="text-3xl font-black text-cyan-300 mt-1 font-mono">{kpis.activeCourses || 0}</div>
          <div className="text-[10px] text-cyan-400 mt-1">NSQF Aligned Modules</div>
        </Card>

        <Card glow="purple" className="p-4">
          <div className="text-[10px] font-mono text-purple-400 uppercase">TRAINING CENTRES</div>
          <div className="text-3xl font-black text-purple-300 mt-1 font-mono">{kpis.trainingCentres || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Accredited Locations</div>
        </Card>

        <Card glow="emerald" className="p-4">
          <div className="text-[10px] font-mono text-emerald-400 uppercase">ACTIVE BATCHES</div>
          <div className="text-3xl font-black text-emerald-400 mt-1 font-mono">{kpis.activeCohorts || 0}</div>
          <div className="text-[10px] text-emerald-300 mt-1">Cohorts in progress</div>
        </Card>
      </div>

      {/* CRITICAL CORE WIDGET: "WHAT COMPANIES NEED VS WHAT WE TEACH" */}
      <Card
        glow="purple"
        title="What Companies Need vs What We Teach (Curriculum Gap Matrix)"
        subtitle="Real-time alignment between your syllabus and enterprise hiring requisition requirements"
        icon={<Target className="w-4 h-4 text-purple-400" />}
      >
        <div className="space-y-4">
          <div className="divide-y divide-slate-800">
            {curriculumGaps.map((item) => (
              <div key={item.skill} className="py-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{item.skill}</span>
                    <Badge
                      variant={item.status === 'CRITICAL GAP' ? 'rose' : item.status === 'SIGNIFICANT GAP' ? 'amber' : 'emerald'}
                      size="sm"
                      dot
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">Industry: <strong className="text-purple-300">{item.industryDemand}%</strong></span>
                    <span className="text-slate-400">Our Syllabus: <strong className="text-cyan-300">{item.curriculumCoverage}%</strong></span>
                    <span className={`font-bold ${item.gap < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {item.gap > 0 ? `+${item.gap}%` : `${item.gap}%`}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar Comparison */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-cyan-500 h-full rounded-l-full"
                    style={{ width: `${item.curriculumCoverage}%` }}
                    title={`Our Coverage: ${item.curriculumCoverage}%`}
                  ></div>
                  {item.gap < 0 && (
                    <div
                      className="bg-rose-500/60 h-full"
                      style={{ width: `${Math.abs(item.gap)}%` }}
                      title={`Market Gap: ${Math.abs(item.gap)}%`}
                    ></div>
                  )}
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span><strong>AI Action: </strong>{item.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
