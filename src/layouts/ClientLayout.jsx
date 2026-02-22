import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/BankifyWhiteLogo.png';
import {
    LayoutDashboard,
    Code2,
    LogOut,
    Menu,
    ChevronLeft,
    Bell,
    Zap
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

    const getPageTitle = () => {
        const path = location.pathname.split('/').pop();
        if (!path || path === 'client') return 'Dashboard';
        if (path === 'developers') return 'Developer Console';
        return 'Bankify Partner';
    };

    const navItems = [
        { to: '/client', end: true, label: 'Overview', icon: LayoutDashboard },
        { to: '/client/developers', label: 'Developer API', icon: Code2 },
    ];

    const navLinkClass = ({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
     ${isActive
            ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-100 border border-transparent'
        }`;

    return (
        <div className="flex h-screen bg-[#0d0d0f] text-white font-sans">
            {/* Sidebar */}
            <aside
                className={`bg-[#0f0f12] text-white flex flex-col border-r border-white/5 relative z-20
                ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out shadow-2xl`}
            >
                {/* Brand */}
                <div className="h-20 flex items-center px-5 border-b border-white/5">
                    <div className={`flex items-center gap-3 overflow-hidden transition-all ${collapsed ? 'justify-center w-full' : ''}`}>
                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                            <img src={logo} alt="Bankify" className="w-5 h-5 object-contain" />
                        </div>
                        {!collapsed && (
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-white">Bankify</h1>
                                <p className="text-[10px] text-orange-500/70 uppercase tracking-widest font-semibold">Partner Portal</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {!collapsed && (
                        <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                            Navigation
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
                                        <item.icon size={18} className={isActive ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'} />
                                        {!collapsed && <span>{item.label}</span>}
                                        {isActive && !collapsed && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Footer User Profile */}
                <div className="p-3 border-t border-white/5">
                    <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${collapsed ? 'justify-center' : 'bg-white/3 hover:bg-white/5'}`}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg shadow-orange-500/20">
                            {user?.email?.[0]?.toUpperCase() || 'P'}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 overflow-hidden min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user?.email || 'Partner'}</p>
                                <p className="text-[11px] text-slate-500">Partner Account</p>
                            </div>
                        )}
                        {!collapsed && (
                            <button onClick={handleLogout} className="text-slate-600 hover:text-red-400 transition-colors p-1.5 hover:bg-white/5 rounded-lg" title="Logout">
                                <LogOut size={15} />
                            </button>
                        )}
                    </div>
                    {collapsed && (
                        <button onClick={handleLogout} className="mt-2 w-full flex justify-center p-2 text-slate-600 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors">
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 bg-[#0f0f12] border-b border-white/5 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                        </button>
                        <div className="hidden md:block h-5 w-px bg-white/10 mx-1" />
                        <h2 className="text-base font-bold text-white tracking-tight">{getPageTitle()}</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-8 px-3 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                            <Zap size={12} className="animate-pulse" />
                            Live
                        </div>
                        <button className="relative p-2 text-slate-500 hover:bg-white/5 rounded-lg transition-colors hover:text-orange-400">
                            <Bell size={18} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-[#0d0d0f]">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
