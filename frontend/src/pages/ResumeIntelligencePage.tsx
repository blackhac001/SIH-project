import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ResumeUploadCard } from '../components/common/ResumeUploadCard';
import {
  FileText, UploadCloud, CheckCircle2, AlertTriangle, Sparkles,
  ArrowRight, Briefcase, Zap, ShieldCheck, Download, RefreshCw,
  GraduationCap, Layers, Award, Terminal
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { ResumeData, ResumeAnalysisResult } from '../types/resume';

export const ResumeIntelligencePage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeResume, setActiveResume] = useState<ResumeData | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [selectedJobIdx, setSelectedJobIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchActiveResumeAndAnalysis = async () => {
    try {
      const status = await resumeService.getStatus();
      if (status.has_resume && status.resume) {
        setActiveResume(status.resume);
        try {
          const analysisStatus = await resumeService.getLatestAnalysis();
          if (analysisStatus.has_analysis && analysisStatus.analysis) {
            setAnalysis(analysisStatus.analysis);
          } else {
            // Newly uploaded or unanalyzed CV -> 0% state
            setAnalysis(null);
          }
        } catch {
          setAnalysis(null);
        }
      } else {
        setActiveResume(null);
        setAnalysis(null);
      }
    } catch (err: any) {
      console.error("Failed to fetch resume status:", err);
      setActiveResume(null);
      setAnalysis(null);
    }
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const data = await resumeService.analyze("Senior AI & Cloud Platform Engineer");
      setAnalysis(data);
    } catch (err: any) {
      console.error("AI Analysis error:", err);
      const detail = err.response?.data?.detail || "Could not complete AI analysis. Please ensure your CV has readable text.";
      setErrorMsg(detail);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchActiveResumeAndAnalysis();
  }, []);

  const atsScore = analysis ? (analysis.resume_score || analysis.ats_score || 0) : 0;
  const targetRole = analysis?.target_role || "General / As Described in CV";
  const strengths = analysis?.strengths || [];
  const weaknesses = analysis?.weaknesses || [];
  const recommendations = analysis?.recommendations || [];
  const missingKeywords = analysis?.missing_keywords || [];
  const missingSections = analysis?.missing_sections || [];
  const techSkills = analysis?.technical_skills?.length ? analysis.technical_skills : analysis?.skills || [];
  const jobComparisons = analysis?.job_match_comparisons || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Neural Resume Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Resume / CV Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Extract capabilities, evaluate ATS readiness, detect missing keywords, and benchmark directly against platform job postings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="cyber"
            size="sm"
            onClick={handleRunAnalysis}
            isLoading={isAnalyzing}
            disabled={!activeResume || isAnalyzing}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {analysis ? "Re-Analyze CV" : "Analyse CV"}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Dropzone & Quick Document Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ResumeUploadCard
            glow="cyan"
            isAnalyzing={isAnalyzing}
            onAnalyzeClick={handleRunAnalysis}
            onUploadSuccess={(uploaded) => {
              setActiveResume(uploaded);
              // Reset analysis state for the newly uploaded CV
              setAnalysis(null);
            }}
            onDeleteSuccess={() => {
              setActiveResume(null);
              setAnalysis(null);
            }}
          />
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
                      strokeDasharray={`${atsScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white font-mono">{atsScore}</span>
                    <span className="text-[10px] text-slate-400 font-mono">OUT OF 100</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 text-center mt-2 leading-relaxed">
                {analysis ? (
                  <>
                    Target Role: <strong className="text-cyan-300">{targetRole}</strong>. Seniority: <strong className="text-purple-300">{analysis.seniority || "Mid-Senior"}</strong>.
                  </>
                ) : (
                  <span className="text-slate-400">Upload your CV and click <strong className="text-cyan-300">Analyse</strong> to calculate your ATS compliance score.</span>
                )}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Status:</span>
              <Badge variant={analysis ? "emerald" : "slate"} size="sm">
                {analysis ? "Analyzed" : "Unanalyzed"}
              </Badge>
            </div>
          </Card>
        </div>
      </div>

      {/* Analysis Results Viewport */}
      {analysis ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Summary */}
          {analysis.summary && (
            <Card glow="cyan" title="Executive Profile Summary" icon={<Sparkles className="w-4 h-4 text-cyan-400" />}>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {analysis.summary}
              </p>
            </Card>
          )}

          {/* Verified Skills */}
          <Card glow="purple" title="Extracted Capability Skills" subtitle="Extracted from your current CV and saved to capability ledger" icon={<Terminal className="w-4 h-4 text-purple-400" />}>
            <div className="flex flex-wrap gap-2">
              {techSkills.length > 0 ? (
                techSkills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 shadow-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">No skills extracted.</span>
              )}
            </div>
          </Card>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card glow="emerald" title="Identified Strengths" icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}>
              <ul className="space-y-2 text-xs text-slate-200">
                {strengths.length > 0 ? (
                  strengths.map((s: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">Solid technical foundation.</li>
                )}
              </ul>
            </Card>

            <Card glow="none" title="Areas for Improvement" icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}>
              <ul className="space-y-2 text-xs text-slate-200">
                {weaknesses.length > 0 ? (
                  weaknesses.map((w: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">No critical weaknesses detected.</li>
                )}
              </ul>
            </Card>
          </div>

          {/* Actionable Recommendations */}
          {recommendations.length > 0 && (
            <Card glow="cyan" title="Actionable Recommendations" icon={<Zap className="w-4 h-4 text-cyan-400" />}>
              <div className="space-y-2">
                {recommendations.map((r: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Job Match Comparisons */}
          {jobComparisons.length > 0 && (
            <Card glow="purple" title="Platform Job Match Benchmarks" subtitle="Comparison against live requisitions" icon={<Briefcase className="w-4 h-4 text-purple-400" />}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {jobComparisons.map((jm: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{jm.jobTitle}</span>
                      <Badge variant="cyan" size="sm">{jm.matchScore}%</Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">{jm.company}</p>
                    <div className="text-[10px] text-emerald-400">
                      Matched: {(jm.matchedSkills || []).slice(0, 3).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <FileText className="w-10 h-10 text-cyan-400/60 mx-auto" />
          <h3 className="text-base font-bold text-white">AI Analysis Pending</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {activeResume
              ? "Your CV is uploaded and stored in your account. Click the \"Analyse CV\" button above to generate your verified skills, ATS score, and benchmark comparisons."
              : "Upload your CV document above to begin AI analysis."}
          </p>
          {activeResume && (
            <Button
              variant="cyber"
              size="md"
              onClick={handleRunAnalysis}
              isLoading={isAnalyzing}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Analyse CV Now
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
