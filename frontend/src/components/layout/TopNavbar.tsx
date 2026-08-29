import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from './Sidebar';
import {
  Menu, Search, Bell, Sparkles, Globe2,
  ChevronDown, LogOut, User, CheckCircle2, ArrowRight,
  Building2, Users, GraduationCap, ShieldAlert, ShieldCheck
} from 'lucide-react';

interface TopNavbarProps {
  onOpenSidebar: () => void;
  onOpenSearch: () => void;
  currentRole: UserRole;
  onChangeRole?: (role: UserRole) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenSidebar,
  onOpenSearch,
  currentRole,
}) => {
  const { user, logout } = useAuth();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const roleConfigs: Record<UserRole, { label: string; badge: string; color: string; ticker: string }> = {
    candidate: {
      label: user?.full_name || 'Candidate Workspace',
      badge: 'Talent Console',
      color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
      ticker: '24 AI Matching Opportunities',
    },
    company: {
      label: user?.organization_name || user?.full_name || 'Enterprise Portal',
      badge: 'Employer Console',
      color: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
      ticker: 'Active Requisitions & Verified Pipeline',
    },
    recruiter: {
      label: user?.full_name || 'Recruiter Hub',
      badge: 'Talent Recruiter',
      color: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
      ticker: 'Executive Matching Pipeline',
    },
    provider: {
      label: user?.organization_name || user?.full_name || 'Academy Portal',
      badge: 'Training Provider',
      color: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      ticker: 'Cohort Progress & Placement Outcomes',
    },
    admin: {
      label: user?.full_name || 'Platform Overseer',
      badge: 'Ecosystem Admin',
      color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      ticker: 'Global Intelligence & Governance',
    },
  };

  const currentCfg = roleConfigs[currentRole] || roleConfigs.candidate;

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#080C15]/95 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & Universal Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Bar Button (Ctrl+K trigger) */}
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 transition-all text-xs group shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Search jobs, skills, candidates, companies...</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded text-slate-300">
            <span>⌘K</span> / <span>Ctrl+K</span>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Role Perspective Pill */}
        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${currentCfg.color}`}>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-mono">{currentCfg.badge}:</span>
          <span className="font-normal text-white">{currentCfg.ticker}</span>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          </button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdown(!profileDropdown)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white font-mono">
              {(user?.full_name || currentCfg.label).substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                {user?.full_name || currentCfg.label}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">
                {currentCfg.badge}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0D1322] border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in duration-150">
              <div className="p-2 border-b border-slate-800 text-xs">
                <p className="font-semibold text-white">{user?.full_name || currentCfg.label}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || currentCfg.badge}</p>
                <div className="mt-1">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Role: {user?.role || currentRole.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdown(false);
                    navigate(`/${currentRole}/profile`);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Profile & Preferences</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setProfileDropdown(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
