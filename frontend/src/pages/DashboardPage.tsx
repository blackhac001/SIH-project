import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { CandidateDashboard } from './CandidateDashboard';
import { CompanyDashboard } from './CompanyDashboard';

interface ContextType {
  currentMode: 'candidate' | 'company';
  setCurrentMode: (mode: 'candidate' | 'company') => void;
}

export const DashboardPage: React.FC = () => {
  const context = useOutletContext<ContextType>();
  const mode = context?.currentMode || 'candidate';

  if (mode === 'company') {
    return <CompanyDashboard />;
  }

  return <CandidateDashboard />;
};
