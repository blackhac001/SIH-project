import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../common/Logo';
import {
  LayoutDashboard, User, Sparkles, Briefcase, FileText,
  BookOpen, TrendingUp, Compass, Bot, MessageSquare,
  Bell, Settings, Building2, Users, PieChart,
  Globe2, CheckCircle2, Search, Award, ShieldAlert,
  GraduationCap, Target, ShieldCheck, BarChart3, Database
} from 'lucide-react';

export type UserRole = 'candidate' | 'company' | 'recruiter' | 'provider' | 'admin';

interface SidebarProps {
  currentRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  isOpen,
  onClose,
}) => {
  const location = useLocation();
  const { user } = useAuth();

  // 1. Candidate Navigation
  const candidateNav = [
    {
      group: 'Career Workspace',
      items: [
        { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', path: '/candidate/profile', icon: User },
        { label: 'My Skills & CV', path: '/candidate/resume', icon: FileText, badge: 'AI' },
      ],
    },
    {
      group: 'Intelligence & Predictions',
      items: [
        { label: 'AI Salary Predictor', path: '/candidate/earnings', icon: TrendingUp, badge: '5-Yr' },
        { label: 'AI Skill Gap', path: '/candidate/skill-gap', icon: Target },
        { label: 'Future Skills', path: '/candidate/future-skills', icon: Compass, badge: 'Hot' },
        { label: 'Career Roadmap', path: '/candidate/roadmap', icon: BookOpen },
        { label: 'Ask AI', path: '/candidate/copilot', icon: Bot, badge: 'Live' },
      ],
    },
    {
      group: 'Opportunities & Connect',
      items: [
        { label: 'Global Jobs', path: '/candidate/jobs', icon: Briefcase },
        { label: 'Applications', path: '/candidate/applications', icon: CheckCircle2 },
        { label: 'Global Skills Map', path: '/candidate/map', icon: Globe2 },
        { label: 'Messages', path: '/candidate/messages', icon: MessageSquare, badge: '3' },
        { label: 'Notifications', path: '/candidate/notifications', icon: Bell, badge: '5' },
      ],
    },
  ];

  // 2. Company / Employer Navigation
  const companyNav = [
    {
      group: 'Enterprise Hiring',
      items: [
        { label: 'Dashboard', path: '/company/dashboard', icon: Building2 },
        { label: 'Manage Jobs', path: '/company/jobs', icon: Briefcase },
        { label: 'AI Matching', path: '/company/candidates', icon: Target, badge: 'AI' },
        { label: 'Applications', path: '/company/applications', icon: FileText },
        { label: 'Interviews', path: '/company/interviews', icon: Users },
        { label: 'Hired & Placed', path: '/company/hired', icon: CheckCircle2 },
      ],
    },
    {
      group: 'Insights & Talent',
      items: [
        { label: 'Hiring Analytics', path: '/company/analytics', icon: PieChart },
        { label: 'Global Skills Map', path: '/company/map', icon: Globe2 },
        { label: 'Messages', path: '/company/messages', icon: MessageSquare, badge: '2' },
        { label: 'Company Profile', path: '/company/profile', icon: Building2 },
      ],
    },
  ];

  // 3. Recruiter Navigation
  const recruiterNav = [
    {
      group: 'Talent Sourcing',
      items: [
        { label: 'Recruiter Home', path: '/recruiter/dashboard', icon: LayoutDashboard },
        { label: 'AI Talent Search', path: '/recruiter/search', icon: Search, badge: 'NLP' },
        { label: 'Global Talent Pool', path: '/recruiter/candidates', icon: Users },
        { label: 'Active Requisitions', path: '/recruiter/jobs', icon: Briefcase },
        { label: 'Shortlists', path: '/recruiter/shortlists', icon: CheckCircle2 },
        { label: 'Interviews', path: '/recruiter/interviews', icon: Users },
      ],
    },
    {
      group: 'Recruiter Velocity',
      items: [
        { label: 'Recruiter Analytics', path: '/recruiter/analytics', icon: BarChart3 },
        { label: 'Messages', path: '/recruiter/messages', icon: MessageSquare, badge: '4' },
      ],
    },
  ];

  // 4. Training / Education Provider Navigation
  const providerNav = [
    {
      group: 'Academy & Curriculum',
      items: [
        { label: 'Dashboard', path: '/provider/dashboard', icon: GraduationCap },
        { label: 'Learners Cohort', path: '/provider/learners', icon: Users },
        { label: 'Courses & Batches', path: '/provider/courses', icon: BookOpen },
        { label: 'Certifications', path: '/provider/certifications', icon: Award },
        { label: 'Placement Outcomes', path: '/provider/outcomes', icon: TrendingUp },
      ],
    },
    {
      group: 'Market Alignment',
      items: [
        { label: 'Employer Demand', path: '/provider/employer-demand', icon: Building2, badge: 'Gap' },
        { label: 'Future Skill Forecast', path: '/provider/future-skills', icon: Compass },
        { label: 'Academy Analytics', path: '/provider/analytics', icon: PieChart },
      ],
    },
  ];

  // 5. Admin Navigation
  const adminNav = [
    {
      group: 'Ecosystem Oversight',
      items: [
        { label: 'Overview & Health', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Global Intelligence', path: '/admin/intelligence', icon: Globe2, badge: 'Live' },
        { label: 'Candidate Registry', path: '/admin/candidates', icon: Users },
        { label: 'Enterprise Network', path: '/admin/companies', icon: Building2 },
        { label: 'Skills Taxonomy', path: '/admin/skills', icon: Database },
      ],
    },
    {
      group: 'Governance & Security',
      items: [
        { label: 'Macro Analytics', path: '/admin/analytics', icon: BarChart3 },
        { label: 'AI Model Insights', path: '/admin/ai-insights', icon: Sparkles },
        { label: 'Anomaly Detection', path: '/admin/anomalies', icon: ShieldAlert },
        { label: 'Audit Logs', path: '/admin/audit', icon: ShieldCheck },
        { label: 'Governance Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const roleNavMap: Record<UserRole, typeof candidateNav> = {
    candidate: candidateNav,
    company: companyNav,
    recruiter: recruiterNav,
    provider: providerNav,
    admin: adminNav,
  };

  const navGroups = roleNavMap[currentRole] || candidateNav;

  const roleLabels: Record<UserRole, { title: string; color: string; badge: string }> = {
    candidate: { title: user?.full_name || 'Candidate', color: 'text-cyan-400', badge: 'Candidate View' },
    company: { title: user?.full_name || 'Company', color: 'text-purple-400', badge: 'Employer View' },
    recruiter: { title: user?.full_name || 'Recruiter', color: 'text-blue-400', badge: 'Recruiter View' },
    provider: { title: user?.full_name || 'Provider', color: 'text-amber-400', badge: 'Provider View' },
    admin: { title: user?.full_name || 'Global Admin', color: 'text-emerald-400', badge: 'Admin Master' },
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-[#0A0E1A]/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/80 justify-between">
          <Logo size="sm" showTagline to={`/${currentRole}/dashboard`} />
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                {group.group}
              </div>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent text-cyan-300 border-l-2 border-cyan-400 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md font-mono ${
                          item.badge === 'AI' || item.badge === '5-Yr' || item.badge === 'NLP'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : item.badge === 'Hot' || item.badge === 'Live' || item.badge === 'Gap'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card Bottom */}
        <div className="p-3 border-t border-slate-800/80 bg-[#080C15]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md font-mono">
              {roleLabels[currentRole].title.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {roleLabels[currentRole].title}
              </div>
              <div className={`text-[10px] ${roleLabels[currentRole].color} font-mono truncate`}>
                {roleLabels[currentRole].badge}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
