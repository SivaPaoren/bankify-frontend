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
import WithdrawPage from "./pages/atm/Withdraw.jsx";
import TransferPage from "./pages/atm/Transfer.jsx";
import HistoryPage from "./pages/atm/History.jsx";




// Admin pages
import ClientsPage from "./pages/admin/Clients.jsx";
import CreateClientPage from "./pages/admin/CreateClient.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
        <Route path="/developers" element={<DevelopersPage />} />
        <Route path="/atm/withdraw" element={<WithdrawPage />} />
        <Route path="/atm/transfer" element={<TransferPage />} />
        <Route path="/atm/history" element={<HistoryPage />} />


        {/* Admin */}
        <Route path="/admin/clients" element={<ClientsPage />} />
        <Route path="/admin/clients/create" element={<CreateClientPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}