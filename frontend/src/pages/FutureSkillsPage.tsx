import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Compass, Sparkles, TrendingUp, BookOpen, ExternalLink,
  Zap, Clock, Award, CheckCircle2, ArrowRight
} from 'lucide-react';
import { fetchFutureSkillsAPI, getFutureSkillsData, FutureSkill } from '../services/intelligenceService';

export const FutureSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<FutureSkill[]>(getFutureSkillsData());
  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadFutureSkills = async () => {
      try {
        const res = await fetchFutureSkillsAPI();
        if (res && res.length > 0) {
          setSkills(res);
        }
      } catch {
        // fallback
      }
    };
    loadFutureSkills();
  }, []);

  const handleEnroll = (id: string) => {
    setEnrolledMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Global Labor Market Predictive Intelligence (2026—2028)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Future Skills Prediction ("What Will You Need Next?")
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Predictive labor intelligence forecasting technologies that will yield the highest career velocity, enterprise demand, and compensation premiums worldwide.
        </p>
      </div>

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card glow="cyan" className="p-5">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Top Emerging Frontier</div>
          <div className="text-2xl font-bold text-cyan-300 mt-1">Generative AI & LLMOps</div>
          <div className="text-xs text-emerald-400 font-semibold mt-1">+58% Global Demand Growth</div>
        </Card>

        <Card glow="purple" className="p-5">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Highest Salary Premium</div>
          <div className="text-2xl font-bold text-purple-300 mt-1">AI Security & Red Teaming</div>
          <div className="text-xs text-purple-300 font-semibold mt-1">+$20,000 - $24,000 / yr lift</div>
        </Card>

        <Card glow="emerald" className="p-5">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Enterprise Infrastructure Standard</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">Cloud Native Kubernetes</div>
          <div className="text-xs text-slate-400 mt-1">Required in 74% of Senior Postings</div>
        </Card>
      </div>

      {/* Future Skills Cards List */}
      <div className="space-y-4">
        {skills.map((skill) => (
          <Card
            key={skill.id}
            glow={skill.importance === 'CRITICAL' ? 'purple' : 'cyan'}
            className="p-6 transition-all hover:scale-[1.005]"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left Details */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-lg font-bold text-white">{skill.name}</span>
                  <Badge
                    variant={
                      skill.importance === 'CRITICAL'
                        ? 'rose'
                        : skill.importance === 'HIGH'
                        ? 'cyan'
                        : 'purple'
                    }
                    size="sm"
                    dot
                  >
                    {skill.importance}
                  </Badge>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                    {skill.category}
                  </span>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Demand Trend</span>
                    <span className="text-emerald-400 font-bold">{skill.demandGrowth}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Salary Premium</span>
                    <span className="text-cyan-300 font-bold">{skill.globalSalaryPremium}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Estimated Time</span>
                    <span className="text-white font-bold">{skill.timeToLearn}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Difficulty</span>
                    <span className="text-purple-300 font-bold">{skill.difficulty}</span>
                  </div>
                </div>

                {/* Recommended Course Box */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-slate-400">Curated Course: </span>
                      <strong className="text-slate-200">{skill.recommendedCourse}</strong>
                      <span className="text-slate-500 text-[11px] block">Provided by {skill.provider}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-mono shrink-0">
                    Accredited
                  </span>
                </div>
              </div>

              {/* Right Action */}
              <div className="shrink-0 w-full lg:w-auto flex lg:flex-col items-center justify-between lg:justify-center gap-3">
                <Button
                  variant={enrolledMap[skill.id] ? 'secondary' : 'cyber'}
                  size="md"
                  onClick={() => handleEnroll(skill.id)}
                  disabled={enrolledMap[skill.id]}
                  leftIcon={enrolledMap[skill.id] ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Zap className="w-4 h-4" />}
                >
                  {enrolledMap[skill.id] ? 'Tracked in Plan ✓' : 'Add to Learning Plan'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
