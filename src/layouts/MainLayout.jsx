// src/layouts/MainLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navLinkClasses = ({ isActive }) =>
  `block px-4 py-2 rounded-lg text-sm font-medium transition
   ${isActive ? "bg-indigo-600 text-white" : "text-slate-200 hover:bg-indigo-500/60"}`;

export default function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // later you can clear token here
    // localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-800">
          <h1 className="text-xl font-bold">Bankify</h1>
          <p className="text-xs text-slate-400">Admin Dashboard</p>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavLink to="/dashboard" className={navLinkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/accounts" className={navLinkClasses}>
            Accounts
          </NavLink>
          <NavLink to="/transactions" className={navLinkClasses}>
            Transactions
          </NavLink>
          <NavLink to="/developers" className={navLinkClasses}>
            Developers
          </NavLink>
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold">Bankify Dashboard</h2>
          <div className="text-sm text-slate-600">
            Logged in as <span className="font-medium">Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
