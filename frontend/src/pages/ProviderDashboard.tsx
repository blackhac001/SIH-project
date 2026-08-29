import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  GraduationCap, Users, BookOpen, Award, TrendingUp,
  Building2, Compass, CheckCircle2, AlertTriangle, Sparkles,
  ArrowRight, BarChart3, PieChart, Target
} from 'lucide-react';

export const ProviderDashboard: React.FC = () => {
  const curriculumGaps = [
    { skill: 'Generative AI & LLMOps', industryDemand: 96, curriculumCoverage: 48, gap: -48, status: 'CRITICAL GAP', recommendation: 'Introduce Distributed PyTorch & vLLM Inference Lab' },
    { skill: 'Kubernetes & Service Mesh', industryDemand: 92, curriculumCoverage: 65, gap: -27, status: 'SIGNIFICANT GAP', recommendation: 'Add Istio & Helm Production Cluster Deployment' },
    { skill: 'Cybersecurity Threat Hunting', industryDemand: 84, curriculumCoverage: 42, gap: -42, status: 'CRITICAL GAP', recommendation: 'Integrate Adversarial ML & Red Teaming Module' },
    { skill: 'Python REST Microservices', industryDemand: 88, curriculumCoverage: 94, gap: +6, status: 'ALIGNED', recommendation: 'Curriculum fully satisfies industry hiring standard' },
    { skill: 'PostgreSQL & Database Tuning', industryDemand: 82, curriculumCoverage: 88, gap: +6, status: 'ALIGNED', recommendation: 'Curriculum fully satisfies industry hiring standard' },
  ];

  const employerFeedbacks = [
    { company: 'Google Cloud AI', score: 4.8, comment: 'Graduates demonstrate outstanding asynchronous Python fundamentals, but need more hands-on GPU cluster experience.' },
    { company: 'Microsoft Azure', score: 4.6, comment: 'Strong API architecture discipline. Recommend integrating Terraform and Azure Kubernetes Service capstones.' },
    { company: 'Siemens Industrial', score: 4.7, comment: 'Excellent problem solving skills. Verified certifications mapped accurately to our automation workflows.' },
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
            MIT Tech Academy — Training Intelligence Hub
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            "What skills should we teach?" Align your curriculum directly with real-time enterprise demand signals, track learner outcomes, and close market gaps.
          </p>
        </div>
      </div>

      {/* Provider Core Outcome KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card glow="purple" className="p-4">
          <div className="text-[10px] font-mono text-purple-400 uppercase">ENROLLED LEARNERS</div>
          <div className="text-3xl font-black text-white mt-1 font-mono">1,480</div>
          <div className="text-[10px] text-slate-400 mt-1">Across 12 cohorts</div>
        </Card>

        <Card glow="cyan" className="p-4">
          <div className="text-[10px] font-mono text-cyan-400 uppercase">COMPLETION RATE</div>
          <div className="text-3xl font-black text-cyan-300 mt-1 font-mono">88.4%</div>
          <div className="text-[10px] text-cyan-400 mt-1">+4.2% vs last term</div>
        </Card>

        <Card glow="purple" className="p-4">
          <div className="text-[10px] font-mono text-purple-400 uppercase">CERTIFICATIONS ISSUED</div>
          <div className="text-3xl font-black text-purple-300 mt-1 font-mono">1,120</div>
          <div className="text-[10px] text-slate-400 mt-1">Verified on-chain/ledger</div>
        </Card>

        <Card glow="emerald" className="p-4">
          <div className="text-[10px] font-mono text-emerald-400 uppercase">VERIFIED PLACEMENT RATE</div>
          <div className="text-3xl font-black text-emerald-400 mt-1 font-mono">84.6%</div>
          <div className="text-[10px] text-emerald-300 mt-1">Hired within 90 days</div>
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

      {/* Two-Column Section: Employer Feedback & Course Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employer Feedback on Graduates */}
        <Card
          glow="cyan"
          title="Industry Employer Feedback"
          subtitle="Direct ratings and review telemetry from hiring enterprise partners"
          icon={<Building2 className="w-4 h-4 text-cyan-400" />}
        >
          <div className="space-y-3">
            {employerFeedbacks.map((fb, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{fb.company}</span>
                  <span className="font-mono text-amber-400 font-semibold">★ {fb.score} / 5.0</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">"{fb.comment}"</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended New Modules to Maximize Employability */}
        <Card
          glow="emerald"
          title="Recommended High-Impact Modules"
          subtitle="Courses projected to yield the highest graduate placement rates"
          icon={<Compass className="w-4 h-4 text-emerald-400" />}
        >
          <div className="space-y-3">
            {[
              { title: 'Distributed LLMOps & GPU Cluster Scaling', boost: '+42% Placement Velocity', weeks: '8 Weeks' },
              { title: 'Production Istio & Kubernetes Mesh Engineering', boost: '+35% Salary Lift', weeks: '6 Weeks' },
              { title: 'Zero-Trust Cloud Security with eBPF', boost: '+38% Employer Inquiries', weeks: '8 Weeks' },
            ].map((course, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white">{course.title}</div>
                  <div className="text-[11px] text-emerald-400 font-mono mt-0.5">{course.boost}</div>
                </div>
                <Button variant="outline" size="sm" className="text-xs shrink-0">
                  Add to Catalog
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
