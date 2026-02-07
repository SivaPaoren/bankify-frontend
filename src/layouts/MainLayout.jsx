// src/layouts/MainLayout.jsx
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
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
  Bell,
  Search,
  ChevronLeft,
  Building2 // Added for Logo
} from "lucide-react";

/* Tooltip helper (Unchanged functionality, slight styling tweak) */
function Tooltip({ label, collapsed, children }) {
  if (!collapsed) return children;

  return (
    <div className="relative group">
      {children}
      <div
        className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2
                   ml-3 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5
                   text-xs font-semibold text-white opacity-0 shadow-xl
                   group-hover:opacity-100 transition-opacity z-50"
      >
        {label}
        {/* Little triangle pointer */}
        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
      </div>
    </div>
  );
}

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    navigate("/login");
  };

  // Helper to determine Title based on path (Optional, for Header)
  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    if (!path) return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");
  };

  const navLinkClass = ({ isActive }) =>
    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
     ${
       isActive
         ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-900/20"
         : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
     }`;

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside
        className={`bg-slate-950 text-white flex flex-col border-r border-slate-800 relative z-20
          ${collapsed ? "w-20" : "w-72"} transition-all duration-300 ease-in-out`}
      >
        {/* Brand Section */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <div className={`flex items-center gap-3 overflow-hidden transition-all ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="bg-blue-600 p-1.5 rounded-lg shrink-0">
               <Building2 size={20} className="text-white" />
            </div>
            
            {!collapsed && (
              <div className="opacity-100 transition-opacity duration-300">
                <h1 className="text-lg font-bold tracking-tight">Bankify</h1>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Wrapper */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">
          
          {/* Admin Section */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Administration
              </p>
            )}
            <nav className="space-y-1">
                <NavLink to="/admin/dashboard" className={navLinkClass}>
                <Tooltip label="Dashboard" collapsed={collapsed}>
                    <LayoutDashboard size={20} strokeWidth={1.5} />
                </Tooltip>
                {!collapsed && "Dashboard"}
                </NavLink>
                <NavLink to="/admin/clients" className={navLinkClass}>
                <Tooltip label="Clients" collapsed={collapsed}>
                    <KeyRound size={20} strokeWidth={1.5} />
                </Tooltip>
                {!collapsed && "Clients"}
                </NavLink>
                <NavLink to="/admin/create-account" className={navLinkClass}>
                <Tooltip label="Create Account" collapsed={collapsed}>
                    <Wallet size={20} strokeWidth={1.5} />
                </Tooltip>
                {!collapsed && "Create Account"}
                </NavLink>
                <NavLink to="/admin/audit-logs" className={navLinkClass}>
                <Tooltip label="Audit Logs" collapsed={collapsed}>
                    <FileText size={20} strokeWidth={1.5} />
                </Tooltip>
                {!collapsed && "Audit Logs"}
                </NavLink>
            </nav>
          </div>

          {/* Client Section */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Client Workspace
              </p>
            )}
            <nav className="space-y-1">
                <NavLink to="/client/dashboard" className={navLinkClass}>
                <Tooltip label="Overview" collapsed={collapsed}>
                    <LayoutDashboard size={20} strokeWidth={1.5} />
                </Tooltip>
                {!collapsed && "Overview"}
                </NavLink>
                <NavLink to="/client/accounts" className={navLinkClass}>
                <Tooltip label="My Accounts" collapsed={collapsed}>
                    <Wallet size={20} strokeWidth={1.5} />
                </Tooltip>
                {!collapsed && "My Accounts"}
                </NavLink>
                <NavLink to="/client/actions" className={navLinkClass}>
                <Tooltip label="Financial Actions" collapsed={collapsed}>
                    <CreditCard size={20} strokeWidth={1.5} />
                </Tooltip>
                {!collapsed && "Financial Actions"}
                </NavLink>
                <NavLink to="/client/developers" className={navLinkClass}>
                <Tooltip label="Developers" collapsed={collapsed}>
                    <Code2 size={20} strokeWidth={1.5} />
                </Tooltip>
                {!collapsed && "Developers"}
                </NavLink>
            </nav>
          </div>
        </div>

        {/* Footer / User Profile */}
        <div className="p-3 border-t border-slate-800/50 bg-slate-900/30">
            <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${collapsed ? 'justify-center' : 'bg-slate-800/50'}`}>
                {/* Avatar Placeholder */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    AD
                </div>
                {!collapsed && (
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Admin User</p>
                        <p className="text-xs text-slate-400 truncate">admin@bankify.com</p>
                    </div>
                )}
                {!collapsed && (
                    <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors">
                        <LogOut size={16} />
                    </button>
                )}
            </div>
            {collapsed && (
                <button onClick={handleLogout} className="mt-2 w-full flex justify-center p-2 text-slate-400 hover:text-white">
                     <LogOut size={18} />
                </button>
            )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                >
                    {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
                
                {/* Breadcrumb / Title */}
                <div className="hidden md:block h-6 w-px bg-slate-300 mx-2"></div>
                <h2 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h2>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all w-64">
                    <Search size={16} className="text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
                    />
                </div>

                <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}