import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  FileText, UploadCloud, CheckCircle2, AlertTriangle, Sparkles,
  ArrowRight, Briefcase, Zap, ShieldCheck, Download, RefreshCw
} from 'lucide-react';
import { analyzeResumeAPI, getResumeAnalysisMock, ResumeParsedResult } from '../services/intelligenceService';

export const ResumeIntelligencePage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeFileName, setActiveFileName] = useState('Alex_Rivera_Senior_AI_Engineer_2026.pdf');
  const [resumeText, setResumeText] = useState(
    "Alex Rivera - Senior AI Systems & Cloud Platform Engineer. 5+ years experience building distributed backend systems, Python, FastAPI, PyTorch, Docker, PostgreSQL, Kubernetes, and vector search microservices. Delivered high throughput inference engines with 10k QPS and 99.99% uptime."
  );
  const [result, setResult] = useState<ResumeParsedResult>(getResumeAnalysisMock());
  const [selectedJobIdx, setSelectedJobIdx] = useState(0);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const data = await analyzeResumeAPI(resumeText, "Senior AI & Cloud Platform Engineer");
      setResult(data);
    } catch {
      setResult(getResumeAnalysisMock());
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    handleRunAnalysis();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Neural Resume Parsing & ATS Optimization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Resume / CV Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Extract capabilities, evaluate ATS readiness, detect missing keywords, and benchmark directly against global job postings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="cyber"
            size="sm"
            onClick={handleRunAnalysis}
            isLoading={isAnalyzing}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Re-Analyze Profile
          </Button>
        </div>
      </div>

      {/* Upload Dropzone & Quick Document Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div
            onClick={handleRunAnalysis}
            className="p-8 rounded-3xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-slate-900/60 hover:bg-slate-900/90 cursor-pointer transition-all flex flex-col items-center justify-center text-center group shadow-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Upload Resume, CV or Accredited Certificates
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              Drag and drop PDF, DOCX, or TXT format. Our neural engine parses skills, experience, verified credentials, and ATS keyword densities.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-300 font-mono border border-slate-700">
                📄 {activeFileName}
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Parsed & Indexed
              </span>
            </div>
          </div>
        </div>

        {/* ATS Readiness Score Dial Card */}
        <div className="lg:col-span-4">
          <Card glow="purple" className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-purple-400 mb-3">
                <span>ATS COMPLIANCE SCORE</span>
                <ShieldCheck className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* Circular Glow Indicator */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-cyan-400 transition-all duration-1000 ease-out"
                      strokeDasharray={`${result.atsScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-black text-white font-mono">{result.atsScore}</span>
                    <span className="block text-[10px] text-cyan-400 font-semibold uppercase">Tier-1 Rating</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-center text-slate-300">
                Top 8% of applicants in Senior AI Systems domain.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Target Role Fit</span>
              <span className="font-semibold text-white">{result.targetRole}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Extracted Skills Taxonomy & Missing Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Extracted Skills List (7 Cols) */}
        <div className="lg:col-span-7">
          <Card
            glow="cyan"
            title="Extracted Skill Capabilities"
            subtitle="Verified technical competencies categorized by domain"
            icon={<Sparkles className="w-4 h-4" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.extractedSkills.map((sk) => (
                  <div
                    key={sk.name}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-white">{sk.name}</span>
                      <span className="text-cyan-400 font-mono">{sk.proficiency}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full"
                        style={{ width: `${sk.proficiency}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">{sk.category}</div>
                  </div>
                ))}
              </div>

              {/* Strengths List */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Demonstrated Core Strengths</span>
                </div>
                <div className="space-y-1.5">
                  {result.strengths.map((str, i) => (
                    <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Missing Keywords & Actionable Recommendations (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            glow="purple"
            title="Missing High-Value Keywords"
            subtitle="Keywords searched by recruiters for Senior AI roles"
            icon={<AlertTriangle className="w-4 h-4 text-purple-400" />}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs px-3 py-1.5 rounded-xl bg-purple-950/40 text-purple-200 border border-purple-500/40 font-mono"
                  >
                    + {kw}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Resume Recommendations</span>
                </div>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Direct Job Comparison Module */}
      <Card
        glow="blue"
        title="Direct Job ↔ Resume Match Comparison"
        subtitle="Live comparison of your parsed resume against active global job descriptions"
        icon={<Briefcase className="w-4 h-4" />}
      >
        <div className="space-y-6">
          {/* Target Job Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-slate-800">
            {result.jobMatchComparisons.map((comp, idx) => (
              <button
                key={comp.jobTitle}
                onClick={() => setSelectedJobIdx(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedJobIdx === idx
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{comp.company} — {comp.jobTitle}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                  {comp.matchScore}%
                </span>
              </button>
            ))}
          </div>

          {/* Active Comparison Card */}
          {result.jobMatchComparisons[selectedJobIdx] && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              {/* Strong Matches */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Strong Matching Qualifications</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.jobMatchComparisons[selectedJobIdx].matchedSkills.map((sk) => (
                    <span
                      key={sk}
                      className="text-xs px-3 py-1 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 font-mono flex items-center gap-1"
                    >
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Missing Requirements for this Role</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.jobMatchComparisons[selectedJobIdx].missingSkills.map((sk) => (
                    <span
                      key={sk}
                      className="text-xs px-3 py-1 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-500/40 font-mono flex items-center gap-1"
                    >
                      ✗ {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
