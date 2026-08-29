import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, UserRole } from '../components/layout/Sidebar';
import { TopNavbar } from '../components/layout/TopNavbar';
import { UniversalSearchModal } from '../components/common/UniversalSearchModal';
import { Bot } from 'lucide-react';

export const RoleDashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detect current role from URL path
  const detectRoleFromPath = (): UserRole => {
    const path = location.pathname;
    if (path.startsWith('/candidate')) return 'candidate';
    if (path.startsWith('/company')) return 'company';
    if (path.startsWith('/recruiter')) return 'recruiter';
    if (path.startsWith('/provider')) return 'provider';
    if (path.startsWith('/admin')) return 'admin';
    return 'candidate';
  };

  const [currentRole, setCurrentRole] = useState<UserRole>(detectRoleFromPath());

  useEffect(() => {
    setCurrentRole(detectRoleFromPath());
  }, [location.pathname]);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    navigate(`/${newRole}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-[#080C15] flex text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Universal Search Modal (Ctrl+K) */}
      <UniversalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Role-Specific Sidebar */}
      <Sidebar
        currentRole={currentRole}
        onChangeRole={handleRoleChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Role-Aware Top Navbar */}
        <TopNavbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          currentRole={currentRole}
          onChangeRole={handleRoleChange}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          <Outlet context={{ currentRole, setCurrentRole: handleRoleChange }} />
        </main>
      </div>

      {/* Floating AI Copilot Trigger (Available across workspaces) */}
      <button
        onClick={() => navigate('/candidate/copilot')}
        className="fixed bottom-6 right-6 z-30 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-xl shadow-cyan-500/25 border border-cyan-400/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
      >
        <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="hidden md:inline text-xs font-bold tracking-wide font-mono">
          AI Copilot
        </span>
        <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping"></span>
      </button>
    </div>
  );
};
