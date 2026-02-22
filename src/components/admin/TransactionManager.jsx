import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../api';
import { formatCurrency } from '../../utils/formatters';
import FilterDropdown from '../common/FilterDropdown';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, RefreshCw, Smartphone, CreditCard, CheckCircle, XCircle, Clock, Plus, X, BookOpen } from 'lucide-react';

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
            console.log(data);
            setTransactions(Array.isArray(data) ? data : (data.content || []));
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    // Manual Transaction Creation Removed: Admins only monitor activity.

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

    // Stats Calculation
    const stats = {
        totalVolume: filteredTransactions.filter(t => t.status === 'SUCCESS').reduce((sum, t) => sum + (t.amount || 0), 0),
        count: filteredTransactions.length,
        successCount: filteredTransactions.filter(t => t.status === 'SUCCESS').length,
        failedCount: filteredTransactions.filter(t => t.status === 'FAILED').length,
    };

    const TYPE_CHIPS = [
        { key: 'ALL', label: 'All Types' },
        { key: 'DEPOSIT', label: 'Deposits', icon: <ArrowDownLeft size={14} /> },
        { key: 'WITHDRAWAL', label: 'Withdrawals', icon: <ArrowUpRight size={14} /> },
        { key: 'TRANSFER', label: 'Transfers', icon: <RefreshCw size={14} /> },
        { key: 'PAYMENT', label: 'Payments', icon: <CreditCard size={14} /> },
    ];

    const STATUS_CHIPS = [
        { key: 'ALL', label: 'All Status' },
        { key: 'SUCCESS', label: 'Success', cls: 'border-emerald-500/20 text-emerald-400', activeCls: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
        { key: 'PENDING', label: 'Pending', cls: 'border-amber-500/20 text-amber-400', activeCls: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
        { key: 'FAILED', label: 'Failed', cls: 'border-red-500/20 text-red-400', activeCls: 'bg-red-500/20 border-red-500/40 text-red-300' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        Transactions
                        <span className="relative flex h-3 w-3 mt-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                        </span>
                    </h1>
                    <p className="text-primary-300 mt-1">Securely monitoring system-wide network movements.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchTransactions}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl font-bold transition-all border border-white/5 active:scale-95"
                    >
                        <RefreshCw size={18} />
                        Refresh Feed
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">Total Volume</div>
                    <div className="text-2xl font-bold text-white">
                        {formatCurrency(stats.totalVolume)}
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">Transactions</div>
                    <div className="text-2xl font-bold text-white">{stats.count}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-xs text-emerald-400/80 uppercase tracking-widest font-bold mb-1">Success Rate</div>
                    <div className="text-2xl font-bold text-emerald-400">
                        {stats.count > 0 ? Math.round((stats.successCount / stats.count) * 100) : 0}%
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-xs text-red-400/80 uppercase tracking-widest font-bold mb-1">Failed</div>
                    <div className="text-2xl font-bold text-red-400">{stats.failedCount}</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white/3 border border-white/10 rounded-2xl px-4 py-3">
                {/* Search */}
                <div className="flex items-center gap-3 bg-black/20 px-4 py-2.5 rounded-xl border border-white/10 focus-within:border-cyan-500 focus-within:bg-black/30 transition-all flex-1 min-w-0 group">
                    <Search size={18} className="text-primary-400 group-focus-within:text-cyan-400 transition-colors shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by ID or account..."
                        className="bg-transparent outline-none text-white w-full placeholder:text-primary-500 text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors shrink-0">
                    <input
                        type="date"
                        className="bg-transparent text-primary-300 text-sm outline-none cursor-pointer"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                    />
                </div>

                {/* Filters — pushed to the right */}
                <div className="flex items-center gap-3 ml-auto shrink-0">
                    <FilterDropdown
                        label="Type"
                        options={TYPE_CHIPS}
                        value={typeFilter}
                        onChange={setTypeFilter}
                        counts={{
                            DEPOSIT: transactions.filter(t => t.type === 'DEPOSIT').length,
                            WITHDRAWAL: transactions.filter(t => t.type === 'WITHDRAWAL').length,
                            TRANSFER: transactions.filter(t => t.type === 'TRANSFER').length,
                            PAYMENT: transactions.filter(t => t.type === 'PAYMENT').length
                        }}
                    />
                    <FilterDropdown
                        label="Status"
                        options={STATUS_CHIPS}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        counts={{
                            SUCCESS: transactions.filter(t => t.status === 'SUCCESS').length,
                            PENDING: transactions.filter(t => t.status === 'PENDING').length,
                            FAILED: transactions.filter(t => t.status === 'FAILED').length
                        }}
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold">
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Source / Dest</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right">Status</th>
                                <th className="px-6 py-4 text-right">Accounting</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-primary-300 italic">Loading transactions...</td></tr>
                            ) : filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-primary-200 font-mono">
                                            {tx.createdAt ? new Date(tx.createdAt).toLocaleString(undefined, {
                                                year: 'numeric', month: 'numeric', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            }) : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs text-primary-400">{tx.id.substring(0, 18)}...</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    tx.type === 'WITHDRAWAL' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-blue-500/10 text-blue-400'
                                                    }`}>
                                                    {tx.type === 'DEPOSIT' && <ArrowDownLeft size={14} />}
                                                    {tx.type === 'WITHDRAWAL' && <ArrowUpRight size={14} />}
                                                    {tx.type === 'TRANSFER' && <RefreshCw size={14} />}
                                                    {tx.type === 'PAYMENT' && <CreditCard size={14} />}
                                                </div>
                                                <span className="font-bold text-white text-sm">{tx.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-primary-400 uppercase tracking-wider mb-0.5">
                                                    {tx.fromAccountId ? 'From' : 'To'}
                                                </span>
                                                <span className="font-mono text-sm text-primary-100">
                                                    {tx.fromAccountId || tx.toAccountId || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold text-[15px] ${tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-white'
                                                }`}>
                                                {tx.type === 'DEPOSIT' ? '+' : ''} {formatCurrency(tx.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border w-fit ml-auto ${tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {tx.status === 'SUCCESS' && <CheckCircle size={10} />}
                                                {tx.status === 'PENDING' && <Clock size={10} />}
                                                {tx.status === 'FAILED' && <XCircle size={10} />}
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/admin/ledger?reference=${encodeURIComponent(tx.reference)}`);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 transition-all ml-auto"
                                                title="View Accounting Entries"
                                            >
                                                <BookOpen size={14} />
                                                <span>Audit Logs</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-2 relative group shadow-lg">
                                                <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
                                                <RefreshCw size={36} className="text-cyan-400/80 animate-[spin_4s_linear_infinite]" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white tracking-tight">Awaiting Network Activity</h3>
                                            <p className="text-sm text-primary-400 leading-relaxed text-balance">
                                                The system is securely monitoring the network. All new transactions processed by ATMs or Partner APIs will appear here automatically.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
