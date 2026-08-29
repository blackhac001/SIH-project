import React from 'react';
import { Logo } from './Logo';
import { Globe2, ShieldCheck, Heart, Sparkles, ArrowUpRight, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05080F] border-t border-slate-800/80 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="lg" showTagline />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              CONNECTX is the global skill-to-employment intelligence ecosystem connecting people, verified capabilities, and companies across 150+ countries.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="#" className="p-2 rounded-xl bg-slate-900 hover:bg-cyan-500/20 hover:text-cyan-400 border border-slate-800 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-900 hover:bg-cyan-500/20 hover:text-cyan-400 border border-slate-800 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-900 hover:bg-cyan-500/20 hover:text-cyan-400 border border-slate-800 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 1 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">
              AI Intelligence
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/#resume" className="hover:text-cyan-400 transition-colors">AI Resume Evaluator</a></li>
              <li><a href="/#earnings" className="hover:text-cyan-400 transition-colors">5-Year Salary Predictor</a></li>
              <li><a href="/#skills" className="hover:text-cyan-400 transition-colors">Future Skill Forecasts</a></li>
              <li><a href="/#gap" className="hover:text-cyan-400 transition-colors">Skill Gap Benchmark</a></li>
              <li><a href="/#copilot" className="hover:text-cyan-400 transition-colors">Career Copilot AI</a></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/#jobs" className="hover:text-cyan-400 transition-colors">Global Remote Jobs</a></li>
              <li><a href="/#visa" className="hover:text-cyan-400 transition-colors">Visa Sponsored Roles</a></li>
              <li><a href="/#companies" className="hover:text-cyan-400 transition-colors">Enterprise Partners</a></li>
              <li><a href="/#talent" className="hover:text-cyan-400 transition-colors">Recruiter Talent Pool</a></li>
              <li><a href="/#map" className="hover:text-cyan-400 transition-colors">World Skills Map</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">
              Trust & Privacy
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Zero-Trust Security</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">DPDP & GDPR Compliance</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Candidate Consent Model</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Synthetic Demo Data Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 CONNECTX Platform Inc. All rights reserved. Global Skill-to-Employment Intelligence.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-cyan-400 font-medium font-mono">Global Mesh Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
