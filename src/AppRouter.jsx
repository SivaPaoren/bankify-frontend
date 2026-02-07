import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Placeholder components - replace these with your actual imports later
// import AdminLayout from "../layouts/AdminLayout";
// import ClientLayout from "../layouts/ClientLayout";
// import ATMLayout from "../layouts/ATMLayout";
// import LoginPage from "../pages/LoginPage";
// import ATMLogin from "../pages/atm/ATMLogin";

import AdminLayout from "../layouts/AdminLayout";
import AdminOverview from "../pages/admin/AdminOverview";
import ClientManager from "../components/admin/ClientManager";
import CustomerManager from "../components/admin/CustomerManager";
import AccountManager from "../components/admin/AccountManager";

import LoginPage from "../pages/LoginPage";
import ATMLogin from "../pages/atm/ATMLogin";

import LoginPage from "../pages/LoginPage";
import ATMLogin from "../pages/atm/ATMLogin";
import ATMLayout from "../layouts/ATMLayout";
import ATMDashboard from "../pages/atm/ATMDashboard";
import ClientLayout from "../layouts/ClientLayout";
import ClientDashboard from "../pages/client/ClientDashboard";
import ClientDeveloper from "../pages/client/ClientDeveloper";

export default function AppRouter() {
  const { role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Helper component to protect routes based on authentication and role
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      // Redirect to the appropriate dashboard if the user is logged in but has the wrong role
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
        <Route index element={<AdminOverview />} />
        <Route path="clients" element={<ClientManager />} />
        <Route path="customers" element={<CustomerManager />} />
        <Route path="accounts" element={<AccountManager />} />
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
        <Route path="actions" element={<ClientDashboard />} /> {/* Re-using for now or specific page */}
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