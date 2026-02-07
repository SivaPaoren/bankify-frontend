import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Shield,
    LogOut,
    Menu,
    ChevronLeft,
    Bell,
    Search,
    FileText,
    Wallet,
    Building2
} from 'lucide-react';

export default function AdminLayout() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper for simple title based on route
    const getPageTitle = () => {
        const path = location.pathname.split("/").pop();
        if (!path || path === 'admin') return "Dashboard";
        return path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");
    };

    const navItems = [
        { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/clients', label: 'API Clients', icon: Shield },
        { to: '/admin/customers', label: 'Customers', icon: Users },
        { to: '/admin/accounts', label: 'Accounts', icon: Wallet },
        { to: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
    ];

    const navLinkClass = ({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden
     ${isActive
            ? "bg-emerald-500/10 text-emerald-400 shadow-inner"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
        }`;

    return (
        <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
            {/* Sidebar - Dark Mode for Contrast */}
            <aside
                className={`bg-slate-950 text-white flex flex-col border-r border-slate-800 relative z-20 
                ${collapsed ? "w-20" : "w-64"} transition-all duration-300 ease-in-out shadow-xl`}
            >
                {/* Brand */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
                    <div className={`flex items-center gap-3 overflow-hidden transition-all ${collapsed ? 'justify-center w-full' : ''}`}>
                        <div className="bg-emerald-500 p-1.5 rounded-lg shrink-0 shadow-lg shadow-emerald-500/20">
                            <Building2 size={24} className="text-white" />
                        </div>
                        {!collapsed && (
                            <div className="opacity-100 transition-opacity duration-300">
                                <h1 className="text-xl font-bold tracking-tight text-white">Bankify<span className="text-emerald-500">.</span></h1>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Portal</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                    {!collapsed && (
                        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                            Management
                        </p>
                    )}
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={navLinkClass}
                            >
                                <item.icon size={20} className={({ isActive }) => isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'} />
                                {!collapsed && <span>{item.label}</span>}
                                {collapsed && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-800/90 text-xs font-bold transition-opacity">{item.label[0]}</div>}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
                    <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${collapsed ? 'justify-center' : 'bg-slate-800/30'}`}>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg border border-slate-700">
                            {user?.email?.[0]?.toUpperCase() || 'A'}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate">{user?.email || 'Administrator'}</p>
                                <p className="text-xs text-slate-500 truncate">Super User</p>
                            </div>
                        )}
                        {!collapsed && (
                            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg">
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                    {collapsed && (
                        <button onClick={handleLogout} className="mt-2 w-full flex justify-center p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                        </button>
                        <div className="hidden md:block h-6 w-px bg-slate-200 mx-2"></div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{getPageTitle()}</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="hidden md:flex items-center gap-2 bg-slate-100/50 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-all w-64 group">
                            <Search size={16} className="text-slate-400 group-focus-within:text-emerald-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700"
                            />
                        </div>
                        <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors hover:text-emerald-600">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-6 animate-page">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
