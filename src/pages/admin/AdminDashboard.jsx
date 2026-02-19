import React, { useEffect, useState } from 'react';
import { adminService } from '../../api';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Activity,
    AlertTriangle,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    ShieldAlert
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeCustomers: 0,
        totalBalance: 2450000.00,
        todayTransactions: 142,
        failedTransactions: 3
    });
    const [recentAlerts, setRecentAlerts] = useState([]);

    useEffect(() => {
        adminService.getCustomers().then(data => {
            const count = Array.isArray(data) ? data.length : (data.content?.length || 0);
            setStats(prev => ({ ...prev, activeCustomers: count }));
        }).catch(console.error);

        // Pull recent non-user security-relevant events from audit logs
        adminService.getAuditLogs().then(data => {
            if (!Array.isArray(data)) return;
            const alerts = data
                .filter(l => l.actorType !== 'USER' || l.action?.includes('FAIL') || l.action?.includes('FREEZE') || l.action?.includes('CLOSE'))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
            setRecentAlerts(alerts);
        }).catch(console.error);
    }, []);

    // Mock Chart Data - adjusted for a more "crypto/fintech" look
    const chartData = [
        { name: '00:00', volume: 4000 },
        { name: '04:00', volume: 3000 },
        { name: '08:00', volume: 5000 },
        { name: '12:00', volume: 8800 },
        { name: '16:00', volume: 6900 },
        { name: '20:00', volume: 9200 },
        { name: '23:59', volume: 7800 },
    ];

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass, trend }) => (
        <div className="relative overflow-hidden p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group shadow-lg">
            {/* Glow Effect */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${colorClass.replace('text-', 'bg-')}/20 blur-2xl group-hover:blur-3xl transition-all`}></div>

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-primary-200 text-xs font-bold uppercase tracking-widest mb-2">{title}</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${colorClass.replace('text-', 'bg-')}/20 border border-white/5`}>
                    <Icon size={24} className={colorClass} />
                </div>
            </div>

            <div className="relative z-10 flex items-center gap-2 mt-4">
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span>12.5%</span>
                </div>
                <span className="text-xs text-primary-400 font-medium">
                    {subtext}
                </span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
                    <p className="text-primary-300 mt-1">Real-time monitoring of Bankify global infrastructure.</p>
                </div>
                <div className="flex items-center gap-2 text-primary-300 text-sm font-mono bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Systems Operational
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Customers"
                    value={stats.activeCustomers}
                    subtext="vs last month"
                    icon={Users}
                    colorClass="text-cyan-400"
                    trend="up"
                />
                <StatCard
                    title="Liquid Assets"
                    value={`฿${(stats.totalBalance / 1000000).toFixed(1)}M`}
                    subtext="Total reserve"
                    icon={Wallet}
                    colorClass="text-emerald-400"
                    trend="up"
                />
                <StatCard
                    title="24h Transactions"
                    value={stats.todayTransactions}
                    subtext="98.2% Success"
                    icon={Activity}
                    colorClass="text-primary-400"
                    trend="up"
                />
                <StatCard
                    title="Security Alerts"
                    value={stats.failedTransactions}
                    subtext="Requires triage"
                    icon={AlertTriangle}
                    colorClass="text-orange-400"
                    trend="down"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-lg font-bold text-white">Transaction Volume</h3>
                            <p className="text-sm text-primary-300">Inbound and outbound api calls</p>
                        </div>
                        <select className="bg-black/20 text-primary-200 text-sm border border-white/10 rounded-lg px-3 py-1.5 outline-none focus:border-primary-500">
                            <option>Last 24 Hours</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>

                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#bae6fd' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="volume"
                                    stroke="#06b6d4"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVol)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Security Events from real audit log */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <ShieldAlert size={20} className="text-orange-400" />
                        Recent Security Events
                    </h3>
                    <p className="text-xs text-primary-400 mb-5">System & partner actions · live from audit log</p>

                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                        {recentAlerts.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-8 text-primary-500">
                                <ShieldAlert size={28} className="mb-2 opacity-40" />
                                <p className="text-sm">No recent alerts</p>
                            </div>
                        ) : (
                            recentAlerts.map((event, i) => {
                                const isError = event.action?.includes('FAIL') || event.action?.includes('ERROR');
                                const relTime = event.createdAt
                                    ? (() => {
                                        const diff = Date.now() - new Date(event.createdAt);
                                        const mins = Math.floor(diff / 60000);
                                        const hrs = Math.floor(diff / 3600000);
                                        if (mins < 60) return `${mins}m ago`;
                                        if (hrs < 24) return `${hrs}h ago`;
                                        return new Date(event.createdAt).toLocaleDateString();
                                    })()
                                    : '—';
                                return (
                                    <div
                                        key={event.id ?? i}
                                        onClick={() => navigate('/admin/audit-logs')}
                                        className="group flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
                                    >
                                        <div className={`mt-0.5 p-2 rounded-xl border group-hover:scale-110 transition-transform ${isError
                                            ? 'bg-red-500/10 text-red-400 border-red-500/10'
                                            : 'bg-orange-500/10 text-orange-400 border-orange-500/10'
                                            }`}>
                                            <AlertTriangle size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors truncate">
                                                {event.action?.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-xs text-primary-300 mt-0.5 truncate">
                                                {event.actorType} · {event.actorId ?? '—'}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-primary-400 font-mono">
                                                <Clock size={9} />
                                                <span>{relTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/admin/audit-logs')}
                        className="w-full mt-5 py-3 rounded-xl border border-white/10 text-primary-200 text-sm font-bold hover:bg-white/5 hover:text-white transition-all shadow-lg"
                    >
                        View All Audit Logs
                    </button>
                </div>
            </div>
        </div>
    );
}
