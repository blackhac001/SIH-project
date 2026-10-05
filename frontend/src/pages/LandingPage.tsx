import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  Sparkles, Globe2, TrendingUp, Compass, Briefcase,
  Bot, ShieldCheck, ArrowRight, CheckCircle2, Building2,
  Users, Award, Zap, FileText, Target, Play, ArrowDown,
  UserCheck, Shield, ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const metrics = [
    { label: 'Active Candidates', value: '1.2M+', sub: 'Verified talent profiles' },
    { label: 'Global Companies', value: '35K+', sub: 'Enterprises & startups' },
    { label: 'Countries Covered', value: '150+', sub: 'International coverage' },
    { label: 'Active Opportunities', value: '10M+', sub: 'Real-time job signals' },
  ];

  const workflowSteps = [
    { step: 1, title: 'Create Profile', desc: 'Upload your CV or sync verified credentials with zero-trust security.', icon: FileText },
    { step: 2, title: 'AI Understands Skills', desc: 'Neural parsing extracts 40+ competencies, ATS readiness, and depth.', icon: Sparkles },
    { step: 3, title: 'Find Opportunities', desc: 'Neural match algorithms rank 10M+ global roles by genuine compatibility.', icon: Target },
    { step: 4, title: 'Connect with Companies', desc: 'Direct two-way messaging, interview invites, and hiring proposals.', icon: Users },
    { step: 5, title: 'Get Hired', desc: 'Verified contracts with competitive compensation and visa sponsorship.', icon: CheckCircle2 },
    { step: 6, title: 'Grow Your Career', desc: 'Longitudinal 5-year salary forecasting, skill gap bridges, and promotion roadmap.', icon: TrendingUp },
  ];

  const aiModules = [
    {
      title: 'AI Job Matching',
      desc: 'Connect with international employers with real-time neural fit scoring, salary transparency, and visa tags.',
      icon: Briefcase,
      badge: 'Neural Match',
      glow: 'cyan' as const,
      route: '/candidate/jobs',
    },
    {
      title: 'Resume / CV Intelligence',
      desc: 'Extract competencies, measure ATS compliance (88/100), detect missing keywords, and benchmark against roles.',
      icon: FileText,
      badge: 'ATS Engine',
      glow: 'purple' as const,
      route: '/candidate/resume',
    },
    {
      title: 'Skill Gap Detection',
      desc: 'Benchmark your verified capabilities against target titles (e.g. Staff AI Architect) with a 12-week bridge curriculum.',
      icon: Target,
      badge: 'Benchmark',
      glow: 'emerald' as const,
      route: '/candidate/skill-gap',
    },
    {
      title: '5-Year Earnings Predictor',
      desc: 'Predict your compensation trajectory from 2026 to 2030 with explainable market drivers and skill boost simulation.',
      icon: TrendingUp,
      badge: 'Longitudinal AI',
      glow: 'emerald' as const,
      route: '/candidate/earnings',
    },
    {
      title: 'Future Skill Forecast',
      desc: 'Predict global technology demand growth (GenAI +58%, Kubernetes +42%) with difficulty and accredited courses.',
      icon: Compass,
      badge: 'Predictive',
      glow: 'blue' as const,
      route: '/candidate/future-skills',
    },
    {
      title: 'Ask AI Career Advisor',
      desc: '24/7 conversational AI assistant answering real-time questions regarding market value, interviews, and relocation.',
      icon: Bot,
      badge: 'Ask AI',
      glow: 'cyan' as const,
      route: '/candidate/copilot',
    },
  ];

  const regionalHiring = [
    { region: 'North America', jobs: '384k Jobs', hotSkill: 'GenAI / LLMOps', avgSalary: '$142,000' },
    { region: 'Western Europe', jobs: '241k Jobs', hotSkill: 'Robotics & CleanTech', avgSalary: '€88,000' },
    { region: 'Asia-Pacific', jobs: '512k Jobs', hotSkill: 'Cloud & FinTech', avgSalary: '$75k - $125k' },
    { region: 'Latin America', jobs: '118k Jobs', hotSkill: 'Full Stack & SaaS', avgSalary: '$52k - $78k' },
  ];

  return (
    <div className="space-y-24 pb-20 overflow-hidden bg-[#080C15] text-slate-100 min-h-screen">
      {/* 1. HERO SECTION WITH HIGH-CONTRAST DARK PALETTE & CONNECTED NODE COMPOSITION */}
      <section className="relative pt-12 lg:pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Background Glows & Cyber Grid */}
        <div className="absolute inset-0 cyber-grid-bg opacity-30 pointer-events-none -z-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading, Subtitle & CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-500/10">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="font-mono tracking-wide">CONNECTX GLOBAL SKILL INTELLIGENCE</span>
            </div>

            {/* Main Headline (Crisp high-contrast white with gradient emphasis words) */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
              Your Skills.<br />
              Their Opportunities.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                A Better Future.
              </span>
            </h1>

            {/* Subtitle (Light gray #CBD5E1, highly readable, max-w-xl) */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
              AI-powered career intelligence connecting candidates, companies, skills and global opportunities.
            </p>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link to="/register">
                <Button
                  variant="cyber"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto shadow-xl shadow-cyan-500/20"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link to="/candidate/dashboard">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Play className="w-4 h-4 text-cyan-400" />}
                  className="w-full sm:w-auto border-slate-700 bg-slate-900/90 hover:bg-slate-800"
                >
                  Explore Platform
                </Button>
              </Link>
            </div>

            {/* Role Quick Selector */}
            <div className="pt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-slate-500">Demo Workspaces:</span>
              <Link to="/candidate/dashboard" className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 transition-colors">
                Candidate
              </Link>
              <Link to="/company/dashboard" className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-purple-300 transition-colors">
                Company
              </Link>
              <Link to="/recruiter/dashboard" className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-blue-300 transition-colors">
                Recruiter
              </Link>
              <Link to="/provider/dashboard" className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-300 transition-colors">
                Provider
              </Link>
              <Link to="/admin/dashboard" className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-emerald-300 transition-colors">
                Admin
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Intelligence Composition (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative p-6 sm:p-7 rounded-3xl bg-[#0D1322]/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl space-y-4">
              {/* Top Card Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
                  <span className="text-xs font-bold text-white font-mono uppercase">Neural Match Engine</span>
                </div>
                <Badge variant="cyan" size="sm" dot>Live Telemetry</Badge>
              </div>

              {/* Floating Match Card 1: Candidate ↔ Job */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white">
                    AR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Alex Rivera</div>
                    <div className="text-[11px] text-cyan-300">Senior AI & Cloud Engineer</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    95% Match
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">Google Cloud AI</div>
                </div>
              </div>

              {/* Floating Match Card 2: 5-Yr Salary Projection */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">5-Year Salary Trajectory</div>
                  <div className="text-sm font-bold text-white font-mono">$92k ➔ <span className="text-emerald-400">$148k / yr</span></div>
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  +60.8% Growth
                </span>
              </div>

              {/* Connected Skills Grid */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Verified Competency Ledger</span>
                  <span className="text-cyan-400">40+ Skills</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Python (94%)', 'PyTorch (86%)', 'Kubernetes (82%)', 'FastAPI (92%)', 'Docker (90%)'].map((sk) => (
                    <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono border border-slate-700">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Ecosystem Status */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                  150+ Sovereign Nations
                </span>
                <span className="text-purple-300 font-mono font-semibold">Zero-Trust Identity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST & DEMO PLATFORM METRICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            {metrics.map((m, idx) => (
              <div key={m.label} className={`text-center ${idx > 0 ? 'pt-4 sm:pt-0 sm:pl-6' : ''}`}>
                <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono">
                  {m.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-1.5">{m.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Badge variant="cyan" size="sm">Demo Platform Metrics</Badge>
            <span>Telemetry reflects simulated global talent, corporate requisitions, and market indicators.</span>
          </div>
        </div>
      </section>

      {/* 3. HOW CONNECTX WORKS (6-STEP PROGRESSION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
        <div className="space-y-3">
          <Badge variant="cyan" size="sm" dot>Workflow Architecture</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How CONNECTX Powers Global Careers
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto">
            From initial resume parsing to long-term 5-year compensation growth, CONNECTX connects every milestone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((ws) => (
            <Card
              key={ws.step}
              glow="cyan"
              className="p-6 text-left space-y-3 hover:scale-[1.01] transition-all bg-slate-900/80 border-slate-800"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-black font-mono text-sm">
                  0{ws.step}
                </div>
                <ws.icon className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-white">{ws.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{ws.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. AI INTELLIGENCE SUITE (6 FEATURE CARDS) */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="purple" size="sm" dot>Intelligence Suite</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Six Core AI Intelligence Modules
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto">
            Neural models trained on 450k+ international offers and verified technical assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiModules.map((feat) => (
            <Card
              key={feat.title}
              glow={feat.glow}
              className="p-6 flex flex-col justify-between group hover:scale-[1.01] transition-all bg-slate-900/80 border-slate-800"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant={feat.glow} size="sm">{feat.badge}</Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800/80">
                <Link
                  to={feat.route}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
                >
                  <span>Explore Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. GLOBAL OPPORTUNITIES & REGIONAL HEATMAP */}
      <section id="map" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0D1322] border border-cyan-500/30 text-center space-y-8 relative overflow-hidden">
          <div className="space-y-2">
            <Badge variant="cyan" size="sm" dot>World Labor Index</Badge>
            <h2 className="text-3xl font-extrabold text-white">Active in 150+ Countries</h2>
            <p className="text-xs text-slate-300 max-w-xl mx-auto">
              Real-time regional skill shortages, remote hiring indices, and cross-border compensation trends.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {regionalHiring.map((reg) => (
              <div key={reg.region} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-white">{reg.region}</div>
                <div className="text-sm font-bold text-cyan-300 font-mono">{reg.jobs}</div>
                <div className="text-[11px] text-slate-400">🔥 {reg.hotSkill}</div>
                <div className="text-[11px] text-emerald-400 font-mono font-semibold">Avg {reg.avgSalary}</div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button
              variant="cyber"
              size="lg"
              onClick={() => navigate('/candidate/map')}
              rightIcon={<Globe2 className="w-5 h-5" />}
            >
              Explore Global Skills Intelligence Map
            </Button>
          </div>
        </div>
      </section>

      {/* 6. CANDIDATE & COMPANY DUAL ECOSYSTEM EXPLANATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Candidates */}
          <Card glow="cyan" className="p-8 space-y-5 bg-slate-900/90 border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">For Candidates & Talent</h3>
                <p className="text-xs text-cyan-300">"How do I get a better job and grow my career?"</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Understand your true earning potential ($78k ➔ $112k) with 5-year trajectory charts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Identify exactly which 4 skills you are missing for Senior Architect roles.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Access curated learning paths, accredited credentials, and direct recruiter outreach.</span>
              </li>
            </ul>

            <Link to="/candidate/dashboard" className="block pt-2">
              <Button variant="cyber" size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Enter Candidate Workspace
              </Button>
            </Link>
          </Card>

          {/* For Companies & Recruiters */}
          <Card glow="purple" className="p-8 space-y-5 bg-slate-900/90 border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">For Companies & Recruiters</h3>
                <p className="text-xs text-purple-300">"Who should I hire and how do I fill roles faster?"</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>AI Candidate Discovery with natural language search and 95%+ skill compatibility fit.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>End-to-end hiring funnel tracking from application to verified placement in 18.4 days.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Real-time talent scarcity alerts to optimize compensation bands before publishing.</span>
              </li>
            </ul>

            <Link to="/company/dashboard" className="block pt-2">
              <Button variant="secondary" size="md" className="w-full border-purple-500/40 text-purple-300 hover:bg-purple-950/40" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Enter Employer Console
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Ready to Accelerate Your Global Career?
        </h2>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          Join over 1.2 million professionals and 35,000 verified enterprise partners on the CONNECTX platform today.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register">
            <Button variant="cyber" size="lg" className="w-full sm:w-auto">
              Create Your AI Profile
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Sign In to Workspace
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
