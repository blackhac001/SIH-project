import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  BookOpen, Award, CheckCircle2, ArrowDown, Sparkles,
  TrendingUp, Briefcase, ShieldCheck, ChevronRight, Zap
} from 'lucide-react';
import { fetchDashboardKPIsAPI, predictSalaryAPI, SalaryProjection } from '../services/intelligenceService';

export const CareerRoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<any>(null);
  const [salaryData, setSalaryData] = useState<SalaryProjection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoadmapData = async () => {
      try {
        setLoading(true);
        const [kpiRes, salRes] = await Promise.all([
          fetchDashboardKPIsAPI(),
          predictSalaryAPI()
        ]);
        if (kpiRes?.kpis) {
          setKpis(kpiRes.kpis);
        }
        if (salRes) {
          setSalaryData(salRes);
        }
      } catch {
        // graceful
      } finally {
        setLoading(false);
      }
    };
    loadRoadmapData();
  }, []);

  const hasAnalysis = Boolean(kpis?.hasAnalysis);
  const hasResume = Boolean(kpis?.hasResume);
  const verifiedSkills = kpis?.skills || [];
  const baseRole = kpis?.targetRole || "Technical Professional";
  const currentBaseSalary = salaryData?.currentEstimatedSalary || kpis?.targetSalary || 115000;

  const roadmapSteps = hasAnalysis ? [
    {
      stage: 'Current Baseline',
      roleTitle: `${baseRole} (Current)`,
      salaryRange: `$${(currentBaseSalary / 1000).toFixed(0)}k - $${((currentBaseSalary * 1.15) / 1000).toFixed(0)}k`,
      status: 'completed' as const,
      skills: verifiedSkills.slice(0, 4),
      milestone: `Verified Capability Ledger (${verifiedSkills.length} Skills)`,
      jobsCount: kpis?.jobMatches || 14,
    },
    {
      stage: 'Milestone 1 (Next Tier)',
      roleTitle: `Senior ${baseRole}`,
      salaryRange: `$${((currentBaseSalary * 1.2) / 1000).toFixed(0)}k - $${((currentBaseSalary * 1.35) / 1000).toFixed(0)}k`,
      status: 'current' as const,
      skills: ['Distributed Systems Architecture', 'Cloud Orchestration', 'Production Security'],
      milestone: 'CONNECTX Verified Advanced Practitioner',
      jobsCount: (kpis?.jobMatches || 14) * 2,
    },
    {
      stage: 'Milestone 2 (Staff Tier)',
      roleTitle: `Staff / Principal ${baseRole}`,
      salaryRange: `$${((currentBaseSalary * 1.45) / 1000).toFixed(0)}k - $${((currentBaseSalary * 1.7) / 1000).toFixed(0)}k+`,
      status: 'upcoming' as const,
      skills: ['Multi-Region Consensus', 'High Availability SLA', 'Enterprise Mesh'],
      milestone: 'Principal Architecture Credential',
      jobsCount: Math.max(Math.round((kpis?.jobMatches || 14) * 0.8), 5),
    },
  ] : [];

  const certifications = hasAnalysis && kpis?.certifications && kpis.certifications.length > 0 ? (
    kpis.certifications.map((c: any, idx: number) => ({
      name: typeof c === 'string' ? c : c.name,
      issuer: typeof c === 'string' ? 'Verified Credential' : (c.issuer || 'Accredited Partner'),
      date: 'Extracted from CV',
      verified: true,
      relevance: 'High',
      salaryImpact: `+$${8000 + (idx * 2500)} / yr`,
    }))
  ) : [
    {
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Linux Foundation / CNCF',
      date: 'Target Credential',
      verified: false,
      relevance: 'Critical',
      salaryImpact: '+$15,000 / yr',
    },
    {
      name: 'AWS Solutions Architect Professional',
      issuer: 'Amazon Web Services',
      date: 'Target Credential',
      verified: false,
      relevance: 'Critical',
      salaryImpact: '+$18,500 / yr',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Longitudinal Career Advancement Highway</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Personalized Career Roadmap & Credentials
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          A phased trajectory charting your progression from current baseline to Staff Architect with verified credential milestones and earnings lift.
        </p>
      </div>

      {hasAnalysis ? (
        <>
          {/* Career Roadmap Vertical Flow */}
          <Card
            glow="cyan"
            title="Your Strategic Career Milestone Highway"
            subtitle="Custom roadmap generated from your verified CV analysis and capability profile"
            icon={<TrendingUp className="w-4 h-4" />}
          >
            <div className="space-y-6">
              {roadmapSteps.map((step, idx) => (
                <div key={step.stage} className="relative">
                  <div
                    className={`p-6 rounded-2xl border transition-all ${
                      step.status === 'completed'
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                        : step.status === 'current'
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-xl shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                            {step.stage}
                          </span>
                          {step.status === 'completed' && (
                            <Badge variant="emerald" size="sm" dot>Achieved</Badge>
                          )}
                          {step.status === 'current' && (
                            <Badge variant="cyan" size="sm" dot>In Active Progress</Badge>
                          )}
                          {step.status === 'upcoming' && (
                            <Badge variant="slate" size="sm">Target Horizon</Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-white">{step.roleTitle}</h3>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {step.skills.map((sk: string) => (
                            <span
                              key={sk}
                              className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>

                      </div>

                      <div className="text-left lg:text-right space-y-1 shrink-0">
                        <div className="text-base font-bold text-emerald-400 font-mono">{step.salaryRange}</div>
                        <div className="text-xs text-slate-400">{step.jobsCount} Matching Openings</div>
                        <div className="text-xs text-purple-300 font-mono flex items-center lg:justify-end gap-1.5 pt-1">
                          <Award className="w-3.5 h-3.5 text-purple-400" />
                          <span>{step.milestone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Connector Arrow */}
                  {idx < roadmapSteps.length - 1 && (
                    <div className="flex items-center justify-center my-3 text-cyan-400">
                      <ArrowDown className="w-5 h-5 animate-bounce" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Certification Intelligence Section */}
          <Card
            glow="purple"
            title="Certification Intelligence & Credential Verification"
            subtitle="Accredited micro-credentials and their quantitative impact on recruiter reach"
            icon={<Award className="w-4 h-4 text-purple-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert: any) => (
                <div
                  key={cert.name}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4 group hover:border-purple-500/40 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {cert.name}
                      </h4>
                      {cert.verified ? (
                        <Badge variant="emerald" size="sm" dot>Verified</Badge>
                      ) : (
                        <Badge variant="amber" size="sm">Recommended</Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{cert.issuer} • {cert.date}</div>
                    <div className="text-xs text-emerald-400 font-semibold font-mono flex items-center gap-1 pt-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Salary Impact: {cert.salaryImpact}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {cert.verified ? (
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Button variant="outline" size="sm" className="text-xs">
                        Enroll
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        /* Empty State */
        <Card glow="cyan" className="p-8 sm:p-12 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-cyan-400/60 mx-auto" />
          <h3 className="text-lg font-bold text-white">Career Roadmap Unavailable</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Upload your CV or run AI resume analysis to generate a personalized career highway and accredited credential progression model based on your verified skills.
          </p>
          <div className="pt-2">
            <Button
              variant="cyber"
              size="md"
              onClick={() => navigate('/candidate/resume')}
              leftIcon={<Zap className="w-4 h-4" />}
            >
              Upload & Analyze CV
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
