// src/layouts/MainLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  FileText,
  Code2,
  KeyRound,
  LogOut,
  Menu,
} from "lucide-react";

/* Tooltip helper */
function Tooltip({ label, collapsed, children }) {
  if (!collapsed) return children;

  return (
    <div className="relative group">
      {children}
      <div
        className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2
                   ml-3 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1
                   text-xs text-white opacity-0 shadow
                   group-hover:opacity-100 transition"
      >
        {label}
      </div>
    </div>
  );
}

export default function MainLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition
     ${
       isActive
         ? "bg-slate-800 text-white"
         : "text-slate-300 hover:bg-slate-800 hover:text-white"
     }`;

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`bg-slate-900 text-slate-100 flex flex-col shadow-lg
          ${collapsed ? "w-20" : "w-64"} transition-all duration-300`}
      >
        {/* Brand / Toggle */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold">Bankify</h1>
              <p className="text-xs text-slate-400">Admin + Client Console</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-slate-800 transition"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-4">
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-4 mb-2 text-xs uppercase tracking-wide text-slate-400">
                Admin
              </p>
            )}
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              <Tooltip label="Dashboard" collapsed={collapsed}>
                <LayoutDashboard size={18} />
              </Tooltip>
              {!collapsed && "Dashboard"}
            </NavLink>
            <NavLink to="/admin/clients" className={navLinkClass}>
              <Tooltip label="Clients" collapsed={collapsed}>
                <KeyRound size={18} />
              </Tooltip>
              {!collapsed && "Clients"}
            </NavLink>
            <NavLink to="/admin/create-account" className={navLinkClass}>
              <Tooltip label="Create Account" collapsed={collapsed}>
                <Wallet size={18} />
              </Tooltip>
              {!collapsed && "Create Account"}
            </NavLink>
            <NavLink to="/admin/audit-logs" className={navLinkClass}>
              <Tooltip label="Audit Logs" collapsed={collapsed}>
                <FileText size={18} />
              </Tooltip>
              {!collapsed && "Audit Logs"}
            </NavLink>
          </div>

          <div className="space-y-1 pt-4 border-t border-slate-800">
            {!collapsed && (
              <p className="px-4 mb-2 text-xs uppercase tracking-wide text-slate-400">
                Client
              </p>
            )}
            <NavLink to="/client/dashboard" className={navLinkClass}>
              <Tooltip label="Dashboard" collapsed={collapsed}>
                <LayoutDashboard size={18} />
              </Tooltip>
              {!collapsed && "Dashboard"}
            </NavLink>
            <NavLink to="/client/accounts" className={navLinkClass}>
              <Tooltip label="My Accounts" collapsed={collapsed}>
                <Wallet size={18} />
              </Tooltip>
              {!collapsed && "My Accounts"}
            </NavLink>
            <NavLink to="/client/actions" className={navLinkClass}>
              <Tooltip label="Financial Actions" collapsed={collapsed}>
                <CreditCard size={18} />
              </Tooltip>
              {!collapsed && "Financial Actions"}
            </NavLink>
            <NavLink to="/client/developers" className={navLinkClass}>
              <Tooltip label="Developers" collapsed={collapsed}>
                <Code2 size={18} />
              </Tooltip>
              {!collapsed && "Developers"}
            </NavLink>
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg
                       text-sm font-medium bg-slate-800 text-slate-200
                       hover:bg-slate-700 hover:text-white transition"
          >
            <Tooltip label="Logout" collapsed={collapsed}>
              <LogOut size={18} />
            </Tooltip>
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold">Bankify Console</h2>
          <div className="text-sm text-slate-600">
            Logged in as <span className="font-medium">Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
