import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import Messes from './pages/Messes';
import Members from './pages/Members';
import Attendance from './pages/Attendance';
import MenuHistory from './pages/MenuHistory';
import Polls from './pages/Polls';

function ProtectedRoute({ children }) {
  const { user, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--dark-950)]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/owners" element={<ProtectedRoute><Owners /></ProtectedRoute>} />
      <Route path="/messes" element={<ProtectedRoute><Messes /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/menu-history" element={<ProtectedRoute><MenuHistory /></ProtectedRoute>} />
      <Route path="/polls" element={<ProtectedRoute><Polls /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
