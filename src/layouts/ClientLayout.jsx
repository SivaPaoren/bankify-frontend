import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    CreditCard,
    Code2,
    LogOut,
    Wallet,
    Menu,
    ChevronLeft,
    Bell,
    Building2
} from 'lucide-react';

export default function ClientLayout() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/client', end: true, label: 'Dashboard', icon: LayoutDashboard },
        { to: '/client/actions', label: 'Financial Actions', icon: CreditCard },
        { to: '/client/developers', label: 'Developer API', icon: Code2 },
    ];

    const navLinkClass = ({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden
     ${isActive
            ? "bg-emerald-500/10 text-emerald-400 shadow-inner"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
        }`;

    return (
        <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
            {/* Sidebar */}
            <aside
                className={`bg-slate-950 text-white flex flex-col border-r border-slate-800 relative z-20 
                ${collapsed ? "w-20" : "w-64"} transition-all duration-300 ease-in-out shadow-xl`}
            >
                {/* Brand */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
                    <div className={`flex items-center gap-3 overflow-hidden transition-all ${collapsed ? 'justify-center w-full' : ''}`}>
                        <div className="bg-emerald-500 p-1.5 rounded-lg shrink-0 shadow-lg shadow-emerald-500/20">
                            <Wallet size={24} className="text-white" />
                        </div>
                        {!collapsed && (
                            <div className="opacity-100 transition-opacity duration-300">
                                <h1 className="text-xl font-bold tracking-tight text-white">Bankify<span className="text-emerald-500">.</span></h1>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Business Portal</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                    {!collapsed && (
                        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                            Workspace
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
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
                    <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${collapsed ? 'justify-center' : 'bg-slate-800/30'}`}>
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg border border-slate-600">
                            {user?.email?.[0]?.toUpperCase() || 'C'}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate">{user?.email || 'Client'}</p>
                                <p className="text-xs text-slate-500 truncate">Business Account</p>
                            </div>
                        )}
                        {!collapsed && (
                            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg">
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50">
                <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-6 animate-page">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
