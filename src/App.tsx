import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Resume } from './pages/Resume';
import { InterviewWizard } from './pages/interviews/InterviewWizard';
import { InterviewSession } from './pages/interviews/InterviewSession';
import { Evaluation } from './pages/interviews/Evaluation';
import { CodingDashboard } from './pages/coding/CodingDashboard';
import { CodingSetupWizard } from './pages/coding/CodingSetupWizard';
import { CodingSession } from './pages/coding/CodingSession';
import { ReportsLayout } from './components/layout/ReportsLayout';
import { ReportsOverview } from './pages/reports/ReportsOverview';
import { InterviewHistory } from './pages/reports/InterviewHistory';
import { SkillAnalytics } from './pages/reports/SkillAnalytics';
import { ProgressMilestones } from './pages/reports/ProgressMilestones';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { CodeReviewPage } from './pages/coding/review/CodeReviewPage';
import { CodingAnalyticsDashboard } from './pages/coding/analytics/CodingAnalyticsDashboard';
import { HistoryPage } from './pages/coding/history/HistoryPage';
import { CompareAttemptsPage } from './pages/coding/history/CompareAttemptsPage';
import { PracticeHub } from './pages/coding/practice/PracticeHub';
import { AssessmentHub } from './pages/coding/assessments/AssessmentHub';
import { AssessmentWorkspace } from './pages/coding/assessments/AssessmentWorkspace';

// Phase 3.7: Live Interviews
import { LiveSetup } from './pages/interviews/live/LiveSetup';
import { LiveSession } from './pages/interviews/live/LiveSession';
import { LiveReport } from './pages/interviews/live/LiveReport';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/resume" element={<Resume />} />
              <Route path="/dashboard/interviews" element={<InterviewWizard />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              
              {/* Reports & Analytics Nested Routes */}
              <Route path="/reports" element={<ReportsLayout />}>
                <Route index element={<ReportsOverview />} />
                <Route path="interviews" element={<InterviewHistory />} />
                <Route path="skills" element={<SkillAnalytics />} />
                <Route path="progress" element={<ProgressMilestones />} />
              </Route>
            </Route>
            
            {/* Coding Dashboard & Setup inside dashboard layout */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard/coding" element={<CodingDashboard />} />
              <Route path="/dashboard/coding/setup" element={<CodingSetupWizard />} />
              <Route path="/dashboard/coding/analytics" element={<CodingAnalyticsDashboard />} />
              <Route path="/dashboard/coding/history" element={<HistoryPage />} />
              <Route path="/dashboard/coding/history/compare/:questionId" element={<CompareAttemptsPage />} />
              <Route path="/dashboard/coding/practice" element={<PracticeHub />} />
              <Route path="/dashboard/coding/assessments" element={<AssessmentHub />} />
            </Route>

            {/* Full screen sessions */}
            <Route path="/dashboard/coding/session/:sessionId" element={<CodingSession />} />
            <Route path="/dashboard/coding/review/:reviewId" element={<CodeReviewPage />} />
            <Route path="/dashboard/coding/assessment/:assessmentId" element={<AssessmentWorkspace />} />
            <Route path="/interview/:sessionId" element={<InterviewSession />} />
            
            {/* Phase 3.7: Live Voice/Video Interviews */}
            <Route path="/dashboard/interview/live/setup" element={<LiveSetup />} />
            <Route path="/dashboard/interview/live/session/:sessionId" element={<LiveSession />} />
            <Route path="/dashboard/interview/live/report/:sessionId" element={<LiveReport />} />
            <Route path="/evaluation/:sessionId" element={<Evaluation />} />
            <Route path="/coding/session/:sessionId" element={<CodingSession />} />
            <Route path="/coding/review/:submissionId" element={<CodeReviewPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
