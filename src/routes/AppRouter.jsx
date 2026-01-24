import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import ATMLayout from "../layouts/ATMLayout.jsx";

import LoginPage from "../pages/auth/LoginPage.jsx";
import ATMLogin from "../pages/auth/ATMLogin.jsx";

import AdminDashboard from "../pages/admin/Dashboard.jsx";
import Clients from "../pages/admin/Clients.jsx";
import CreateAccount from "../pages/admin/CreateAccount.jsx";
import AuditLogs from "../pages/admin/AuditLogs.jsx";

import ClientDashboard from "../pages/client/Dashboard.jsx";
import Developers from "../pages/client/Developers.jsx";
import MyAccounts from "../pages/client/MyAccounts.jsx";
import ClientFinancialActions from "../pages/client/FinancialActions.jsx";

import ATMHome from "../pages/atm/ATMHome.jsx";
import ATMFinancialActions from "../pages/atm/FinancialActions.jsx";
import History from "../pages/atm/History.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/atm-login" element={<ATMLogin />} />

      <Route element={<MainLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/clients" element={<Clients />} />
        <Route path="/admin/create-account" element={<CreateAccount />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />

        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/client/developers" element={<Developers />} />
        <Route path="/client/accounts" element={<MyAccounts />} />
        <Route path="/client/actions" element={<ClientFinancialActions />} />
      </Route>

      <Route element={<ATMLayout />}>
        <Route path="/atm" element={<ATMHome />} />
        <Route path="/atm/actions" element={<ATMFinancialActions />} />
        <Route path="/atm/history" element={<History />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
