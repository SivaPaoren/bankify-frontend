import React, { useState, useEffect } from 'react';
import { adminService } from '../../api';
import { formatCurrency } from '../../utils/formatters';
import FilterDropdown from '../common/FilterDropdown';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, RefreshCw, Smartphone, CreditCard, CheckCircle, XCircle, Clock, Plus, X } from 'lucide-react';

export default function TransactionManager() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTx, setNewTx] = useState({ type: 'DEPOSIT', fromAccountId: '', toAccountId: '', amount: '', note: 'Admin Operation' });
    const [submitting, setSubmitting] = useState(false);

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

    const handleCreateTransaction = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (newTx.type === 'DEPOSIT') {
                await adminService.deposit(newTx.toAccountId, newTx.amount, newTx.note);
            } else if (newTx.type === 'WITHDRAWAL') {
                await adminService.withdraw(newTx.fromAccountId, newTx.amount, newTx.note);
            } else if (newTx.type === 'TRANSFER') {
                await adminService.transfer(newTx.fromAccountId, newTx.toAccountId, newTx.amount, newTx.note);
            }
            setShowCreateModal(false);
            setNewTx({ type: 'DEPOSIT', fromAccountId: '', toAccountId: '', amount: '', note: 'Admin Operation' });
            fetchTransactions();
        } catch (error) {
            console.error("Transaction failed", error);
            alert(`Failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setSubmitting(false);
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
                    <h1 className="text-3xl font-bold text-white tracking-tight">Transactions</h1>
                    <p className="text-primary-300 mt-1">Monitor and audit system-wide financial movements.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchTransactions}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl font-bold transition-all border border-white/5 active:scale-95"
                    >
                        <RefreshCw size={18} />
                        Refresh Feed
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                        <Plus size={18} />
                        New Transaction
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
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-primary-300 italic">No transactions found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Admin Transaction Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-primary-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-primary-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
                            <h3 className="text-xl font-bold text-white">Execute Admin Transaction</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-primary-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTransaction} className="p-6 space-y-5 relative z-10">
                            {/* Transaction Type */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Transaction Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['DEPOSIT', 'WITHDRAWAL', 'TRANSFER'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setNewTx({ ...newTx, type, fromAccountId: '', toAccountId: '' })}
                                            className={`py-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all text-sm ${newTx.type === type ?
                                                'bg-white/10 border-white/30 text-white' :
                                                'bg-black/20 border-white/5 text-primary-400 hover:bg-white/5'
                                                }`}
                                        >
                                            {type === 'DEPOSIT' && <ArrowDownLeft size={16} />}
                                            {type === 'WITHDRAWAL' && <ArrowUpRight size={16} />}
                                            {type === 'TRANSFER' && <RefreshCw size={16} />}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Accounts */}
                            {(newTx.type === 'WITHDRAWAL' || newTx.type === 'TRANSFER') && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Source Account ID (From)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all placeholder:text-primary-600 font-mono text-sm"
                                        placeholder="UUID of source account"
                                        value={newTx.fromAccountId}
                                        onChange={e => setNewTx({ ...newTx, fromAccountId: e.target.value })}
                                        required={newTx.type === 'WITHDRAWAL' || newTx.type === 'TRANSFER'}
                                    />
                                </div>
                            )}

                            {(newTx.type === 'DEPOSIT' || newTx.type === 'TRANSFER') && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Destination Account ID (To)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all placeholder:text-primary-600 font-mono text-sm"
                                        placeholder="UUID of destination account"
                                        value={newTx.toAccountId}
                                        onChange={e => setNewTx({ ...newTx, toAccountId: e.target.value })}
                                        required={newTx.type === 'DEPOSIT' || newTx.type === 'TRANSFER'}
                                    />
                                </div>
                            )}

                            {/* Amount & Note */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Amount</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-emerald-400 outline-none focus:border-emerald-500 transition-all placeholder:text-primary-600 font-bold text-lg"
                                        placeholder="0.00"
                                        min="0.01"
                                        step="0.01"
                                        value={newTx.amount}
                                        onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Admin Note</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all placeholder:text-primary-600"
                                        placeholder="Reason for override"
                                        value={newTx.note}
                                        onChange={e => setNewTx({ ...newTx, note: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 mt-2">
                                <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-200/80 leading-relaxed">
                                    You are executing a native Admin Override transaction. This bypasses standard user balances checks and goes straight to the core ledger. It will be permanently recorded in the Audit Log under your Admin ID.
                                </p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? 'Executing...' : 'Execute Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
