import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck, UserCheck, Building2, Briefcase, GraduationCap, ShieldAlert } from 'lucide-react';
import { RoleType } from '../types/user';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const demoAccounts = [
    {
      role: 'CANDIDATE' as RoleType,
      label: 'Candidate / Talent',
      name: 'Alex Rivera',
      title: 'Senior AI Systems Engineer',
      email: 'alex.rivera@connectx.ai',
      pass: 'Candidate@12345',
      icon: UserCheck,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:border-cyan-400',
    },
    {
      role: 'EMPLOYER' as RoleType,
      label: 'Company / Employer',
      name: 'Google Cloud Talent Hub',
      title: 'Global AI Hiring Lead',
      email: 'recruitment@google.com',
      pass: 'Employer@12345',
      icon: Building2,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10 hover:border-purple-400',
    },
    {
      role: 'EMPLOYER' as RoleType,
      label: 'Recruiter Partner',
      name: 'Sarah Chen',
      title: 'Technical Executive Recruiter',
      email: 'sarah.recruiter@connectx.ai',
      pass: 'Partner@12345',
      icon: Briefcase,
      color: 'text-blue-400 border-blue-500/30 bg-blue-500/10 hover:border-blue-400',
    },
    {
      role: 'TRAINING_PROVIDER' as RoleType,
      label: 'Training Academy',
      name: 'Prof. Sofia Lin',
      title: 'MIT Tech Institute Director',
      email: 'director@mit-academy.edu',
      pass: 'Partner@12345',
      icon: GraduationCap,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:border-amber-400',
    },
    {
      role: 'SUPER_ADMIN' as RoleType,
      label: 'Platform Admin',
      name: 'Dr. Marcus Vance',
      title: 'Global Ecosystem Overseer',
      email: 'admin@connectx.ai',
      pass: 'Admin@12345',
      icon: ShieldAlert,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-400',
    },
  ];

  const handleRoleRouting = (role: RoleType, userEmail: string) => {
    switch (role) {
      case 'CANDIDATE':
        navigate('/candidate/dashboard');
        break;
      case 'EMPLOYER':
        if (userEmail.includes('recruiter')) {
          navigate('/recruiter/dashboard');
        } else {
          navigate('/company/dashboard');
        }
        break;
      case 'TRAINING_PROVIDER':
        navigate('/provider/dashboard');
        break;
      case 'SUPER_ADMIN':
      case 'STATE_ADMIN':
      case 'DISTRICT_OFFICER':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/candidate/dashboard');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const authenticatedUser = await login({ email, password });
      handleRoleRouting(authenticatedUser.role, authenticatedUser.email);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demo: typeof demoAccounts[0]) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#080C15]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Logo size="lg" showTagline to="/" className="justify-center" />
          <h2 className="text-2xl font-bold text-white pt-2">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to your verified multi-role workspace</p>
        </div>

        {/* Login Card */}
        <Card glow="cyan" className="p-6 sm:p-8 space-y-6 shadow-2xl bg-slate-900/90 border-slate-800">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                Work / Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold font-mono uppercase text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset token simulated: In production, a secure verification link is emailed to the verified account owner.")}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              variant="cyber"
              size="md"
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Sandbox Demo Personas */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Sandbox Demo Personas (One-Click Fill)
              </span>
              <span className="text-[9px] font-mono text-slate-500">Dev Only</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {demoAccounts.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleFillDemo(demo)}
                    className="w-full text-left p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/30 text-xs transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg border ${demo.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 group-hover:text-white text-xs block">
                          {demo.label}
                        </span>
                        <span className="text-[10px] text-slate-400">{demo.name} · {demo.email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Autofill &rarr;
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* New Account Onboarding Options */}
        <div className="text-center space-y-3">
          <p className="text-xs text-slate-400">New to CONNECTX?</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/register?type=candidate">
              <Button size="sm" variant="outline" className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10">
                Join as Candidate
              </Button>
            </Link>
            <Link to="/register?type=company">
              <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                Register Company
              </Button>
            </Link>
            <Link to="/register?type=provider">
              <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
                Register Academy
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
