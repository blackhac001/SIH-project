import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#080C15]">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-900/90 p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="w-16 h-16 bg-slate-950 text-cyan-400 border border-slate-800 rounded-2xl mx-auto flex items-center justify-center">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">404 - Page Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested page does not exist or has been moved within the CONNECTX platform.
          </p>
        </div>
        <div className="flex items-center justify-center pt-2">
          <Link to="/">
            <Button size="sm" variant="cyber" className="gap-1.5">
              <Home className="w-4 h-4" />
              <span>Back to Platform Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
