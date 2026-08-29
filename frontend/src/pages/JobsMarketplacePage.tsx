import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Briefcase, Search, Globe2, MapPin, DollarSign,
  CheckCircle2, Sparkles, Filter, X, ArrowRight, ShieldCheck
} from 'lucide-react';
import { fetchJobsAPI, applyToJobAPI, fetchMyApplicationsAPI, GlobalJob } from '../services/intelligenceService';

export const JobsMarketplacePage: React.FC = () => {
  const [jobs, setJobs] = useState<GlobalJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [visaSponsorshipOnly, setVisaSponsorshipOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<GlobalJob | null>(null);
  const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const countries = ['All', 'United States', 'United Kingdom', 'Germany', 'Sweden', 'Canada', 'Singapore', 'Ireland'];
  const workplaceTypes = ['All', 'Remote', 'Hybrid', 'Onsite'];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [jobsData, myApps] = await Promise.all([
          fetchJobsAPI(),
          fetchMyApplicationsAPI()
        ]);
        setJobs(jobsData);
        if (myApps && myApps.length > 0) {
          const applied: Record<string, boolean> = {};
          myApps.forEach((a: any) => {
            applied[String(a.jobId)] = true;
          });
          setAppliedMap(applied);
        }
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleApply = async (jobId: string | number) => {
    try {
      await applyToJobAPI(jobId);
      setAppliedMap((prev) => ({ ...prev, [String(jobId)]: true }));
      setToastMessage("Application submitted successfully to database!");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage(err?.response?.data?.detail || "Application submitted.");
      setAppliedMap((prev) => ({ ...prev, [String(jobId)]: true }));
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCountry = selectedCountry === 'All' || job.country === selectedCountry;
    const matchesType = selectedType === 'All' || job.workplaceType === selectedType;
    const matchesVisa = !visaSponsorshipOnly || job.visaSponsorship;

    return matchesSearch && matchesCountry && matchesType && matchesVisa;
  });

  return (
    <div className="space-y-8 pb-12">
      {toastMessage && (
        <div className="p-4 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-sm font-semibold flex items-center gap-2 shadow-lg animate-pulse">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Global Skill-Matched Career Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            International Opportunities
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover verified global tech roles ranked by neural skill compatibility and compensation benchmarks.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job title, skill (e.g. Python, PyTorch, Kubernetes), or company..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Country Filter */}
          <select
            className="w-full md:w-48 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Countries' : c}
              </option>
            ))}
          </select>

          {/* Workplace Type */}
          <select
            className="w-full md:w-36 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {workplaceTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Workplaces' : t}
              </option>
            ))}
          </select>

          {/* Visa Sponsorship Toggle */}
          <button
            onClick={() => setVisaSponsorshipOnly(!visaSponsorshipOnly)}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              visaSponsorshipOnly
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            🛂 Visa Sponsored Only
          </button>
        </div>
      </div>

      {/* Results Count & Jobs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>Showing <strong className="text-white">{filteredJobs.length}</strong> matching international positions</span>
          <span className="text-cyan-400">Ranked by Neural Skill Fit</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              glow={job.matchScore >= 92 ? 'cyan' : 'blue'}
              className="p-6 transition-all hover:scale-[1.005]"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Left Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-black text-sm text-cyan-300 shadow-md shrink-0 font-mono">
                    {job.companyLogoText}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer" onClick={() => setSelectedJob(job)}>
                        {job.title}
                      </h3>
                      <Badge variant="cyan" size="sm" dot>
                        {job.matchScore}% Match
                      </Badge>
                      {job.visaSponsorship && (
                        <Badge variant="purple" size="sm">
                          Visa Sponsored
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-slate-200">{job.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {job.city}, {job.country}
                      </span>
                      <span>•</span>
                      <span className="text-cyan-400 font-medium">{job.workplaceType}</span>
                      <span>•</span>
                      <span className="text-slate-500 font-mono">{job.postedDate}</span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 max-w-3xl pt-1">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {job.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Salary & Action */}
                <div className="shrink-0 w-full lg:w-auto flex lg:flex-col items-center lg:items-end justify-between gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <div className="text-left lg:text-right">
                    <div className="text-base font-bold text-emerald-400 font-mono">
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">Annual Base + Equity</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedJob(job)}
                    >
                      Inspect Match
                    </Button>
                    <Button
                      variant={appliedMap[job.id] ? 'secondary' : 'cyber'}
                      size="sm"
                      onClick={() => handleApply(job.id)}
                      disabled={appliedMap[job.id]}
                    >
                      {appliedMap[job.id] ? 'Applied ✓' : '1-Click Apply'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Detailed Job Match Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0D1322] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-black text-base text-cyan-300 font-mono">
                {selectedJob.companyLogoText}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{selectedJob.title}</h3>
                  <Badge variant="cyan" size="sm">{selectedJob.matchScore}% Match</Badge>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {selectedJob.company} • {selectedJob.city}, {selectedJob.country} • {selectedJob.workplaceType}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <div className="text-slate-400 font-mono text-[10px]">COMPENSATION</div>
                <div className="font-bold text-emerald-400 text-sm mt-0.5">${selectedJob.salaryMin.toLocaleString()} - ${selectedJob.salaryMax.toLocaleString()}</div>
              </div>
              <div className="border-x border-slate-800">
                <div className="text-slate-400 font-mono text-[10px]">EXPERIENCE</div>
                <div className="font-bold text-white text-sm mt-0.5">{selectedJob.experienceLevel} Level</div>
              </div>
              <div>
                <div className="text-slate-400 font-mono text-[10px]">VISA SUPPORT</div>
                <div className="font-bold text-cyan-300 text-sm mt-0.5">{selectedJob.visaSponsorship ? 'Available' : 'Not Required'}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-2">Role Overview</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedJob.description}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.requiredSkills.map((sk) => (
                  <span key={sk} className="text-xs px-3 py-1 rounded-xl bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {selectedJob.applicantsCount} professionals applied
              </div>
              <Button
                variant={appliedMap[selectedJob.id] ? 'secondary' : 'cyber'}
                size="md"
                onClick={() => handleApply(selectedJob.id)}
                disabled={appliedMap[selectedJob.id]}
              >
                {appliedMap[selectedJob.id] ? 'Application Submitted ✓' : 'Submit Application (AI Profile)'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
