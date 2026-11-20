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

      {/* Default redirect to Jobs or Admin */}
      <Route
        path="/"
        element={<Navigate to={user?.role === 'admin' ? '/admin' : '/jobs'} />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function AppShell() {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';

  return (
    <>
      <Background3D />
      <Navbar />
      <main className={isProfilePage ? "aicte-full-screen" : "container"}>
        <AppRoutes />
      </main>
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
