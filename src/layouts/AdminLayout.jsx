import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CreditCard, Shield, LogOut } from 'lucide-react';

export default function AdminLayout() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
        { to: '/admin/clients', label: 'API Clients', icon: Shield },
        { to: '/admin/customers', label: 'Customers', icon: Users },
        { to: '/admin/accounts', label: 'Accounts', icon: CreditCard },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-primary-950 text-white flex flex-col">
                <div className="p-6 border-b border-primary-900">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center font-bold text-white">
                            B
                        </div>
                        <span className="font-bold text-lg tracking-tight">Bankify Admin</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary-800 text-electric-blue'
                                    : 'text-slate-400 hover:text-white hover:bg-primary-900'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-primary-900">
                    <div className="px-4 py-3 mb-2">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Logged in as</p>
                        <p className="text-sm font-medium text-white truncate">{user?.email || 'Admin'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 w-full text-slate-400 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
