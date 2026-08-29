import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Sparkles, Target, Flame, AlertCircle, CheckCircle2,
  BookOpen, Award, ArrowRight, Compass, ShieldCheck
} from 'lucide-react';
import { computeSkillGapAPI, getSkillGapData, SkillGapAnalysis } from '../services/intelligenceService';

export const SkillGapPage: React.FC = () => {
  const targetRoles = [
    "Staff AI & Cloud Architect",
    "Senior Autonomous Robotics Lead",
    "Cloud Native DevOps Principal",
    "Enterprise Cybersecurity Threat Specialist"
  ];

  const [selectedRole, setSelectedRole] = useState(targetRoles[0]);
  const [data, setData] = useState<SkillGapAnalysis>(getSkillGapData());

  const handleRoleChange = async (role: string) => {
    setSelectedRole(role);
    try {
      const res = await computeSkillGapAPI(role);
      setData(res);
    } catch {
      setData(getSkillGapData());
    }
  };

  useEffect(() => {
    handleRoleChange(selectedRole);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
          <Target className="w-3.5 h-3.5" />
          <span>Benchmarking & Neural Competency Mapping</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Skill Gap Analysis
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Compare your verified skills directly against global high-demand target roles and generate an actionable learning curriculum.
        </p>
      </div>

      {/* Target Role Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-slate-800">
        <span className="text-xs font-mono text-slate-500 shrink-0">Select Target Benchmark:</span>
        {targetRoles.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleChange(role)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedRole === role
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-md shadow-purple-500/10'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>{role}</span>
            {selectedRole === role && <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>}
          </button>
        ))}
      </div>

      {/* Visual Skill Gap Meter Card */}
      <Card glow="purple" className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 text-center lg:text-left space-y-2">
            <div className="text-xs font-mono text-purple-400 uppercase tracking-wider">Overall Match Index</div>
            <div className="text-4xl font-black text-white font-mono">
              {data.candidateSkillsCoverage}%
              <span className="text-lg text-slate-500 font-normal"> / 100%</span>
            </div>
            <div className="text-xs text-rose-400 font-semibold flex items-center justify-center lg:justify-start gap-1">
              <span>Skill Gap:</span>
              <span className="font-mono">{100 - data.candidateSkillsCoverage}% Remaining</span>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              Estimated 12 weeks to achieve 100% benchmark qualification.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-4">
            {/* Visual Bar Comparison */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-cyan-400 font-mono">Your Verified Skills (78%)</span>
                <span className="text-purple-300 font-mono">Target Role Requirements (100%)</span>
              </div>
              <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${data.candidateSkillsCoverage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-emerald-400 font-bold font-mono">8 Skills</div>
                <div className="text-[10px] text-slate-400">Verified Matched</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-rose-400 font-bold font-mono">2 Skills</div>
                <div className="text-[10px] text-slate-400">Critical Missing</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-cyan-400 font-bold font-mono">2 Skills</div>
                <div className="text-[10px] text-slate-400">Important Gaps</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Categorized Gap Breakdown: Critical vs Important vs Nice to Have */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Critical Missing */}
        <Card glow="purple" className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 font-mono">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Critical Missing (P1)</span>
          </div>
          <p className="text-xs text-slate-400">Mandatory criteria for interview shortlisting.</p>

          <div className="space-y-2.5 pt-2">
            {data.criticalMissing.map((item, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs">
                <div className="font-bold text-rose-200">{item.skill}</div>
                <div className="text-[11px] text-slate-400 mt-1">{item.reason}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Important Missing */}
        <Card glow="cyan" className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            <span>Important Gaps (P2)</span>
          </div>
          <p className="text-xs text-slate-400">Key differentiators during technical panel reviews.</p>

          <div className="space-y-2.5 pt-2">
            {data.importantMissing.map((item, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs">
                <div className="font-bold text-cyan-200">{item.skill}</div>
                <div className="text-[11px] text-slate-400 mt-1">{item.reason}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Nice to Have */}
        <Card glow="blue" className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Nice to Have (P3)</span>
          </div>
          <p className="text-xs text-slate-400">Emerging competencies that provide extra leverage.</p>

          <div className="space-y-2.5 pt-2">
            {data.niceToHave.map((item, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs">
                <div className="font-bold text-blue-200">{item.skill}</div>
                <div className="text-[11px] text-slate-400 mt-1">{item.reason}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Personalized 12-Week Learning Curriculum */}
      <Card
        glow="cyan"
        title="Personalized 12-Week Bridge Curriculum"
        subtitle="Step-by-step accelerated learning path designed by AI for target benchmark"
        icon={<BookOpen className="w-4 h-4" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.curatedLearningPath.map((step, idx) => (
              <div
                key={step.week}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between group hover:border-cyan-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-cyan-400 font-semibold">{step.week}</span>
                    <span className="text-slate-500">Step {idx + 1}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {step.focus}
                  </h4>

                  <div className="space-y-1.5">
                    {step.skills.map((sk) => (
                      <div key={sk} className="text-xs text-slate-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        <span>{sk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-purple-300 font-mono flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">{step.certification}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
