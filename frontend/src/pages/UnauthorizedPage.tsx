import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#080C15]">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-900/90 p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="w-16 h-16 bg-rose-950/40 text-rose-400 border border-rose-500/30 rounded-2xl mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">403 - Access Restricted</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You do not have the required permissions or role authorization to access this workspace module.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/candidate/dashboard">
            <Button size="sm" variant="cyber" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Workspace</span>
            </Button>
          </Link>
          <Link to="/">
            <Button size="sm" variant="secondary" className="gap-1.5">
              <Home className="w-4 h-4" />
              <span>Public Platform</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
