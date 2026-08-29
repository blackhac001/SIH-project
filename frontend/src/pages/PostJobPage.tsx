import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Briefcase, Sparkles, CheckCircle2, Globe2,
  DollarSign, MapPin, Plus, X, ArrowRight
} from 'lucide-react';

export const PostJobPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Cloud Infrastructure');
  const [country, setCountry] = useState('United States');
  const [city, setCity] = useState('San Francisco, CA');
  const [workplaceType, setWorkplaceType] = useState<'Remote' | 'Hybrid' | 'Onsite'>('Hybrid');
  const [experienceLevel, setExperienceLevel] = useState('Senior');
  const [salaryMin, setSalaryMin] = useState('140000');
  const [salaryMax, setSalaryMax] = useState('185000');
  const [visaSponsorship, setVisaSponsorship] = useState(true);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(['Python', 'Kubernetes', 'Distributed Systems', 'PyTorch']);
  const [description, setDescription] = useState(
    'We are looking for a Senior Engineer to architect large-scale distributed inference pipelines serving mission-critical AI workloads across global cloud regions.'
  );
  const [submitted, setSubmitted] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (sk: string) => {
    setSkills(skills.filter((s) => s !== sk));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/dashboard/jobs');
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Global Requisition & Candidate Match Dispatch</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Global Requisition
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Post an international job opening with AI skill benchmark definitions to immediately match against verified global talent.
        </p>
      </div>

      {submitted ? (
        <Card glow="emerald" className="p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Requisition Published Successfully!</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Your job has been broadcast to 150+ countries. CONNECTX AI matching is ranking pre-vetted candidates...
          </p>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card glow="purple" title="Requisition Details" subtitle="Role title, location and compensation package">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                  Job Position Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior AI Infrastructure Engineer"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-xs text-white placeholder-slate-500 focus:outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                    Workplace Arrangement
                  </label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
                    value={workplaceType}
                    onChange={(e) => setWorkplaceType(e.target.value as any)}
                  >
                    <option value="Remote">100% Remote Global</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                    City / Region
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                    Minimum Annual Salary (USD $)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none font-mono"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                    Maximum Annual Salary (USD $)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none font-mono"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="visaSponsor"
                  checked={visaSponsorship}
                  onChange={(e) => setVisaSponsorship(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                />
                <label htmlFor="visaSponsor" className="text-xs text-slate-300">
                  Provide international visa sponsorship & relocation assistance
                </label>
              </div>
            </div>
          </Card>

          {/* Required Skills Multi-Tag */}
          <Card glow="cyan" title="Required Competency Benchmarks" subtitle="Define critical skills for the neural matching algorithm">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a required skill (e.g. PyTorch, Docker, Kubernetes)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white focus:outline-none"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button variant="secondary" size="md" type="button" onClick={addSkill}>
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 font-mono"
                  >
                    <span>{sk}</span>
                    <button type="button" onClick={() => removeSkill(sk)} className="hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card glow="none" title="Role Description & Mandate">
            <textarea
              rows={4}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-xs text-white focus:outline-none leading-relaxed"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" size="lg" type="button" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button variant="cyber" size="lg" type="submit">
              Publish & Broadcast Requisition
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
