 import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Placeholder components - replace these with your actual imports later
// import AdminLayout from "../layouts/AdminLayout";
// import ClientLayout from "../layouts/ClientLayout";
// import ATMLayout from "../layouts/ATMLayout";
// import LoginPage from "../pages/LoginPage";
// import ATMLogin from "../pages/atm/ATMLogin";

const AdminLayout = () => <div className="p-4">Admin Dashboard (Placeholder)</div>;
const ClientLayout = () => <div className="p-4">Client Dashboard (Placeholder)</div>;
const ATMLayout = () => <div className="p-4">ATM Interface (Placeholder)</div>;
const LoginPage = () => <div className="p-4">Login Page (Placeholder)</div>;
const ATMLogin = () => <div className="p-4">ATM Login (Placeholder)</div>;

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
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* Client Routes */}
      <Route
        path="/client/*"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <ClientLayout />
          </ProtectedRoute>
        }
      />

      {/* ATM Routes */}
      <Route
        path="/atm/*"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <ATMLayout />
          </ProtectedRoute>
        }
      />

      {/* Default Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
do