import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Users, Search, Sparkles, Filter, CheckCircle2,
  Calendar, Mail, ArrowRight, ShieldCheck, Clock,
  Target, BarChart3, ChevronRight, UserPlus
} from 'lucide-react';
import { getRecruiterCandidatesData, RecruiterCandidate } from '../services/intelligenceService';

export const RecruiterDashboard: React.FC = () => {
  const [candidates] = useState<RecruiterCandidate[]>(getRecruiterCandidatesData());
  const [nlQuery, setNlQuery] = useState('Find senior Python developers with AWS experience available for remote work');
  const [isSearching, setIsSearching] = useState(false);
  const [shortlistedMap, setShortlistedMap] = useState<Record<string, boolean>>({ 'cand-01': true, 'cand-02': true });
  const [interviewMap, setInterviewMap] = useState<Record<string, boolean>>({});

  const handleNlSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 500);
  };

  const toggleShortlist = (id: string | number) => {
    setShortlistedMap((prev) => ({ ...prev, [String(id)]: !prev[String(id)] }));
  };

  const scheduleInterview = (id: string | number) => {
    setInterviewMap((prev) => ({ ...prev, [String(id)]: true }));
  };

  const examplePrompts = [
    "Find senior Python developers with AWS experience available for remote work",
    "Robotics C++ engineers in Germany with ROS2 and computer vision",
    "Staff Kubernetes architects with immediate availability",
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-[#0E172A] to-[#1E293B] border border-blue-500/30 overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Recruiter Velocity & Talent Sourcing Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recruiter Sourcing Console — Sarah Chen
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            "How do I fill positions faster?" Source pre-vetted engineers using natural language AI search, manage shortlists, and dispatch instant interview invites.
          </p>
        </div>
      </div>

      {/* Recruiter Velocity KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card glow="blue" className="p-4">
          <div className="text-[10px] font-mono text-blue-400 uppercase">ACTIVE TALENT POOL</div>
          <div className="text-2xl font-black text-white mt-1">1,240</div>
          <div className="text-[10px] text-slate-400 mt-1">Vetted Engineers</div>
        </Card>

        <Card glow="cyan" className="p-4">
          <div className="text-[10px] font-mono text-cyan-400 uppercase">SHORTLISTED</div>
          <div className="text-2xl font-black text-cyan-300 mt-1">18</div>
          <div className="text-[10px] text-cyan-400 mt-1">Ready for interview</div>
        </Card>

        <Card glow="purple" className="p-4">
          <div className="text-[10px] font-mono text-purple-400 uppercase">AVG RESPONSE TIME</div>
          <div className="text-2xl font-black text-purple-300 mt-1">4.2 <span className="text-xs text-slate-400 font-normal">Hours</span></div>
          <div className="text-[10px] text-emerald-400 mt-1">High responsiveness</div>
        </Card>

        <Card glow="emerald" className="p-4">
          <div className="text-[10px] font-mono text-emerald-400 uppercase">OFFER VELOCITY</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">82.4%</div>
          <div className="text-[10px] text-emerald-300 mt-1">Acceptance rate</div>
        </Card>
      </div>

      {/* Natural Language AI Candidate Search Box */}
      <Card glow="blue" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Natural-Language AI Candidate Search
            </h3>
          </div>
          <Badge variant="cyan" size="sm">Semantic Match Engine</Badge>
        </div>

        <form onSubmit={handleNlSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Find senior Python developers with AWS experience available for remote work..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
            />
          </div>
          <Button variant="cyber" size="md" type="submit" isLoading={isSearching} className="w-full sm:w-auto">
            Execute AI Search
          </Button>
        </form>

        {/* Quick Example Prompt Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-mono text-slate-500">Quick queries:</span>
          {examplePrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setNlQuery(prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-300 text-[11px] transition-colors truncate max-w-xs"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </Card>

      {/* Ranked Candidate Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>AI Ranked Matches for Query ({candidates.length} Profiles)</span>
          <span className="text-cyan-400">Match Confidence: 94%+</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map((cand) => (
            <Card
              key={cand.id}
              glow={cand.matchScore >= 93 ? 'cyan' : 'blue'}
              className="p-5 flex flex-col justify-between space-y-4 bg-slate-900/80 border-slate-800"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white font-mono">
                      {cand.avatarText}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                        {cand.verifiedCredentials && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-xs text-slate-400">{cand.location}</div>
                    </div>
                  </div>
                  <Badge variant="cyan" size="sm" dot>{cand.matchScore}%</Badge>
                </div>

                <p className="text-xs text-cyan-300 font-medium">{cand.title}</p>

                {/* Match Explanation */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <span className="text-slate-500 font-mono text-[10px] block">AI Match Rationale:</span>
                  <span>Strong proficiency in Python (94%), Docker (90%), and high throughput REST microservices.</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {cand.skills.slice(0, 4).map((sk) => (
                    <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <Button
                  variant={shortlistedMap[cand.id] ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => toggleShortlist(cand.id)}
                  className="text-xs"
                >
                  {shortlistedMap[cand.id] ? 'Shortlisted ✓' : 'Shortlist'}
                </Button>

                <Button
                  variant={interviewMap[cand.id] ? 'secondary' : 'cyber'}
                  size="sm"
                  onClick={() => scheduleInterview(cand.id)}
                  disabled={interviewMap[cand.id]}
                  className="text-xs"
                >
                  {interviewMap[cand.id] ? 'Interviewed ✓' : 'Schedule Interview'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
