import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Briefcase, User, Sparkles, Building2, BookOpen, ArrowRight } from 'lucide-react';
import {
  getGlobalJobsData,
  getRecruiterCandidatesData,
  getFutureSkillsData,
  GlobalJob,
  RecruiterCandidate,
  FutureSkill,
} from '../../services/intelligenceService';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'jobs' | 'candidates' | 'skills' | 'companies'>('all');
  const navigate = useNavigate();

  const allJobs: GlobalJob[] = getGlobalJobsData();
  const allCandidates: RecruiterCandidate[] = getRecruiterCandidatesData();
  const allSkills: FutureSkill[] = getFutureSkillsData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredJobs = allJobs.filter(
    (j: GlobalJob) =>
      j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.company.toLowerCase().includes(query.toLowerCase()) ||
      j.requiredSkills.some((s: string) => s.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredCandidates = allCandidates.filter(
    (c: RecruiterCandidate) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.skills.some((s: string) => s.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredSkills = allSkills.filter(
    (s: FutureSkill) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0D1322] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#0A0E1A]">
          <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search global jobs, skills, candidates, companies, courses... (Type keywords)"
            className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-base"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700 hover:bg-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border-b border-slate-800 text-xs overflow-x-auto">
          <span className="text-slate-500 shrink-0">Filter:</span>
          {(['all', 'jobs', 'candidates', 'skills', 'companies'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-2.5 py-1 rounded-full capitalize font-medium transition-colors ${
                category === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {/* Jobs Section */}
          {(category === 'all' || category === 'jobs' || category === 'companies') && filteredJobs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Global Opportunities ({filteredJobs.length})</span>
              </div>
              <div className="space-y-2">
                {filteredJobs.slice(0, 4).map((job: GlobalJob) => (
                  <div
                    key={job.id}
                    onClick={() => {
                      navigate('/dashboard/jobs');
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center font-bold text-xs text-cyan-300">
                        {job.companyLogoText}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {job.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          {job.company} • {job.city}, {job.country} • {job.workplaceType}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                        {job.matchScore}% Match
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {(category === 'all' || category === 'skills') && filteredSkills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>High-Demand Skills & Forecasts ({filteredSkills.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredSkills.slice(0, 4).map((skill: FutureSkill) => (
                  <div
                    key={skill.id}
                    onClick={() => {
                      navigate('/dashboard/future-skills');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-purple-500/40 cursor-pointer transition-all group"
                  >
                    <div className="text-xs font-semibold text-white group-hover:text-purple-300">
                      {skill.name}
                    </div>
                    <div className="text-[11px] text-purple-400 font-mono mt-0.5">
                      {skill.demandGrowth} • {skill.globalSalaryPremium}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Candidates Section */}
          {(category === 'all' || category === 'candidates') && filteredCandidates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5" />
                <span>Verified Global Talent ({filteredCandidates.length})</span>
              </div>
              <div className="space-y-2">
                {filteredCandidates.slice(0, 3).map((cand: RecruiterCandidate) => (
                  <div
                    key={cand.id}
                    onClick={() => {
                      navigate('/dashboard/candidates');
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-300">
                        {cand.avatarText}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-emerald-300">
                          {cand.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {cand.title} • {cand.location}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold">
                      {cand.matchScore}% Fit
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredJobs.length === 0 && filteredSkills.length === 0 && filteredCandidates.length === 0 && (
            <div className="py-12 text-center">
              <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-300 font-medium">No direct intelligence matches for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for Python, AI, Cloud, Google, or Kubernetes.</p>
            </div>
          )}
        </div>

        {/* Footer Quick Tips */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Enter</kbd> to select</span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" /> CONNECTX AI Global Search Engine
          </span>
        </div>
      </div>
    </div>
  );
};
