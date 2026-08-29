import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  User, ShieldCheck, Mail, MapPin, DollarSign,
  Award, Sparkles, CheckCircle2, Globe2, Briefcase, Plus, X
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [title, setTitle] = useState('Senior AI & Cloud Platform Engineer');
  const [location, setLocation] = useState('San Francisco, CA (Open to Global Remote)');
  const [targetSalary, setTargetSalary] = useState('145000');
  const [bio, setBio] = useState(
    'Specialist in high-throughput asynchronous Python microservices, distributed model inference serving with PyTorch/vLLM, and containerized cloud platforms.'
  );
  const [saved, setSaved] = useState(false);

  const skills = [
    'Python', 'PyTorch', 'FastAPI', 'Docker', 'PostgreSQL',
    'Distributed Systems', 'AWS', 'CI/CD', 'Vector DBs'
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <User className="w-3.5 h-3.5" />
          <span>Verified Professional Capability Ledger</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Profile & Credentials
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your verified credentials, professional title, location preferences, and target compensation benchmarks.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile and neural matchmaking preferences updated successfully!</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <Card glow="cyan" className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center font-black text-2xl text-white shadow-2xl font-mono shrink-0">
            {fullName ? fullName.substring(0, 2).toUpperCase() : 'AR'}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-extrabold text-white">{fullName}</h2>
              <Badge variant="emerald" size="sm" dot>Verified Zero-Trust Identity</Badge>
            </div>
            <p className="text-sm text-cyan-300 font-semibold">{title}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {location}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {user?.email || 'alex.rivera@connectx.ai'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Form Controls */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card glow="purple" title="Career Details & Compensation Target">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                  Professional Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                  Location & Workplace Preference
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                  Target Annual Compensation (USD $)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                  value={targetSalary}
                  onChange={(e) => setTargetSalary(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                Executive Professional Bio
              </label>
              <textarea
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500 focus:outline-none leading-relaxed"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Skills Tag Section */}
        <Card glow="blue" title="Verified Skill Competencies" subtitle="Validated by assessments and code reviews">
          <div className="flex flex-wrap gap-2">
            {skills.map((sk) => (
              <span
                key={sk}
                className="text-xs px-3 py-1.5 rounded-xl bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 font-mono"
              >
                ✓ {sk}
              </span>
            ))}
          </div>
        </Card>

        <div className="flex items-center justify-end">
          <Button variant="cyber" size="lg" type="submit">
            Save & Update AI Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
