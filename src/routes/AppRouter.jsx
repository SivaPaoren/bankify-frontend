import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout.jsx";
import ATMLayout from "../layouts/ATMLayout.jsx";

/* Auth */
import LoginPage from "../pages/auth/LoginPage.jsx";
import ATMLogin from "../pages/auth/ATMLogin.jsx";

/* Admin */
import AdminDashboard from "../pages/admin/Dashboard.jsx";
import Clients from "../pages/admin/Clients.jsx";
import CreateAccount from "../pages/admin/CreateAccount.jsx";
import AuditLogs from "../pages/admin/AuditLogs.jsx";

/* Client */
import ClientDashboard from "../pages/client/Dashboard.jsx";
import Developers from "../pages/client/Developers.jsx";
import MyAccounts from "../pages/client/MyAccounts.jsx";
import ClientFinancialActions from "../pages/client/FinancialActions.jsx";

/* ATM */
import ATMHome from "../pages/atm/ATMHome.jsx";
import ATMDeposit from "../pages/atm/ATMDeposit.jsx";
import ATMWithdraw from "../pages/atm/ATMWithdraw.jsx";
import ATMTransfer from "../pages/atm/ATMTransfer.jsx";
import History from "../pages/atm/History.jsx";

export default function AppRouter() {
  return (
    <Routes>
      {/* Login pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/atm-login" element={<ATMLogin />} />

      {/* Admin + Client layout */}
      <Route element={<MainLayout />}>
        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/clients" element={<Clients />} />
        <Route path="/admin/create-account" element={<CreateAccount />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />

        {/* Client */}
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/client/developers" element={<Developers />} />
        <Route path="/client/accounts" element={<MyAccounts />} />
        <Route path="/client/actions" element={<ClientFinancialActions />} />
      </Route>

      {/* ATM layout */}
      <Route element={<ATMLayout />}>
        <Route path="/atm" element={<ATMHome />} />
        <Route path="/atm/deposit" element={<ATMDeposit />} />
        <Route path="/atm/withdraw" element={<ATMWithdraw />} />
        <Route path="/atm/transfer" element={<ATMTransfer />} />
        <Route path="/atm/history" element={<History />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
