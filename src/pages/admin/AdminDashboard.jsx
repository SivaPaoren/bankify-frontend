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
    ShieldAlert,
    Key
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
        totalBalance: 0,
        todayTransactions: 0,
        failedTransactions: 0
    });
    const [transactionVolData, setTransactionVolData] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [timeframe, setTimeframe] = useState('24h');
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [pendingActions, setPendingActions] = useState([]);

    useEffect(() => {
        adminService.getCustomers().then(data => {
            const count = Array.isArray(data) ? data.length : (data.content?.length || 0);
            setStats(prev => ({ ...prev, activeCustomers: count }));
        }).catch(console.error);

        // Fetch Live Accounts to compute "Liquid Assets"
        adminService.getAccounts().then(data => {
            const accs = Array.isArray(data) ? data : (data.content || []);
            const liquid = accs.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
            setStats(prev => ({ ...prev, totalBalance: liquid }));
        }).catch(console.error);

        // Fetch Live Transactions to compute 24h Volume and Chart
        adminService.getTransactions().then(data => {
            const txs = Array.isArray(data) ? data : (data.content || []);
            setAllTransactions(txs);

            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

            // Filter last 24h transactions for the Top Stat Card
            const recentTxs = txs.filter(tx => new Date(tx.createdAt) >= oneDayAgo);
            setStats(prev => ({ ...prev, todayTransactions: recentTxs.length }));
        }).catch(console.error);

        // Pull recent non-user security-relevant events from audit logs
        adminService.getAuditLogs().then(data => {
            const logs = Array.isArray(data) ? data : (data.content || []);
            if (!logs.length) return;
            // Track failures for Top Stats
            const failures = logs.filter(l => l.action?.includes('FAIL') || l.action?.includes('ERROR'));
            setStats(prev => ({ ...prev, failedTransactions: failures.length }));

            const alerts = logs
                .filter(l => l.actorType !== 'USER' || l.action?.includes('FAIL') || l.action?.includes('FREEZE') || l.action?.includes('CLOSE'))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3);
            setRecentAlerts(alerts);
        }).catch(console.error);

        // Fetch pending actions (Partner Apps + Rotations)
        Promise.all([
            adminService.getClients(),
            adminService.listRotationRequests()
        ]).then(([clientsData, rotationsData]) => {
            const clientList = Array.isArray(clientsData) ? clientsData : (clientsData.content || []);
            const pendingCl = clientList.filter(c => c.status === 'PENDING').map(c => ({
                id: c.id,
                title: 'New Partner App',
                desc: c.name,
                type: 'app'
            }));
            const rots = Array.isArray(rotationsData) ? rotationsData : [];
            const pendingRot = rots.map(r => ({
                id: r.id,
                title: 'Key Rotation Request',
                desc: `App ID: ${String(r.partnerAppId).substring(0, 8)}`,
                type: 'key'
            }));
            setPendingActions([...pendingCl, ...pendingRot]);
        }).catch(console.error);
    }, []);

    // Watch for timeframe changes and recalculate chart data
    useEffect(() => {
        if (!allTransactions.length) {
            setTransactionVolData([]);
            return;
        }

        const now = new Date();

        if (timeframe === '24h') {
            const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            const recentTxs = allTransactions.filter(tx => new Date(tx.createdAt) >= oneDayAgo);

            const hourlyBlocks = { '00:00': 0, '04:00': 0, '08:00': 0, '12:00': 0, '16:00': 0, '20:00': 0 };
            recentTxs.forEach(tx => {
                const h = new Date(tx.createdAt).getHours();
                if (h >= 0 && h < 4) hourlyBlocks['00:00']++;
                else if (h >= 4 && h < 8) hourlyBlocks['04:00']++;
                else if (h >= 8 && h < 12) hourlyBlocks['08:00']++;
                else if (h >= 12 && h < 16) hourlyBlocks['12:00']++;
                else if (h >= 16 && h < 20) hourlyBlocks['16:00']++;
                else hourlyBlocks['20:00']++;
            });

            const dynamicChart = Object.keys(hourlyBlocks).map(timeKey => ({
                name: timeKey,
                volume: hourlyBlocks[timeKey]
            }));
            dynamicChart.push({ name: '23:59', volume: hourlyBlocks['20:00'] });
            setTransactionVolData(dynamicChart);

        } else if (timeframe === '7d') {
            const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            const recentTxs = allTransactions.filter(tx => new Date(tx.createdAt) >= sevenDaysAgo);

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dailyBlocks = {};
            days.forEach(d => dailyBlocks[d] = 0);

            recentTxs.forEach(tx => {
                const dayName = days[new Date(tx.createdAt).getDay()];
                dailyBlocks[dayName]++;
            });

            const dynamicChart = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
                const dayName = days[d.getDay()];
                dynamicChart.push({
                    name: dayName,
                    volume: dailyBlocks[dayName]
                });
            }
            setTransactionVolData(dynamicChart);
        }
    }, [allTransactions, timeframe]);

    // Dynamic Chart Data (Fallback to zeros if none yet)
    const chartData = transactionVolData.length > 0 ? transactionVolData : [
        { name: '00:00', volume: 0 }, { name: '04:00', volume: 0 }, { name: '08:00', volume: 0 },
        { name: '12:00', volume: 0 }, { name: '16:00', volume: 0 }, { name: '20:00', volume: 0 },
        { name: '23:59', volume: 0 }
    ];

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass, trend, linkTo }) => (
        <div
            onClick={() => linkTo && navigate(linkTo)}
            className={`relative overflow-hidden p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-300 group shadow-lg ${linkTo ? 'hover:bg-white/10 cursor-pointer active:scale-95' : ''}`}
        >
            {/* Glow Effect */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${colorClass.replace('text-', 'bg-')}/20 blur-2xl group-hover:blur-3xl transition-all`}></div>

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-primary-200 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1 group-hover:text-white transition-colors">
                        {title}
                        {linkTo && <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${colorClass.replace('text-', 'bg-')}/20 border border-white/5`}>
                    <Icon size={24} className={colorClass} />
                </div>
            </div>

            <div className="relative z-10 flex items-center gap-2 mt-4">
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : trend === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-primary-500/20 text-primary-400'}`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : trend === 'down' ? <ArrowDownRight size={14} /> : <Activity size={14} />}
                    <span>Live</span>
                </div>
                <span className="text-xs text-primary-400 font-medium">
                    {subtext}
                </span>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Active Customers"
                    value={stats.activeCustomers}
                    subtext="Real-time network count"
                    icon={Users}
                    colorClass="text-cyan-400"
                    trend="up"
                    linkTo="/admin/customers"
                />
                <StatCard
                    title="Liquid Assets"
                    value={`$${(stats.totalBalance).toLocaleString()}`}
                    subtext="Sum of all user ledgers"
                    icon={Wallet}
                    colorClass="text-emerald-400"
                    trend="up"
                    linkTo="/admin/accounts"
                />
                <StatCard
                    title="24h Transactions"
                    value={stats.todayTransactions}
                    subtext="Last 24 hours throughput"
                    icon={Activity}
                    colorClass="text-primary-400"
                    trend="neutral"
                    linkTo="/admin/transactions"
                />
                <StatCard
                    title="Security Alerts"
                    value={stats.failedTransactions}
                    subtext="Requires triage"
                    icon={AlertTriangle}
                    colorClass="text-orange-400"
                    trend={stats.failedTransactions > 0 ? 'down' : 'up'}
                    linkTo="/admin/audit-logs"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl relative overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-4 relative z-10 shrink-0">
                        <div>
                            <h3 className="text-lg font-bold text-white">Transaction Volume</h3>
                            <p className="text-sm text-primary-300">Inbound and outbound api calls</p>
                        </div>
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="bg-black/20 text-primary-200 text-sm border border-white/10 rounded-lg px-3 py-1.5 outline-none focus:border-primary-500 cursor-pointer"
                        >
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                        </select>
                    </div>

                    <div className="flex-1 w-full relative z-10 min-h-[200px] -ml-2">
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

                {/* Right Column Stack */}
                <div className="flex flex-col gap-4">
                    {/* Pending Actions Widget */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Key size={20} className="text-amber-400" />
                                Pending Actions
                            </h3>
                            {pendingActions.length > 0 && (
                                <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                    {pendingActions.length}
                                </span>
                            )}
                        </div>
                        {pendingActions.length === 0 ? (
                            <div className="py-6 text-center text-primary-500 text-sm italic">System clear. No pending approvals.</div>
                        ) : (
                            <div className="space-y-3">
                                {pendingActions.slice(0, 3).map((action, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => navigate('/admin/clients')}>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{action.title}</p>
                                            <p className="text-xs text-primary-400 font-mono mt-0.5">{action.desc}</p>
                                        </div>
                                        <div className="text-cyan-400 bg-cyan-500/10 p-1.5 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                                            <ArrowUpRight size={16} />
                                        </div>
                                    </div>
                                ))}
                                {pendingActions.length > 3 && (
                                    <button onClick={() => navigate('/admin/clients')} className="w-full text-xs text-primary-300 hover:text-white pt-2 font-bold tracking-wider">
                                        + {pendingActions.length - 3} MORE ACTIONS
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recent Security Events from real audit log */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl flex flex-col flex-1">
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
        </div>
    );
}
