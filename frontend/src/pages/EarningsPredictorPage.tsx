import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  TrendingUp, DollarSign, ShieldAlert, Sparkles, CheckCircle2,
  Globe2, Plus, ArrowUpRight, Award, Zap, Info
} from 'lucide-react';
import { predictSalaryAPI, SalaryProjection } from '../services/intelligenceService';

export const EarningsPredictorPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<SalaryProjection | null>(null);
  const [selectedBoosts, setSelectedBoosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSalary = async () => {
      try {
        setLoading(true);
        const res = await predictSalaryAPI();
        if (res && res.currentEstimatedSalary > 0) {
          setData(res);
        } else {
          setData(null);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    loadSalary();
  }, []);

  const toggleBoost = (skillName: string) => {
    setSelectedBoosts((prev) =>
      prev.includes(skillName) ? prev.filter((s) => s !== skillName) : [...prev, skillName]
    );
  };

  const totalSimulatedBoost = selectedBoosts.reduce((acc, skill) => {
    const boost = data?.skillBoostSimulations?.find((b) => b.skillName === skill);
    return acc + (boost ? boost.addedValue : 0);
  }, 0);

  const simulatedMaxSalary = (data?.potentialSalary || 0) + totalSimulatedBoost;
  const hasData = Boolean(data && data.currentEstimatedSalary > 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>AI Longitudinal Earnings & Compensation Forecasting</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Career Earnings & Salary Predictor
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Predict your 1-year, 3-year, and 5-year earning potential based on verified competencies, seniority, and global market signals.
        </p>
      </div>

      {hasData && data ? (
        <>
          {/* Main Stats Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card glow="cyan" className="p-5">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Current Estimated Baseline</div>
              <div className="text-3xl font-extrabold text-white mt-1.5 font-mono">
                ${data.currentEstimatedSalary.toLocaleString()}
              </div>
              <p className="text-xs text-cyan-400 mt-2">Based on current profile & region</p>
            </Card>

            <Card glow="emerald" className="p-5">
              <div className="text-[11px] font-mono text-emerald-400 uppercase">5-Year Market Potential</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1.5 font-mono">
                ${simulatedMaxSalary.toLocaleString()}
              </div>
              <p className="text-xs text-emerald-400 mt-2">
                +{data.currentEstimatedSalary > 0 ? (((simulatedMaxSalary - data.currentEstimatedSalary) / data.currentEstimatedSalary) * 100).toFixed(1) : '0.0'}% Growth
              </p>
            </Card>

            <Card glow="purple" className="p-5">
              <div className="text-[11px] font-mono text-purple-400 uppercase">Model Reliability Index</div>
              <div className="text-3xl font-extrabold text-purple-300 mt-1.5 font-mono">
                {data.confidenceScore}%
              </div>
              <p className="text-xs text-slate-400 mt-2">Trained on 450k+ global tech offers</p>
            </Card>

            <Card glow="blue" className="p-5">
              <div className="text-[11px] font-mono text-blue-400 uppercase">Active Simulation Boost</div>
              <div className="text-3xl font-extrabold text-cyan-300 mt-1.5 font-mono">
                +${totalSimulatedBoost.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-2">{selectedBoosts.length} Simulated Credentials</p>
            </Card>
          </div>

          {/* 5-Year Trajectory Line & Progression Chart */}
          <Card
            glow="cyan"
            title="5-Year Longitudinal Earnings Trajectory (2026 — 2030)"
            subtitle="Year-over-year compensation acceleration with equity and bonus components"
            icon={<TrendingUp className="w-4 h-4" />}
          >
            <div className="space-y-6">
              {/* Timeline Points Visualizer */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {data.timeline.map((point, index) => {
                  const boostForYear = (totalSimulatedBoost * (index + 1)) / 5;
                  const totalWithBoost = point.total + boostForYear;
                  const maxVal = Math.max((data.potentialSalary + totalSimulatedBoost) * 1.15, 200000);
                  const heightPercent = Math.min((totalWithBoost / maxVal) * 100, 100);

                  return (
                    <div
                      key={point.year}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400">{point.year}</span>
                          <span className="text-cyan-400 font-semibold">Yr {index + 1}</span>
                        </div>

                        <div className="text-xl font-black text-white mt-2 font-mono group-hover:text-cyan-300 transition-colors">
                          ${Math.round(totalWithBoost).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Base: ${point.baseSalary.toLocaleString()} + Bonus/Eq
                        </div>
                      </div>

                      {/* Vertical Progress Bar */}
                      <div className="w-full bg-slate-800 h-28 rounded-xl mt-4 p-1 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-cyan-500 via-blue-500 to-purple-500 rounded-lg transition-all duration-700 group-hover:brightness-125"
                          style={{ height: `${Math.max(heightPercent, 10)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Compensation incorporates verified global remote market averages across Tier-1 hubs.</span>
                </div>
                <span className="font-mono text-cyan-300 font-semibold">Currency: USD ($)</span>
              </div>
            </div>
          </Card>

          {/* Interactive Skill Boost Simulator */}
          {data.skillBoostSimulations && data.skillBoostSimulations.length > 0 && (
            <Card
              glow="purple"
              title="Interactive Skill Value Booster Simulation"
              subtitle="Select high-impact credentials to instantly simulate projected salary lift"
              icon={<Zap className="w-4 h-4 text-purple-400" />}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.skillBoostSimulations.map((boost) => {
                    const isSelected = selectedBoosts.includes(boost.skillName);
                    return (
                      <div
                        key={boost.skillName}
                        onClick={() => toggleBoost(boost.skillName)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                            {boost.category}
                          </span>
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isSelected ? '✓' : '+'}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-white mb-1">{boost.skillName}</div>
                        <div className="text-xs font-mono text-emerald-400 font-semibold">
                          +${boost.addedValue.toLocaleString()} / year
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Explainability: Positive Drivers vs Growth Blockers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Positive Drivers */}
            <Card
              glow="emerald"
              title="Positive Career Value Drivers"
              subtitle="Competencies expanding your compensation ceiling"
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            >
              <div className="space-y-3">
                {data.positiveDrivers.map((driver, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{driver.factor}</div>
                      <div className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">{driver.impact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Growth Blockers */}
            <Card
              glow="purple"
              title="Detected Career Bottlenecks"
              subtitle="Identified gaps that restrict maximum offer velocity"
              icon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
            >
              <div className="space-y-3">
                {data.growthBlockers.map((blocker, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                      <span>{blocker.blocker}</span>
                      <span className="font-mono text-rose-400">{blocker.impact}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-cyan-400">Action: </strong>
                      {blocker.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>{data.disclaimer || "Estimated market range based on verified skills and market index — not a guaranteed salary."}</span>
          </div>
        </>
      ) : (
        /* Empty State */
        <Card glow="emerald" className="p-8 sm:p-12 text-center space-y-4">
          <TrendingUp className="w-12 h-12 text-emerald-400/60 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Salary Baseline Calculated Yet</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Upload and analyze your CV to forecast your 1-year, 3-year, and 5-year earnings trajectory based on verified technical competencies and global market benchmarks.
          </p>
          <div className="pt-2">
            <Button
              variant="cyber"
              size="md"
              onClick={() => navigate('/candidate/resume')}
              leftIcon={<Zap className="w-4 h-4" />}
            >
              Upload & Analyze CV
            </Button>
          </div>
        </Card>
      )}

      {/* Mandatory Regulatory & Model Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-500 leading-relaxed">
        <strong className="text-slate-400">AI Estimation Protocol: </strong>
        Earnings projections and salary simulations are mathematical estimates generated by the CONNECTX Career Intelligence Engine using verified profile attributes, global demand indices, and hiring trends. Projections do not constitute a contractual guarantee or legal promise of employment compensation.
      </div>
    </div>
  );
};
