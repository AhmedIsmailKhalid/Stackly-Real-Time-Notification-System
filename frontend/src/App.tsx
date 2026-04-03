import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { initializeAuth } from '@/services/authService';
import { useSocket } from '@/hooks/useSocket';
import AppShell from '@/components/layout/AppShell';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import NotificationsPage from '@/pages/NotificationsPage';
import Spinner from '@/components/common/Spinner';

// ─────────────────────────────────────────
// SOCKET INITIALIZER
// Mounted inside authenticated routes only
// ─────────────────────────────────────────

const SocketInitializer = () => {
  useSocket();
  return null;
};

// ─────────────────────────────────────────
// PROTECTED ROUTE
// ─────────────────────────────────────────

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <SocketInitializer />
      {children}
    </>
  );
};

// ─────────────────────────────────────────
// PUBLIC ROUTE
// Redirect to dashboard if already authed
// ─────────────────────────────────────────

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ─────────────────────────────────────────
// APP
// ─────────────────────────────────────────

const App = () => {
  const { setInitializing } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setInitializing(false);
    };
    init();
  }, [setInitializing]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;