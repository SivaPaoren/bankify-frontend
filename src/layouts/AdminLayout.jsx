import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/BankifyLogo.png';
import {
    LayoutDashboard,
    Users,
    Shield,
    LogOut,
    Menu,
    ChevronLeft,
    Bell,
    Search,
    FileText,
    Wallet,
    History,
    ChevronRight,
    Key,
    BookOpen
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

    const getPageTitle = () => {
        const path = location.pathname.split("/").pop();
        if (!path || path === 'admin') return "Dashboard";
        return path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const navItems = [
        { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/clients', label: 'API Clients', icon: Shield },
        { to: '/admin/approvals', label: 'Security Approvals', icon: Key },
        { to: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
        { to: '/admin/transactions', label: 'Transactions', icon: History },
        { to: '/admin/ledger', label: 'Master Ledger', icon: BookOpen },
        { to: '/admin/accounts', label: 'Accounts', icon: Wallet },
        { to: '/admin/customers', label: 'Customers', icon: Users },
    ];

    const navLinkClass = ({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden
     ${isActive
            ? "bg-primary-600 text-white shadow-lg shadow-primary-900/20"
            : "text-primary-200 hover:bg-white/5 hover:text-white"
        }`;

    return (
        <div className="flex h-screen bg-primary-950 text-slate-100 font-sans overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px]"></div>
            </div>

            {/* Sidebar - Distinct Darker Navy/Slate */}
            <aside
                className={`bg-[#020617] border-r border-white/5 relative z-20 flex flex-col
                ${collapsed ? "w-20" : "w-72"} transition-all duration-300 ease-out shadow-2xl`}
            >
                <div className="h-24 flex items-center px-6 border-b border-white/5 bg-[#0b1121]">
                    <div className={`flex items-center gap-4 overflow-hidden transition-all ${collapsed ? 'justify-center w-full' : ''}`}>
                        <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-primary-600/20 rounded-xl border border-primary-500/30 shadow-inner">
                            <img src={logo} alt="Bankify" className="w-6 h-6 object-contain invert brightness-0 filter drop-shadow-lg" />
                        </div>
                        {!collapsed && (
                            <div className="opacity-100 transition-opacity duration-300">
                                <h1 className="text-2xl font-bold tracking-tight text-white">Bankify</h1>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                    <p className="text-[10px] text-cyan-400/80 uppercase tracking-widest font-bold">Admin Console</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2 custom-scrollbar">
                    {!collapsed && (
                        <p className="px-4 mb-4 text-[10px] font-bold uppercase tracking-widest text-primary-400/60">
                            Main Menu
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
                                {({ isActive }) => (
                                    <>
                                        <item.icon size={20} className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-primary-400 group-hover:text-cyan-300'}`} />
                                        {!collapsed && <span className="tracking-wide">{item.label}</span>}
                                        {isActive && !collapsed && (
                                            <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-sm">
                    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all border border-white/5 hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-primary-600 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg ring-2 ring-white/10">
                            {user?.email?.[0]?.toUpperCase() || 'A'}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{user?.email || 'Administrator'}</p>
                                <p className="text-xs text-primary-300 truncate">Super User Access</p>
                            </div>
                        )}
                        {!collapsed && (
                            <button onClick={handleLogout} className="text-primary-400 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg">
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>
                    {collapsed && (
                        <button onClick={handleLogout} className="mt-3 w-full flex justify-center p-3 text-primary-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all">
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-primary-950/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-2.5 rounded-xl text-primary-300 hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-white/10 shrink-0"
                        >
                            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                        </button>
                        <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block"></div>
                        <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight drop-shadow-sm truncate">{getPageTitle()}</h2>
                    </div>

                    <div className="flex items-center gap-5">
                        {/* Search */}
                        <div className="hidden md:flex items-center gap-3 bg-black/20 px-4 py-2.5 rounded-xl border border-white/5 focus-within:border-primary-500 focus-within:bg-black/40 transition-all w-72 group backdrop-blur-sm shadow-inner">
                            <Search size={18} className="text-primary-400 group-focus-within:text-primary-300" />
                            <input
                                type="text"
                                placeholder="Search system..."
                                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-primary-500/50 text-primary-100"
                            />
                        </div>

                        <div className="h-8 w-px bg-white/10 mx-2"></div>

                        <button className="relative p-2.5 text-primary-300 hover:bg-white/5 rounded-full transition-all hover:text-cyan-400 border border-transparent hover:border-white/10">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"></span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-8 animate-page">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
