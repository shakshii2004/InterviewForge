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
import { ReportsLayout } from './components/layout/ReportsLayout';
import { ReportsOverview } from './pages/reports/ReportsOverview';
import { InterviewHistory } from './pages/reports/InterviewHistory';
import { SkillAnalytics } from './pages/reports/SkillAnalytics';
import { ProgressMilestones } from './pages/reports/ProgressMilestones';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

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
            {/* The actual interview is outside the dashboard layout (full screen) */}
            <Route path="/interview/:sessionId" element={<InterviewSession />} />
            <Route path="/evaluation/:sessionId" element={<Evaluation />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
