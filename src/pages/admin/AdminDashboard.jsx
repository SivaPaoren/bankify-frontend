import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import {
    Users,
    ArrowUpRight,
    ArrowDownLeft,
    Activity,
    AlertTriangle,
    Wallet
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        activeCustomers: 0,
        totalBalance: 2450000.00, // Mocked for now
        todayTransactions: 142,
        failedTransactions: 3
    });

    useEffect(() => {
        // Fetch real customer count
        adminService.getCustomers().then(data => {
            const count = Array.isArray(data) ? data.length : (data.content?.length || 0);
            setStats(prev => ({ ...prev, activeCustomers: count }));
        }).catch(console.error);
    }, []);

    // Mock Chart Data
    const chartData = [
        { name: '08:00', volume: 4000 },
        { name: '10:00', volume: 3000 },
        { name: '12:00', volume: 9800 },
        { name: '14:00', volume: 3908 },
        { name: '16:00', volume: 4800 },
        { name: '18:00', volume: 7800 },
        { name: '20:00', volume: 4300 },
    ];

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass, trend }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={64} className="text-slate-900" />
            </div>
            <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <div className={`p-1 rounded-full ${colorClass} bg-opacity-10`}>
                    <Icon size={14} className={colorClass.replace('bg-', 'text-')} />
                </div>
                <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {subtext}
                </span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
                <p className="text-slate-500">Real-time monitoring of Bankify infrastructure.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Customers"
                    value={stats.activeCustomers}
                    subtext="+12% from last month"
                    icon={Users}
                    colorClass="text-blue-600"
                    trend="up"
                />
                <StatCard
                    title="System Balance"
                    value={`฿${stats.totalBalance.toLocaleString()}`}
                    subtext="Total liquidity"
                    icon={Wallet}
                    colorClass="text-emerald-600"
                    trend="up"
                />
                <StatCard
                    title="Transactions (24h)"
                    value={stats.todayTransactions}
                    subtext="98.2% Success Rate"
                    icon={Activity}
                    colorClass="text-indigo-600"
                    trend="up"
                />
                <StatCard
                    title="Failed Alerts"
                    value={stats.failedTransactions}
                    subtext="Requires attention"
                    icon={AlertTriangle}
                    colorClass="text-orange-500"
                    trend="down"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Transaction Volume</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: 'none' }}
                                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pending Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Pending Actions</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
                                <div className="mt-1 p-1.5 rounded-full bg-orange-100 text-orange-600">
                                    <AlertTriangle size={14} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Suspicious Login Attempt</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Account #8822-11 · just now</p>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
                            <div className="mt-1 p-1.5 rounded-full bg-blue-100 text-blue-600">
                                <Activity size={14} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">High Volume Transfer</p>
                                <p className="text-xs text-slate-500 mt-0.5">Client API · 2 mins ago</p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
                        View All Alerts
                    </button>
                </div>
            </div>
        </div>
    );
}
