import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  glow?: 'none' | 'cyan' | 'purple' | 'blue' | 'emerald';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  icon,
  glow = 'none',
}) => {
  const glowStyles = {
    none: 'border-slate-800/80 hover:border-slate-700',
    cyan: 'border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.1)]',
    purple: 'border-purple-500/30 hover:border-purple-400/60 shadow-[0_0_20px_rgba(139,92,246,0.1)]',
    blue: 'border-blue-500/30 hover:border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    emerald: 'border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
  };

  return (
    <div className={`rounded-2xl bg-[#0D1322]/80 backdrop-blur-xl border ${glowStyles[glow]} transition-all duration-300 ${className}`}>
      {(title || action || icon) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="font-semibold text-slate-100 tracking-tight text-base">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
