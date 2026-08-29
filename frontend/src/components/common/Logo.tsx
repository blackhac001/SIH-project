import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  to?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  to = '/',
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 'w-11 h-11', text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-14 h-14', text: 'text-3xl', sub: 'text-sm' },
  };

  const { icon, text, sub } = sizeMap[size];

  const logoContent = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Stylized Interconnected C + X Core Icon */}
      <div className={`relative ${icon} shrink-0`}>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 blur-[8px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative w-full h-full rounded-xl bg-[#0B1120] border border-cyan-500/40 flex items-center justify-center p-1.5 shadow-lg group-hover:border-cyan-400 transition-colors">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Global Orbit Arc */}
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="url(#orbitGradient)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              className="opacity-40"
            />
            {/* C-Shape Flow (Left Arc) */}
            <path
              d="M 22 12 A 12 12 0 1 0 22 36"
              stroke="url(#cyanBlueGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* X-Cross Nodes & Diagonal Connections */}
            <line
              x1="22"
              y1="16"
              x2="36"
              y2="32"
              stroke="url(#purpleGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <line
              x1="36"
              y1="16"
              x2="22"
              y2="32"
              stroke="url(#cyanGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Interconnected Glowing Signal Nodes */}
            <circle cx="24" cy="24" r="3.5" fill="#22D3EE" />
            <circle cx="36" cy="16" r="2" fill="#A855F7" />
            <circle cx="36" cy="32" r="2" fill="#3B82F6" />
            <circle cx="22" cy="12" r="2" fill="#06B6D4" />
            <circle cx="22" cy="36" r="2" fill="#8B5CF6" />

            <defs>
              <linearGradient id="cyanBlueGrad" x1="10" y1="12" x2="24" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="purpleGrad" x1="22" y1="16" x2="36" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" />
                <stop offset="1" stopColor="#C084FC" />
              </linearGradient>
              <linearGradient id="cyanGrad" x1="36" y1="16" x2="22" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A855F7" />
                <stop offset="1" stopColor="#22D3EE" />
              </linearGradient>
              <linearGradient id="orbitGradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE" />
                <stop offset="0.5" stopColor="#3B82F6" />
                <stop offset="1" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center tracking-tight font-black font-sans leading-none">
          <span className={`text-white ${text}`}>CONNECT</span>
          <span className={`text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 ${text}`}>
            X
          </span>
        </div>
        {showTagline && (
          <span className={`text-cyan-400/80 font-medium tracking-wider uppercase ${sub} mt-0.5`}>
            Skill Intelligence Platform
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-block">{logoContent}</Link>;
  }

  return logoContent;
};
