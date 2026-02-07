import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Admin Components
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClientManager from "./components/admin/ClientManager";
import CustomerManager from "./components/admin/CustomerManager";
import AccountManager from "./components/admin/AccountManager";
import AuditLogs from "./pages/admin/AuditLogs";

// Client Components
import ClientLayout from "./layouts/ClientLayout";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientDeveloper from "./pages/client/ClientDeveloper";

// ATM Components
import ATMLayout from "./layouts/ATMLayout";
import ATMDashboard from "./pages/atm/ATMDashboard";
import ATMLogin from "./pages/atm/ATMLogin";

// Auth
import LoginPage from "./pages/auth/LoginPage";

export default function AppRouter() {
  const { role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">Loading Bankify...</div>;
  }

  // Helper component to protect routes based on authentication and role
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      // Redirect based on actual role if trying to access unauthorized area
      if (role === 'ADMIN') return <Navigate to="/admin" replace />;
      if (role === 'CLIENT') return <Navigate to="/client" replace />;
      if (role === 'USER') return <Navigate to="/atm" replace />;
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/atm-login" element={<ATMLogin />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="clients" element={<ClientManager />} />
        <Route path="customers" element={<CustomerManager />} />
        <Route path="accounts" element={<AccountManager />} />
        <Route path="audit-logs" element={<AuditLogs />} />
      </Route>

      {/* Client Routes */}
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientDashboard />} />
        <Route path="dashboard" element={<Navigate to="/client" replace />} />
        <Route path="actions" element={<ClientDashboard />} />
        <Route path="developers" element={<ClientDeveloper />} />
      </Route>

      {/* ATM Routes */}
      <Route
        path="/atm"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <ATMLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ATMDashboard />} />
      </Route>

      {/* Default Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}