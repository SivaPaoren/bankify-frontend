import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../api';
import { formatCurrency } from '../../utils/formatters';
import FilterDropdown from '../common/FilterDropdown';
import { 
    Search, ArrowUpRight, ArrowDownLeft, RefreshCw, 
    CreditCard, Clock, BookOpen, Calendar 
} from 'lucide-react';

export default function TransactionManager() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await adminService.getTransactions();
            setTransactions(Array.isArray(data) ? data : (data.content || []));
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
        if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;
        if (dateFilter && !(tx.createdAt || '').startsWith(dateFilter)) return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                tx.id?.toLowerCase().includes(term) ||
                tx.fromAccountId?.toLowerCase().includes(term) ||
                tx.toAccountId?.toLowerCase().includes(term)
            );
        }
        return true;
    });

    const stats = {
        totalVolume: filteredTransactions.filter(t => t.status === 'SUCCESS').reduce((sum, t) => sum + (t.amount || 0), 0),
        count: filteredTransactions.length,
        successCount: filteredTransactions.filter(t => t.status === 'SUCCESS').length,
        failedCount: filteredTransactions.filter(t => t.status === 'FAILED').length,
    };

    const TYPE_CHIPS = [
        { key: 'ALL', label: 'All Types' },
        { key: 'DEPOSIT', label: 'Deposits' },
        { key: 'WITHDRAWAL', label: 'Withdrawals' },
        { key: 'TRANSFER', label: 'Transfers' },
        // { key: 'PAYMENT', label: 'Payments' },
    ];

    const STATUS_CHIPS = [
        { key: 'ALL', label: 'All Status' },
        { key: 'SUCCESS', label: 'Success' },
        { key: 'PENDING', label: 'Pending' },
        { key: 'FAILED', label: 'Failed' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Transactions</h1>
                    <p className="text-primary-300 mt-1">Monitoring real-time system-wide network movements.</p>
                </div>
                <button
                    onClick={fetchTransactions}
                    className="flex items-center gap-2 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    <RefreshCw size={18} /> Refresh Feed
                </button>
            </div>

            {/* Stats Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Volume', value: formatCurrency(stats.totalVolume), color: 'text-white' },
                    { label: 'Transactions', value: stats.count, color: 'text-white' },
                    { label: 'Success Rate', value: stats.count > 0 ? `${Math.round((stats.successCount / stats.count) * 100)}%` : '—', color: 'text-emerald-400' },
                    { label: 'Failed', value: stats.failedCount, color: 'text-red-400' },
                ].map(s => (
                    <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                        <div className={`text-xs text-primary-400 uppercase tracking-widest font-bold mb-1 ${s.color}`}>{s.label}</div>
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 items-center bg-white/3 border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3 bg-black/20 px-4 py-2.5 rounded-xl border border-white/10 focus-within:border-cyan-500 transition-all flex-1 min-w-0 group">
                    <Search size={18} className="text-primary-400 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by ID or account..."
                        className="bg-transparent outline-none text-white w-full text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors">
                    <Calendar size={16} className="text-primary-400" />
                    <input
                        type="date"
                        className="bg-transparent text-primary-300 text-sm outline-none cursor-pointer [color-scheme:dark]"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <FilterDropdown label="Type" options={TYPE_CHIPS} value={typeFilter} onChange={setTypeFilter} />
                    <FilterDropdown label="Status" options={STATUS_CHIPS} value={statusFilter} onChange={setStatusFilter} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold">
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Source / Destination</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-12 text-center text-primary-300 italic">Loading transactions...</td></tr>
                        ) : filteredTransactions.length > 0 ? (
                            filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                                    {/* Date Column - Stacked */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-white font-medium">
                                                {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '—'}
                                            </span>
                                            <span className="text-[11px] text-primary-400 font-mono">
                                                {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Source/Dest Column - Pill Style */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="w-9 text-[9px] font-black uppercase tracking-tighter text-primary-400 border border-white/10 rounded px-1 py-0.5 bg-white/5 text-center">From</span>
                                                <span className="font-mono text-xs text-primary-100 truncate max-w-[140px]">{tx.fromAccountId || 'External System'}</span>
                                            </div>
                                            {tx.toAccountId && (
                                                <div className="flex items-center gap-2">
                                                    <span className="w-9 text-[9px] font-black uppercase tracking-tighter text-cyan-500 border border-cyan-500/20 rounded px-1 py-0.5 bg-cyan-500/5 text-center">To</span>
                                                    <span className="font-mono text-xs text-primary-100 truncate max-w-[140px]">{tx.toAccountId}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Type Column */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg border ${
                                                tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                tx.type === 'WITHDRAWAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={14} /> : tx.type === 'WITHDRAWAL' ? <ArrowUpRight size={14} /> : <CreditCard size={14} />}
                                            </div>
                                            <span className="font-bold text-white text-xs uppercase tracking-wide">{tx.type}</span>
                                        </div>
                                    </td>

                                    {/* Amount Column */}
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-bold text-[15px] ${tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-white'}`}>
                                            {tx.type === 'DEPOSIT' ? '+' : ''} {formatCurrency(tx.amount)}
                                        </span>
                                    </td>

                                    {/* Status Column - Bubble Design */}
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                                tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                                                tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-red-500/10 text-red-400'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    tx.status === 'SUCCESS' ? 'bg-emerald-400' :
                                                    tx.status === 'PENDING' ? 'bg-amber-400' : 'bg-red-400'
                                                }`} />
                                                {tx.status}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/admin/ledger?reference=${encodeURIComponent(tx.reference)}`)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400 bg-white/5 hover:bg-cyan-500 hover:text-white border border-white/10 hover:border-cyan-500 transition-all group-hover:shadow-lg group-hover:shadow-cyan-500/20"
                                        >
                                            <BookOpen size={14} /> <span>Ledger</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-24 text-center">
                                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-6">
                                            <Clock size={32} className="text-primary-500 opacity-50" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white tracking-tight">No Transactions Logged</h3>
                                        <p className="text-sm text-primary-400 mt-2 leading-relaxed">
                                            The network is active but no transactions match your current filters.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}