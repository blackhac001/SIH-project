import { RoleType } from '../types/user';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const PLATFORM_NAME = "CONNECTX";
export const PLATFORM_TAGLINE = "Your Skills. Their Opportunities. A Better Future.";

export const ROLE_DETAILS: Record<RoleType, { label: string; badgeColor: string; description: string }> = {
  SUPER_ADMIN: {
    label: 'Global Administrator',
    badgeColor: 'bg-purple-900/40 text-purple-300 border-purple-500/40',
    description: 'Global system governance, AI model parameters and enterprise controls',
  },
  STATE_ADMIN: {
    label: 'Regional Authority',
    badgeColor: 'bg-blue-900/40 text-blue-300 border-blue-500/40',
    description: 'Macro-level workforce intelligence, skill demand policies and regional economic oversight',
  },
  DISTRICT_OFFICER: {
    label: 'Workforce Operations Officer',
    badgeColor: 'bg-cyan-900/40 text-cyan-300 border-cyan-500/40',
    description: 'Local training hub auditing, credential verification and talent deployment',
  },
  TRAINING_PROVIDER: {
    label: 'Academy & Training Provider',
    badgeColor: 'bg-amber-900/40 text-amber-300 border-amber-500/40',
    description: 'Curriculum delivery, cohort analytics, certifications and industry capstones',
  },
  EMPLOYER: {
    label: 'Enterprise / Employer Partner',
    badgeColor: 'bg-indigo-900/40 text-indigo-300 border-indigo-500/40',
    description: 'AI talent acquisition, skill benchmark definitions, interview pipeline and verified hiring',
  },
  CANDIDATE: {
    label: 'Global Talent / Candidate',
    badgeColor: 'bg-teal-900/40 text-teal-300 border-teal-500/40',
    description: 'AI resume intelligence, salary projections, personalized learning roadmaps and job matching',
  },
};

export const GLOBAL_STAGES = [
  { id: 1, name: 'Skill Intelligence', desc: 'Resume parsing, skill taxonomy & baseline verification', icon: 'Brain' },
  { id: 2, name: 'Target Role Matching', desc: 'Benchmarking against global high-growth job profiles', icon: 'Target' },
  { id: 3, name: 'Skill Gap Bridge', desc: 'Curated learning paths & accredited industry certifications', icon: 'Sparkles' },
  { id: 4, name: 'Enterprise Connect', desc: 'Direct outreach, interview invites & recruiter engagement', icon: 'Briefcase' },
  { id: 5, name: 'Placement & Offer', desc: 'Verified hiring contracts with competitive compensation', icon: 'CheckCircle2' },
  { id: 6, name: 'Earnings Progression', desc: 'Longitudinal wage tracking & 5-year salary acceleration', icon: 'TrendingUp' },
];

// ==============================================================================
// DEMO / DEVELOPMENT ACCOUNTS ONLY (Local Sandbox & Evaluation)
// Do NOT use in production. In production, users authenticate via secure OAuth/SSO.
// ==============================================================================
export const DEMO_CREDENTIALS = [
  {
    role: 'CANDIDATE' as RoleType,
    label: 'Alex Rivera (AI / Cloud Candidate)',
    email: 'alex.rivera@connectx.ai',
    password: 'Candidate@12345',
    desc: 'Candidate View: Resume Intelligence, Salary Projections, Skill Gap & Jobs',
  },
  {
    role: 'EMPLOYER' as RoleType,
    label: 'Elena Rostova (Tech Talent Partner - Global)',
    email: 'recruitment@google.com',
    password: 'Employer@12345',
    desc: 'Enterprise View: Candidate Matching, Talent Search & Hiring Funnel',
  },
  {
    role: 'STATE_ADMIN' as RoleType,
    label: 'Dr. Marcus Vance (Workforce Policy Director)',
    email: 'marcus.vance@connectx.org',
    password: 'Admin@12345',
    desc: 'Regional Authority: Global Skills Intelligence & Macro Analytics',
  },
  {
    role: 'TRAINING_PROVIDER' as RoleType,
    label: 'Prof. Sofia Lin (Academy Director)',
    email: 'director@mit-academy.edu',
    password: 'Partner@12345',
    desc: 'Training Provider: Courses, Batches & Student Certification Tracking',
  },
  {
    role: 'SUPER_ADMIN' as RoleType,
    label: 'Global Admin (Platform Master)',
    email: 'admin@connectx.ai',
    password: 'Admin@12345',
    desc: 'Super Admin: Full system control & infrastructure governance',
  },
];
