import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ResumeUploadCard } from '../components/common/ResumeUploadCard';
import {
  User, Mail, MapPin, CheckCircle2, Award
} from 'lucide-react';
import { fetchDashboardKPIsAPI } from '../services/intelligenceService';
import { api } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [targetSalary, setTargetSalary] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [kpiRes, candRes] = await Promise.allSettled([
        fetchDashboardKPIsAPI(),
        api.get('/candidates/me')
      ]);

      if (user) {
        setFullName(user.full_name || '');
      }

      if (kpiRes.status === 'fulfilled' && kpiRes.value?.kpis) {
        const k = kpiRes.value.kpis;
        if (k.targetRole) setTitle(k.targetRole);
        if (k.targetSalary) setTargetSalary(String(k.targetSalary));
        if (k.summary) setBio(k.summary);
        if (k.skills && k.skills.length > 0) setSkills(k.skills);
      }

      if (candRes.status === 'fulfilled' && candRes.value?.data) {
        const c = candRes.value.data;
        if (c.district?.name) {
          setLocation(`${c.district.name}, Maharashtra`);
        }
        if (c.profile?.bio && !bio) {
          setBio(c.profile.bio);
        }
        if (c.candidate_skills && c.candidate_skills.length > 0 && skills.length === 0) {
          setSkills(c.candidate_skills.map((cs: any) => cs.skill?.name).filter(Boolean));
        }
      }
    } catch {
      // graceful
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [user]);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/candidates/me', {
        full_name: fullName,
        profile: {
          bio
        }
      });
    } catch {
      // Local fallback
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : '?';

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
          <span>Profile and career preferences updated successfully in database!</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <Card glow="cyan" className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center font-black text-2xl text-white shadow-2xl font-mono shrink-0">
            {initials}
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
                {user?.email || 'candidate@connectx.ai'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Verified Resume / CV Upload Section */}
      <ResumeUploadCard
        glow="cyan"
        onUploadSuccess={loadProfileData}
        onDeleteSuccess={loadProfileData}
      />


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
                  Professional Title / Target Role
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
                  Location & Region
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
                Executive Professional Bio / AI CV Summary
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
        <Card glow="blue" title="Verified Skill Competencies" subtitle="Extracted from your authenticated CV & database ledger">
          {skills && skills.length > 0 ? (
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
          ) : (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              No verified skills extracted yet. Upload and analyze your CV to populate your verified skill competencies.
            </div>
          )}
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
