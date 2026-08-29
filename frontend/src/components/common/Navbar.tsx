import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from './Logo';
import { Button } from './Button';
import {
  Menu, X, Sparkles, Briefcase, Globe2, Brain,
  TrendingUp, Compass, ArrowRight, User
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Intelligence Suite', href: '/#features', icon: Brain },
    { label: 'Global Jobs', href: '/#jobs', icon: Briefcase },
    { label: 'Salary Predictor', href: '/#earnings', icon: TrendingUp },
    { label: 'Skill Forecasts', href: '/#skills', icon: Compass },
    { label: 'Global Map', href: '/#map', icon: Globe2 },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#080C15]/90 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Logo size="md" showTagline />

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  <item.icon className="w-4 h-4 text-cyan-500/70" />
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="cyber"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Enter Workspace
                </Button>
                <button
                  onClick={logout}
                  className="text-xs px-3 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="cyber" size="sm" rightIcon={<Sparkles className="w-4 h-4" />}>
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 border-b border-slate-800 bg-[#0A0E1A] space-y-3">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-400"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            {isAuthenticated ? (
              <Button
                variant="cyber"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
              >
                Open Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="cyber" className="w-full">
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
