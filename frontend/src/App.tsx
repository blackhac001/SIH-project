import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { MainLayout } from './layouts/MainLayout';
import { RoleDashboardLayout } from './layouts/RoleDashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

import { ResumeIntelligencePage } from './pages/ResumeIntelligencePage';
import { EarningsPredictorPage } from './pages/EarningsPredictorPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { FutureSkillsPage } from './pages/FutureSkillsPage';
import { JobsMarketplacePage } from './pages/JobsMarketplacePage';
import { CareerRoadmapPage } from './pages/CareerRoadmapPage';
import { CareerCopilotPage } from './pages/CareerCopilotPage';
import { CandidateSearchPage } from './pages/CandidateSearchPage';
import { PostJobPage } from './pages/PostJobPage';
import { MessagesPage } from './pages/MessagesPage';
import { GlobalSkillsMapPage } from './pages/GlobalSkillsMapPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role;
  if (role === 'EMPLOYER') return <Navigate to="/company/dashboard" replace />;
  if (role === 'TRAINING_PROVIDER') return <Navigate to="/provider/dashboard" replace />;
  if (role === 'SUPER_ADMIN' || role === 'STATE_ADMIN' || role === 'DISTRICT_OFFICER') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/candidate/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />
            <Route path="404" element={<NotFoundPage />} />
          </Route>

          {/* 1. CANDIDATE WORKSPACE */}
          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'SUPER_ADMIN', 'STATE_ADMIN']}>
                <RoleDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CandidateDashboard />} />
            <Route path="dashboard" element={<CandidateDashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="resume" element={<ResumeIntelligencePage />} />
            <Route path="earnings" element={<EarningsPredictorPage />} />
            <Route path="skill-gap" element={<SkillGapPage />} />
            <Route path="future-skills" element={<FutureSkillsPage />} />
            <Route path="jobs" element={<JobsMarketplacePage />} />
            <Route path="applications" element={<JobsMarketplacePage />} />
            <Route path="roadmap" element={<CareerRoadmapPage />} />
            <Route path="copilot" element={<CareerCopilotPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="map" element={<GlobalSkillsMapPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="*" element={<CandidateDashboard />} />
          </Route>

          {/* 2. COMPANY / EMPLOYER WORKSPACE */}
          <Route
            path="/company"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYER', 'SUPER_ADMIN', 'STATE_ADMIN']}>
                <RoleDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CompanyDashboard />} />
            <Route path="dashboard" element={<CompanyDashboard />} />
            <Route path="jobs" element={<JobsMarketplacePage />} />
            <Route path="candidates" element={<CandidateSearchPage />} />
            <Route path="applications" element={<CandidateSearchPage />} />
            <Route path="interviews" element={<CandidateSearchPage />} />
            <Route path="hired" element={<CandidateSearchPage />} />
            <Route path="analytics" element={<CompanyDashboard />} />
            <Route path="post-job" element={<PostJobPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="map" element={<GlobalSkillsMapPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<CompanyDashboard />} />
          </Route>

          {/* 3. RECRUITER WORKSPACE */}
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYER', 'SUPER_ADMIN', 'STATE_ADMIN']}>
                <RoleDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RecruiterDashboard />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="search" element={<RecruiterDashboard />} />
            <Route path="candidates" element={<CandidateSearchPage />} />
            <Route path="shortlists" element={<CandidateSearchPage />} />
            <Route path="interviews" element={<CandidateSearchPage />} />
            <Route path="jobs" element={<JobsMarketplacePage />} />
            <Route path="analytics" element={<RecruiterDashboard />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="*" element={<RecruiterDashboard />} />
          </Route>

          {/* 4. TRAINING / EDUCATION PROVIDER WORKSPACE */}
          <Route
            path="/provider"
            element={
              <ProtectedRoute allowedRoles={['TRAINING_PROVIDER', 'SUPER_ADMIN', 'STATE_ADMIN']}>
                <RoleDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProviderDashboard />} />
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="learners" element={<CandidateSearchPage />} />
            <Route path="courses" element={<FutureSkillsPage />} />
            <Route path="skills" element={<SkillGapPage />} />
            <Route path="certifications" element={<CareerRoadmapPage />} />
            <Route path="outcomes" element={<ProviderDashboard />} />
            <Route path="employer-demand" element={<ProviderDashboard />} />
            <Route path="future-skills" element={<FutureSkillsPage />} />
            <Route path="analytics" element={<ProviderDashboard />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="*" element={<ProviderDashboard />} />
          </Route>

          {/* 5. ECOSYSTEM ADMIN WORKSPACE */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_OFFICER']}>
                <RoleDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="candidates" element={<CandidateSearchPage />} />
            <Route path="companies" element={<CompanyDashboard />} />
            <Route path="jobs" element={<JobsMarketplacePage />} />
            <Route path="skills" element={<SkillGapPage />} />
            <Route path="intelligence" element={<GlobalSkillsMapPage />} />
            <Route path="analytics" element={<AdminDashboard />} />
            <Route path="ai-insights" element={<AdminDashboard />} />
            <Route path="anomalies" element={<AdminDashboard />} />
            <Route path="audit" element={<AdminDashboard />} />
            <Route path="settings" element={<AdminDashboard />} />
            <Route path="*" element={<AdminDashboard />} />
          </Route>

          {/* Generic /dashboard redirect */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/dashboard/*" element={<DashboardRedirect />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
