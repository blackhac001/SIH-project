import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'purple' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  dot = false,
  className,
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border select-none';

  const variants = {
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
    blue: 'bg-blue-950/60 text-blue-300 border-blue-500/40',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    rose: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
    slate: 'bg-slate-900/80 text-slate-300 border-slate-700/60',
  };

  const dotColors = {
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
    blue: 'bg-blue-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    slate: 'bg-slate-400',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-semibold tracking-wider uppercase',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />}
      {children}
    </span>
  );
};
