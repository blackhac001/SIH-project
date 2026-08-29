import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Users, Search, Filter, ShieldCheck, CheckCircle2,
  Mail, Calendar, MapPin, X, ArrowRight, Sparkles, DollarSign
} from 'lucide-react';
import { getRecruiterCandidatesData, RecruiterCandidate } from '../services/intelligenceService';

export const CandidateSearchPage: React.FC = () => {
  const [candidates, setCandidates] = useState<RecruiterCandidate[]>(getRecruiterCandidatesData());
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState<RecruiterCandidate | null>(null);
  const [invitedIds, setInvitedIds] = useState<Record<string, boolean>>({});

  const filteredCandidates = candidates.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.location.toLowerCase().includes(query.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const handleInvite = (id: string | number) => {
    setInvitedIds((prev) => ({ ...prev, [String(id)]: true }));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <Users className="w-3.5 h-3.5" />
          <span>Global Verified Talent Sourcing Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Candidate Discovery & Matching
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Source, screen, and interview pre-vetted international engineers with AI skill compatibility scoring and verified credentials.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by candidate name, skill (e.g. PyTorch, Kubernetes), title, or country..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {['ALL', 'SHORTLISTED', 'INTERVIEWING', 'NEW'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  statusFilter === status
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCandidates.map((cand) => (
          <Card
            key={cand.id}
            glow={cand.matchScore >= 94 ? 'cyan' : 'purple'}
            className="p-6 transition-all hover:scale-[1.01]"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-black text-sm text-white shadow-md font-mono">
                    {cand.avatarText}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className="text-base font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
                        onClick={() => setSelectedCandidate(cand)}
                      >
                        {cand.name}
                      </h3>
                      {cand.verifiedCredentials && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{cand.title}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {cand.location}, {cand.country} • {cand.experienceYears} Years Exp
                    </p>
                  </div>
                </div>

                <Badge variant="cyan" size="sm" dot>
                  {cand.matchScore}% Match
                </Badge>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cand.skills.map((sk) => (
                  <span
                    key={sk}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                  >
                    {sk}
                  </span>
                ))}
              </div>

              {/* Footer Details & Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">{cand.salaryExpectation}</div>
                  <div className="text-[10px] text-slate-500">{cand.availability}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedCandidate(cand)}
                  >
                    Profile
                  </Button>
                  <Button
                    variant={invitedIds[cand.id] ? 'secondary' : 'cyber'}
                    size="sm"
                    onClick={() => handleInvite(cand.id)}
                    disabled={invitedIds[cand.id]}
                  >
                    {invitedIds[cand.id] ? 'Invited ✓' : 'Invite'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Candidate Profile Drawer / Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#0D1322] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-black text-lg text-white font-mono shadow-lg">
                {selectedCandidate.avatarText}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{selectedCandidate.name}</h3>
                  <Badge variant="cyan" size="sm">{selectedCandidate.matchScore}% Fit</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedCandidate.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedCandidate.location}, {selectedCandidate.country}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <div className="text-slate-400 font-mono text-[10px]">EXPERIENCE</div>
                <div className="font-bold text-white text-sm mt-0.5">{selectedCandidate.experienceYears} Years</div>
              </div>
              <div className="border-x border-slate-800">
                <div className="text-slate-400 font-mono text-[10px]">TARGET SALARY</div>
                <div className="font-bold text-emerald-400 text-sm mt-0.5">{selectedCandidate.salaryExpectation}</div>
              </div>
              <div>
                <div className="text-slate-400 font-mono text-[10px]">AVAILABILITY</div>
                <div className="font-bold text-cyan-300 text-sm mt-0.5">{selectedCandidate.availability}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-2">Verified Skill Competencies</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.skills.map((sk) => (
                  <span key={sk} className="text-xs px-3 py-1 rounded-xl bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedCandidate(null)}
              >
                Close
              </Button>
              <Button
                variant={invitedIds[selectedCandidate.id] ? 'secondary' : 'cyber'}
                size="md"
                onClick={() => handleInvite(selectedCandidate.id)}
                disabled={invitedIds[selectedCandidate.id]}
              >
                {invitedIds[selectedCandidate.id] ? 'Interview Scheduled ✓' : 'Dispatch Interview Invite'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
