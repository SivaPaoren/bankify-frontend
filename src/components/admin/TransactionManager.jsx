import React, { useState, useEffect } from 'react';
import { adminService } from '../../api';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, RefreshCw, Smartphone, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function TransactionManager() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ type: 'ALL', status: 'ALL', date: '' });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllTransactions();
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        if (filter.type !== 'ALL' && tx.type !== filter.type) return false;
        if (filter.status !== 'ALL' && tx.status !== filter.status) return false;
        if (filter.date && !tx.timestamp.startsWith(filter.date)) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
                    <p className="text-primary-200">Monitor and audit system-wide financial movements.</p>
                </div>
                <button
                    onClick={fetchTransactions}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl font-bold transition-all border border-white/5 active:scale-95"
                >
                    <RefreshCw size={18} />
                    Refresh Feed
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/10 flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
                    <div className="bg-black/20 p-2.5 rounded-xl border border-white/10 text-primary-400">
                        <Filter size={20} />
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select
                            className="bg-black/20 border border-white/10 text-primary-100 rounded-xl px-4 py-2.5 focus:border-cyan-500 outline-none w-full hover:bg-white/5 transition-colors appearance-none cursor-pointer"
                            value={filter.type}
                            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                        >
                            <option value="ALL">All Types</option>
                            <option value="DEPOSIT">Deposits</option>
                            <option value="WITHDRAWAL">Withdrawals</option>
                            <option value="TRANSFER">Transfers</option>
                        </select>
                        <select
                            className="bg-black/20 border border-white/10 text-primary-100 rounded-xl px-4 py-2.5 focus:border-cyan-500 outline-none w-full hover:bg-white/5 transition-colors appearance-none cursor-pointer"
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        >
                            <option value="ALL">All Status</option>
                            <option value="SUCCESS">Success</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                        </select>
                        <input
                            type="date"
                            className="bg-black/20 border border-white/10 text-primary-100 rounded-xl px-4 py-2.5 focus:border-cyan-500 outline-none w-full hover:bg-white/5 transition-colors"
                            value={filter.date}
                            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                        />
                    </div>
                </div>
                <div className="w-full lg:w-auto lg:max-w-xs relative group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by Transaction ID..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:border-cyan-500 transition-all placeholder:text-primary-500"
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
                                            {new Date(tx.timestamp).toLocaleString(undefined, {
                                                year: 'numeric', month: 'numeric', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
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
                                                    {tx.sourceAccountId ? 'Account' : 'External'}
                                                </span>
                                                <span className="font-mono text-sm text-primary-100">
                                                    {tx.sourceAccountId || tx.targetAccountId || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold text-[15px] ${tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-white'
                                                }`}>
                                                {tx.type === 'DEPOSIT' ? '+' : ''} {new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.currency }).format(tx.amount)}
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
        </div>
    );
}
