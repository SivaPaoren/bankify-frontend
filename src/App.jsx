// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CustomersPage from "./pages/CustomersPage.jsx";
import AccountsPage from "./pages/AccountsPage.jsx";
import PaymentsPage from "./pages/PaymentsPage.jsx";
import TransactionsPage from "./pages/TransactionsPage.jsx";
import AuditLogsPage from "./pages/AuditLogsPage.jsx";
import DevelopersPage from "./pages/DevelopersPage.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected area (later you’ll wrap with PrivateRoute) */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
        <Route path="/developers" element={<DevelopersPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
