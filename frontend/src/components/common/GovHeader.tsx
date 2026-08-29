import React from 'react';
import { Globe2, Sparkles, ShieldCheck } from 'lucide-react';

export const GovHeader: React.FC = () => {
  return (
    <div className="bg-[#05080F] border-b border-slate-800/80 py-1.5 px-4 text-[11px] text-slate-400">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
            <Globe2 className="w-3.5 h-3.5 animate-spin-slow" />
            CONNECTX Global Intelligence Network
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400">
            Active in 150+ Countries & 35,000+ Verified Enterprise Partners
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            AI Models Online (v2.6)
          </span>
          <span className="hidden md:flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Zero-Trust Credential Verification
          </span>
        </div>
      </div>
    </div>
  );
};
