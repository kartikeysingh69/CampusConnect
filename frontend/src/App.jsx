// src/App.jsx — Main routing & 3D background wrapper
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Background3D from './components/Background3D';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageJobs from './pages/admin/ManageJobs';
import ReviewApplications from './pages/admin/ReviewApplications';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import AtsChecker from './pages/AtsChecker';
import MockInterview from './pages/MockInterview';
import Forum from './pages/Forum';
import CodingAssessment from './pages/CodingAssessment';
import Messages from './pages/Messages';
import Analytics from './pages/Analytics';
import CampusBot from './components/CampusBot';
import LandingHome from './pages/LandingHome';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public / Student Browse Jobs */}
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetail />} />

      {/* Student Profile — Full-featured Student Profile Workspace */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Authenticated Student Routes */}
      <Route
        path="/my-applications"
        element={
          <ProtectedRoute>
            <MyApplications />
          </ProtectedRoute>
        }
      />

      {/* AI Resume ATS Checker */}
      <Route
        path="/ats-checker"
        element={
          <ProtectedRoute>
            <AtsChecker />
          </ProtectedRoute>
        }
      />

      {/* AI Mock Interview & Viva Simulator */}
      <Route path="/mock-prep" element={<MockInterview />} />

      {/* TPO Bulletin & Drive Q&A Forum */}
      <Route path="/forum" element={<Forum />} />

      {/* Phase 10: In-Browser Coding Assessment */}
      <Route path="/assessment" element={<CodingAssessment />} />

      {/* Phase 11: Real-Time Direct Messaging */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      {/* Phase 12: Predictive Placement Analytics */}
      <Route path="/analytics" element={<Analytics />} />

      {/* Corporate Recruiter Portal */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute adminOnly>
            <ManageJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute adminOnly>
            <ReviewApplications />
          </ProtectedRoute>
        }
      />

      {/* Flagship Front Page / Landing Home */}
      <Route path="/" element={<LandingHome />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function AppShell() {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const isLandingPage = location.pathname === '/';

  return (
    <>
      <Background3D />
      <Navbar />
      <main className={isProfilePage || isLandingPage ? "aicte-full-screen" : "container"}>
        <AppRoutes />
      </main>
      <CampusBot />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
