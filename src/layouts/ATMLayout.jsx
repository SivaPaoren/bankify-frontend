// src/layouts/ATMLayout.jsx
import { NavLink, Outlet } from "react-router-dom";

export default function ATMLayout() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition
     ${
       isActive
         ? "bg-slate-900 text-white"
         : "text-slate-700 hover:bg-slate-200"
     }`;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-900">
          Bankify ATM
        </h1>
        <p className="text-xs text-slate-500">
          Self-service banking
        </p>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex gap-2">
        <NavLink to="/atm/deposit" className={linkClass}>
          Deposit
        </NavLink>
        <NavLink to="/atm/withdraw" className={linkClass}>
          Withdraw
        </NavLink>
        <NavLink to="/atm/transfer" className={linkClass}>
          Transfer
        </NavLink>
        <NavLink to="/atm/history" className={linkClass}>
          History
        </NavLink>
      </nav>

      {/* Page content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
