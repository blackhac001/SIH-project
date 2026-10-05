import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ResumeUploadCard } from '../components/common/ResumeUploadCard';
import {
  Briefcase, CheckCircle2, TrendingUp, Sparkles, ArrowRight,
  ShieldCheck, FileText, Bot, DollarSign, Award, Target,
  Compass, RefreshCw, AlertCircle, AlertTriangle, GraduationCap,
  Calendar, Layers, Star, Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { fetchDashboardKPIsAPI, fetchFutureSkillsAPI, fetchJobsAPI } from '../services/intelligenceService';
import { resumeService } from '../services/resumeService';

// Inline stat card — used only in this file since shared StatCard doesn't exist
const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  glow?: string;
}> = ({ label, value, icon, change, trend }) => (
  <div className="relative rounded-2xl p-4 bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      {icon}
    </div>
    <span className="text-2xl font-extrabold text-white">{value}</span>
    <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-slate-500'}`}>{change}</span>
  </div>
);


export const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [kpis, setKpis] = useState<{
    jobMatches: number;
    activeApplications: number;
    scheduledInterviews: number;
    verifiedSkills: number;
    careerScore: number;
    resumeScore: number;
    jobReadiness: number;
    targetSalary: number;
    hiredOffers: number;
    hasResume: boolean;
    hasAnalysis: boolean;
    profileCompletion: number;
    targetRole?: string;
    seniority?: string;
    summary?: string;
    skills?: string[];
    education?: any[];
    experience?: any[];
    projects?: any[];
    certifications?: any[];
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    missingSections?: string[];
  }>({
    jobMatches: 0,
    activeApplications: 0,
    scheduledInterviews: 0,
    verifiedSkills: 0,
    careerScore: 0,
    resumeScore: 0,
    jobReadiness: 0,
    targetSalary: 0,
    hiredOffers: 0,
    hasResume: false,
    hasAnalysis: false,
    profileCompletion: 0,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [futureSkills, setFutureSkills] = useState<any[]>([]);
  const [globalJobs, setGlobalJobs] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const [kpiRes, skillsRes, jobsRes] = await Promise.all([
        fetchDashboardKPIsAPI().catch(() => ({
          role: 'CANDIDATE',
          kpis: {
            jobMatches: 0,
            activeApplications: 0,
            scheduledInterviews: 0,
            verifiedSkills: 0,
            careerScore: 0,
            resumeScore: 0,
            jobReadiness: 0,
            targetSalary: 0,
            hiredOffers: 0,
            hasResume: false,
            hasAnalysis: false,
            profileCompletion: 0
          },
          recentActivity: []
        })),
        fetchFutureSkillsAPI().catch(() => []),
        fetchJobsAPI().catch(() => []),
      ]);

      if (kpiRes && kpiRes.kpis) {
        setKpis(kpiRes.kpis);
      }
      if (kpiRes && kpiRes.recentActivity) {
        setRecentActivities(kpiRes.recentActivity);
      }
      setFutureSkills(skillsRes || []);
      setGlobalJobs(jobsRes || []);
    } catch (err: any) {
      console.error('Failed to load candidate dashboard data:', err);
      setErrorMsg('Failed to sync live dashboard data from PostgreSQL database.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      setErrorMsg(null);
      await resumeService.analyze("Senior AI & Cloud Platform Engineer");
      setSuccessMsg("AI Resume Analysis complete! Capability ledger and dashboard metrics updated.");
      await loadData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error("AI Analysis error:", err);
      const detail = err.response?.data?.detail || "Could not complete AI analysis. Please ensure your CV has readable text.";
      setErrorMsg(detail);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const hasResume = Boolean(kpis.hasResume);
  const hasAnalysis = Boolean(kpis.hasAnalysis);

  const careerStages = [
    {
      name: 'Profile',
      status: 'completed' as const,
      desc: kpis.profileCompletion ? `${kpis.profileCompletion}% Complete` : 'Verified Identity'
    },
    {
      name: 'Skills',
      status: hasAnalysis && kpis.verifiedSkills > 0 ? ('completed' as const) : ('current' as const),
      desc: hasAnalysis && kpis.verifiedSkills > 0 ? `${kpis.verifiedSkills} Validated` : 'Upload & Analyse'
    },
    {
      name: 'Apply',
      status: kpis.activeApplications > 0 ? ('completed' as const) : ('current' as const),
      desc: kpis.activeApplications > 0 ? `${kpis.activeApplications} Active` : 'Browse Openings'
    },
    {
      name: 'Interview',
      status: kpis.scheduledInterviews > 0 ? ('completed' as const) : ('upcoming' as const),
      desc: kpis.scheduledInterviews > 0 ? `${kpis.scheduledInterviews} Scheduled` : '0 Scheduled'
    },
    {
      name: 'Hired',
      status: kpis.hiredOffers > 0 ? ('completed' as const) : ('upcoming' as const),
      desc: kpis.hiredOffers > 0 ? `${kpis.hiredOffers} Confirmed` : 'Offers'
    },
    {
      name: 'Grow',
      status: hasAnalysis ? ('current' as const) : ('upcoming' as const),
      desc: kpis.targetSalary > 0 ? `$${Math.round(kpis.targetSalary / 1000)}k Target` : 'AI Forecast'
    },
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
              {hasAnalysis ? (
                <>
                  Your verified profile has <strong className="text-cyan-300">{kpis.jobMatches || globalJobs.length} active job matches</strong>, an ATS Resume Score of <strong className="text-emerald-400">{kpis.careerScore || kpis.resumeScore}/100</strong>, and Job Readiness of <strong className="text-purple-300">{kpis.jobReadiness || kpis.careerScore}%</strong>.
                </>
              ) : hasResume ? (
                <>
                  Your CV is stored in PostgreSQL and ready for analysis. Click <strong className="text-cyan-300">Analyse</strong> to generate your AI career intelligence and verified skill score.
                </>
              ) : (
                <>
                  Upload your CV below and click <strong className="text-cyan-300">Analyse</strong> to unlock AI-powered career matchmaking, skill extraction, and personalized earnings projections.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasResume && !hasAnalysis ? (
              <Button
                variant="cyber"
                size="md"
                onClick={handleRunAnalysis}
                isLoading={isAnalyzing}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Analyse CV Now
              </Button>
            ) : (
              <Button
                variant="cyber"
                size="md"
                onClick={() => navigate('/candidate/resume')}
                leftIcon={<FileText className="w-4 h-4" />}
              >
                {hasAnalysis ? "Review ATS Score" : "Upload & Analyse CV"}
              </Button>
            )}
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/candidate/copilot')}
              leftIcon={<Bot className="w-4 h-4 text-cyan-400" />}
            >
              Ask AI
            </Button>
          </div>
        </div>

        {/* Longitudinal Career Journey Pipeline */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
            <span>Career Milestones Pipeline</span>
            <span className="text-cyan-400 font-semibold">
              {hasAnalysis
                ? 'Stage 6 of 6: Growth & Compensation Phase'
                : hasResume
                ? 'Stage 2 of 6: AI Verification Pending'
                : 'Stage 1 of 6: Initial Profile Setup'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {careerStages.map((stage, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all ${
                  stage.status === 'completed'
                    ? 'bg-cyan-950/30 border-cyan-500/40 text-white'
                    : stage.status === 'current'
                    ? 'bg-blue-950/40 border-blue-500/50 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                    Step 0{idx + 1}
                  </span>
                  {stage.status === 'completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : stage.status === 'current' ? (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  )}
                </div>
                <div className="text-xs font-bold truncate">{stage.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{stage.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 6 Real Database KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Resume ATS Score"
          value={hasAnalysis ? `${kpis.careerScore || kpis.resumeScore || 0}%` : '0%'}
          icon={<ShieldCheck className="w-5 h-5 text-cyan-400" />}
          change={hasAnalysis ? `${kpis.seniority || 'Analyzed'}` : '0%'}
          trend={hasAnalysis ? 'up' : 'neutral'}
          glow="cyan"
        />

        <StatCard
          label="Job Matches"
          value={hasAnalysis ? (kpis.jobMatches > 0 ? `${kpis.jobMatches}%` : '0%') : '0%'}
          icon={<Briefcase className="w-5 h-5 text-blue-400" />}
          change={hasAnalysis ? 'Live in DB' : '0%'}
          trend={hasAnalysis ? 'up' : 'neutral'}
          glow="blue"
        />

        <StatCard
          label="Active Applications"
          value={kpis.activeApplications > 0 ? kpis.activeApplications.toString() : '0%'}
          icon={<Target className="w-5 h-5 text-purple-400" />}
          change={kpis.activeApplications > 0 ? 'Submitted' : '0%'}
          trend={kpis.activeApplications > 0 ? 'up' : 'neutral'}
          glow="purple"
        />

        <StatCard
          label="Interviews"
          value={kpis.scheduledInterviews > 0 ? kpis.scheduledInterviews.toString() : '0%'}
          icon={<Calendar className="w-5 h-5 text-emerald-400" />}
          change={kpis.scheduledInterviews > 0 ? 'Scheduled' : '0%'}
          trend={kpis.scheduledInterviews > 0 ? 'up' : 'neutral'}
          glow="emerald"
        />

        <StatCard
          label="Verified Skills"
          value={hasAnalysis && kpis.verifiedSkills > 0 ? kpis.verifiedSkills.toString() : '0%'}
          icon={<Award className="w-5 h-5 text-amber-400" />}
          change={hasAnalysis ? 'In Capability Ledger' : '0%'}
          trend={hasAnalysis ? 'up' : 'neutral'}
          glow="none"
        />

        <StatCard
          label="5-Yr Target Comp"
          value={hasAnalysis && kpis.targetSalary > 0 ? `$${Math.round(kpis.targetSalary / 1000)}k` : '$0'}
          icon={<DollarSign className="w-5 h-5 text-pink-400" />}
          change={hasAnalysis ? 'AI Market Forecast' : '$0'}
          trend={hasAnalysis ? 'up' : 'neutral'}
          glow="none"
        />
      </div>

      {/* Main Two-Column Workflow Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 Cols): CV Upload Card + Live Jobs Feed */}
        <div className="lg:col-span-8 space-y-8">
          {/* User-Specific CV Upload & Text Extraction Component */}
          <ResumeUploadCard
            glow="cyan"
            isAnalyzing={isAnalyzing}
            onAnalyzeClick={handleRunAnalysis}
            onUploadSuccess={() => {
              loadData();
            }}
            onDeleteSuccess={() => {
              loadData();
            }}
            onAnalyzeSuccess={() => {
              loadData();
            }}
          />

          {/* Database-Derived High-Match Job Opportunities */}
          <Card
            glow="blue"
            title="Database Job Opportunities"
            subtitle="Genuine openings in Maharashtra"
            icon={<Briefcase className="w-4 h-4 text-blue-400" />}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/jobs')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View All Jobs
              </Button>
            }
          >
            {globalJobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {globalJobs.slice(0, 4).map((job: any) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all group flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {job.title}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono shrink-0 border border-cyan-500/30">
                          {job.job_type || 'Full-time'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span>{job.employer_name || 'Enterprise Partner'}</span>
                        <span>•</span>
                        <span>{job.location || 'Mumbai / Remote'}</span>
                      </div>
                      {job.salary_range && (
                        <div className="text-xs text-emerald-400 font-mono font-semibold">
                          {job.salary_range}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {job.openings ? `${job.openings} opening(s)` : 'Active Requisition'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 p-0 h-auto"
                      >
                        Apply Now →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-2">
                <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Loading open job postings from PostgreSQL...</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (4 Cols): Future Skills & Ask AI */}
        <div className="lg:col-span-4 space-y-8">
          {/* Emerging Tech Skills Telemetry */}
          <Card
            glow="emerald"
            title="High-Demand 2026 Skills"
            subtitle="Market demand & compensation premiums"
            icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          >
            {futureSkills.length > 0 ? (
              <div className="space-y-2.5">
                {futureSkills.slice(0, 4).map((skill: any) => (
                  <div
                    key={skill.id}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between text-xs hover:border-emerald-500/40 transition-colors"
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
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-2">
                <Compass className="w-8 h-8 text-emerald-400/60 mx-auto" />
                <p className="text-xs text-slate-400">Loading emerging skill telemetry...</p>
              </div>
            )}
          </Card>

          {/* Ask AI Quick Assistant Card */}
          <Card
            glow="cyan"
            title="Ask AI Career Advisor"
            subtitle="Grounded in your verified profile & ATS metrics"
            icon={<Bot className="w-4 h-4 text-cyan-400" />}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/candidate/copilot')}
              >
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </Button>
            }
          >
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Ask AI anything about your career progression, resume optimization, or interview prep:
              </p>
              <div className="space-y-1.5">
                {[
                  "What skills are currently in my CV?",
                  "How can I improve my resume?",
                  "What jobs should I target?",
                  "Explain my strongest skill."
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate('/candidate/copilot')}
                    className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-left text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-between group"
                  >
                    <span className="truncate">"{prompt}"</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
              <Button
                variant="cyber"
                size="sm"
                className="w-full"
                onClick={() => navigate('/candidate/copilot')}
                leftIcon={<Bot className="w-4 h-4" />}
              >
                Launch Ask AI
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Verified CV Insights & Profile Capability Ledger */}
      {hasAnalysis ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Verified Career Document Intelligence
              </h2>
            </div>
            <Badge variant="emerald" size="sm" dot>AI Analyzed</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Summary & Extracted Skills (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Executive Summary */}
              {kpis.summary && (
                <Card glow="blue" className="p-5">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono mb-1">
                        Executive AI Profile Summary
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {kpis.summary}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Verified Extracted Skills */}
              <Card
                glow="cyan"
                title={`Verified Competency Ledger (${kpis.skills?.length || 0} Skills)`}
                subtitle="Capabilities extracted directly from your uploaded CV document"
                icon={<Award className="w-4 h-4 text-cyan-400" />}
              >
                {kpis.skills && kpis.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {kpis.skills.map((sk: string) => (
                      <span
                        key={sk}
                        className="text-xs px-3 py-1.5 rounded-xl bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 font-mono flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{sk}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No skills extracted yet.</p>
                )}
              </Card>

              {/* Work Experience */}
              {kpis.experience && kpis.experience.length > 0 && (
                <Card
                  glow="purple"
                  title="Extracted Experience History"
                  subtitle="Verified professional timeline"
                  icon={<Briefcase className="w-4 h-4 text-purple-400" />}
                >
                  <div className="space-y-3">
                    {kpis.experience.map((exp: any, i: number) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{exp.title || exp.role}</h4>
                          <span className="text-[11px] text-purple-300 font-mono">{exp.duration || exp.dates || exp.year}</span>
                        </div>
                        <div className="text-xs text-slate-400">{exp.company} {exp.location ? `• ${exp.location}` : ''}</div>
                        {exp.highlights && exp.highlights.length > 0 && (
                          <div className="pt-1 text-[11px] text-slate-400 space-y-0.5">
                            {exp.highlights.slice(0, 2).map((h: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <span className="text-purple-400">•</span>
                                <span>{h}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right: Strengths, Weaknesses, Recommendations (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Strengths Card */}
              <Card
                glow="emerald"
                title="Profile Strengths"
                subtitle="Identified from verified achievements"
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              >
                {kpis.strengths && kpis.strengths.length > 0 ? (
                  <div className="space-y-2">
                    {kpis.strengths.map((str: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Solid technical foundation recorded.</p>
                )}
              </Card>

              {/* Weaknesses / Gaps Card */}
              <Card
                glow="none"
                title="Identified Areas to Improve"
                subtitle="Gaps detected relative to target role"
                icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
              >
                {kpis.weaknesses && kpis.weaknesses.length > 0 ? (
                  <div className="space-y-2">
                    {kpis.weaknesses.map((w: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No critical weaknesses detected.</p>
                )}
              </Card>

              {/* Actionable Recommendations */}
              {kpis.recommendations && kpis.recommendations.length > 0 && (
                <Card
                  glow="cyan"
                  title="Targeted Career Recommendations"
                  subtitle="Prioritized next steps"
                  icon={<Zap className="w-4 h-4 text-cyan-400" />}
                >
                  <div className="space-y-2.5">
                    {kpis.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State when no CV is analyzed */
        <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">
              {hasResume ? "CV Uploaded • Ready for AI Analysis" : "No CV Uploaded Yet"}
            </h3>
            <p className="text-xs text-slate-400">
              {hasResume
                ? "Your document is saved in PostgreSQL. Click 'Analyse CV Now' to extract your verified skills, ATS score, and benchmark comparisons."
                : "Upload your CV (PDF or DOCX format) to generate your verified capability ledger, ATS score, and custom career roadmap."}
            </p>
          </div>
          <div>
            {hasResume ? (
              <Button
                variant="cyber"
                size="md"
                onClick={handleRunAnalysis}
                isLoading={isAnalyzing}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Analyse CV Now
              </Button>
            ) : (
              <Button
                variant="cyber"
                size="md"
                onClick={() => navigate('/candidate/resume')}
                leftIcon={<FileText className="w-4 h-4" />}
              >
                Upload CV Document
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
