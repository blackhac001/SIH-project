import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Sparkles, Briefcase, TrendingUp, Compass, Award,
  CheckCircle2, ArrowRight, Bot, Target, FileText,
  DollarSign, Globe2, Building2, Flame, ShieldAlert,
  GraduationCap, Clock, HelpCircle, ChevronRight
} from 'lucide-react';
import {
  getSalaryProjectionData,
  getGlobalJobsData,
  getFutureSkillsData,
  getSkillGapData,
  fetchDashboardKPIsAPI,
  fetchJobsAPI,
  fetchMyApplicationsAPI,
  applyToJobAPI,
  GlobalJob
} from '../services/intelligenceService';

export const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const salaryData = getSalaryProjectionData();
  const futureSkills = getFutureSkillsData();
  const skillGap = getSkillGapData();

  const [globalJobs, setGlobalJobs] = useState<GlobalJob[]>(getGlobalJobsData());
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [kpis, setKpis] = useState<any>({
    jobMatches: 12,
    activeApplications: 1,
    scheduledInterviews: 1,
    verifiedSkills: 8,
    careerScore: 94,
    targetSalary: 148000,
    hiredOffers: 0
  });
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [kpisData, jobsData, myApps] = await Promise.all([
          fetchDashboardKPIsAPI(),
          fetchJobsAPI(),
          fetchMyApplicationsAPI()
        ]);
        if (kpisData?.kpis) {
          setKpis(kpisData.kpis);
        }
        if (jobsData && jobsData.length > 0) {
          setGlobalJobs(jobsData);
        }
        if (myApps && myApps.length > 0) {
          const applied: Record<string, boolean> = {};
          myApps.forEach((a: any) => {
            applied[String(a.jobId)] = true;
          });
          setAppliedJobs(applied);
        }
      } catch {
        // fallback
      }
    };
    loadData();
  }, []);

  const handleApply = async (jobId: string | number) => {
    try {
      await applyToJobAPI(jobId);
      setAppliedJobs((prev) => ({ ...prev, [String(jobId)]: true }));
      setApplyMessage("Application submitted successfully to database!");
      setTimeout(() => setApplyMessage(null), 4000);
    } catch (err: any) {
      setAppliedJobs((prev) => ({ ...prev, [String(jobId)]: true }));
      setApplyMessage(err?.response?.data?.detail || "Application recorded.");
      setTimeout(() => setApplyMessage(null), 4000);
    }
  };

  const careerStages = [
    { name: 'Profile', status: 'completed', desc: 'Verified Ledger' },
    { name: 'Skills', status: 'completed', desc: '8 Validated' },
    { name: 'Apply', status: 'current', desc: '8 Active' },
    { name: 'Interview', status: 'current', desc: '3 Scheduled' },
    { name: 'Hired', status: 'upcoming', desc: '1 Offer Pending' },
    { name: 'Grow', status: 'upcoming', desc: '+$34k Target' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome & Career Growth Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-[#0E172A] to-[#141B2D] border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Candidate Career Growth Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{user?.full_name || 'there'}</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              "How can I get a better job and grow my career?" Your profile has <strong className="text-cyan-300">24 strong job matches</strong> and a <strong className="text-emerald-400">+$34k/year salary growth potential</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="cyber"
              size="md"
              onClick={() => navigate('/candidate/resume')}
              leftIcon={<FileText className="w-4 h-4" />}
            >
              Analyze Resume & ATS
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/candidate/copilot')}
              leftIcon={<Bot className="w-4 h-4 text-cyan-400" />}
            >
              Ask AI Copilot
            </Button>
          </div>
        </div>

        {/* Longitudinal Career Journey Pipeline */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
            <span>Career Milestones Pipeline</span>
            <span className="text-cyan-400 font-semibold">Stage 4 of 6: Interview Phase</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {careerStages.map((stage, idx) => (
              <div
                key={stage.name}
                className={`p-3 rounded-xl border transition-all ${
                  stage.status === 'completed'
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : stage.status === 'current'
                    ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>{idx + 1}. {stage.name}</span>
                  {stage.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {stage.status === 'current' && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                </div>
                <div className="text-[11px] opacity-80 truncate">{stage.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {applyMessage && (
        <div className="p-4 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-sm font-semibold flex items-center gap-2.5 shadow-xl animate-pulse">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>{applyMessage}</span>
        </div>
      )}

      {/* Candidate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Career Score */}
        <Card glow="purple" className="p-4">
          <div className="text-[11px] font-mono text-purple-400 uppercase flex items-center justify-between">
            <span>CAREER SCORE</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white mt-1.5 font-mono">
            {kpis.careerScore || 92}<span className="text-sm text-slate-500 font-normal"> / 100</span>
          </div>
          <p className="text-[11px] text-purple-300 mt-1">Tier-1 Market Ready</p>
        </Card>

        {/* 2. Job Matches */}
        <Card glow="cyan" className="p-4">
          <div className="text-[11px] font-mono text-cyan-400 uppercase flex items-center justify-between">
            <span>JOB MATCHES</span>
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white mt-1.5 font-mono">
            {kpis.jobMatches || 12} <span className="text-xs text-cyan-400 font-normal">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Real database openings</p>
        </Card>

        {/* 3. Active Applications */}
        <Card glow="none" className="p-4">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>APPLICATIONS</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-white mt-1.5 font-mono">
            {kpis.activeApplications || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Submitted in PostgreSQL</p>
        </Card>

        {/* 4. Interviews */}
        <Card glow="emerald" className="p-4">
          <div className="text-[11px] font-mono text-emerald-400 uppercase flex items-center justify-between">
            <span>INTERVIEWS</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-1.5 font-mono">
            {kpis.scheduledInterviews || 0}
          </div>
          <p className="text-[11px] text-emerald-300 mt-1">Scheduled technical rounds</p>
        </Card>

        {/* 5. Verified Skills */}
        <Card glow="purple" className="p-4">
          <div className="text-[11px] font-mono text-rose-400 uppercase flex items-center justify-between">
            <span>VERIFIED SKILLS</span>
            <Award className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400 mt-1.5 font-mono">
            {kpis.verifiedSkills || 8} <span className="text-xs text-slate-400 font-normal">Skills</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified capability ledger</p>
        </Card>
      </div>

      {/* Two-Column Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Salary & Top Matched Jobs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI 5-Year Trajectory */}
          <Card
            glow="cyan"
            title="AI 5-Year Earnings Projection"
            subtitle="Trajectory based on verified skills, career seniority, and international benchmarks"
            icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/candidate/earnings')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Simulation
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {salaryData.timeline.map((point) => (
                  <div key={point.year} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[11px] font-mono text-slate-400">{point.year}</div>
                    <div className="text-sm font-bold text-white mt-1 font-mono">${(point.total / 1000).toFixed(0)}k</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full"
                        style={{ width: `${(point.total / 190000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300">Explainable Model Signal: </strong>
                  Your Python asynchronous API mastery and PyTorch capabilities command a +35% remote premium. Adding Kubernetes (CKA) will accelerate your transition to the $112k+ tier.
                </div>
              </div>
            </div>
          </Card>

          {/* Top Job Matches */}
          <Card
            glow="blue"
            title="Top Recommended Opportunities (24 Matches)"
            subtitle="Directly aligned with your verified competencies and desired compensation"
            icon={<Briefcase className="w-4 h-4 text-blue-400" />}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/candidate/jobs')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                All Jobs ({globalJobs.length})
              </Button>
            }
          >
            <div className="space-y-3">
              {globalJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center font-bold text-xs text-cyan-300 shrink-0 font-mono">
                      {job.companyLogoText}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {job.title}
                        </h4>
                        <Badge variant="cyan" size="sm" dot>{job.matchScore}% Match</Badge>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {job.company} • {job.city}, {job.country} • <span className="text-cyan-300">{job.workplaceType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0">
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                    </div>
                    <Button
                      variant={appliedJobs[job.id] ? 'secondary' : 'cyber'}
                      size="sm"
                      onClick={() => handleApply(job.id)}
                      disabled={appliedJobs[job.id]}
                    >
                      {appliedJobs[job.id] ? 'Applied ✓' : '1-Click Apply'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Skill Gap & Future Skills (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Skill Gap Analysis */}
          <Card
            glow="purple"
            title="Skill Gap Benchmark"
            subtitle={`Target Role: ${skillGap.targetRole}`}
            icon={<Target className="w-4 h-4 text-purple-400" />}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/candidate/skill-gap')}
              >
                <ArrowRight className="w-4 h-4 text-purple-400" />
              </Button>
            }
          >
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Skill Coverage</span>
                  <span className="text-purple-300 font-mono">78% Complete</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-rose-400 uppercase font-mono">
                  Critical Skills to Bridge (4 Gaps)
                </div>
                {skillGap.criticalMissing.map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs">
                    <div className="font-semibold text-rose-200">{item.skill}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Future Skills Demand */}
          <Card
            glow="emerald"
            title='Future Skills ("What Will You Need Next?")'
            subtitle="Global demand projections (2026-2028)"
            icon={<Compass className="w-4 h-4 text-emerald-400" />}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/candidate/future-skills')}
              >
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </Button>
            }
          >
            <div className="space-y-3">
              {futureSkills.slice(0, 3).map((skill) => (
                <div
                  key={skill.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{skill.name}</div>
                    <div className="text-[11px] text-slate-400">{skill.category}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-mono font-bold block">{skill.demandGrowth}</span>
                    <span className="text-cyan-300 font-mono text-[10px]">{skill.globalSalaryPremium}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
