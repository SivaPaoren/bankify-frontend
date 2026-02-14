import React, { useState, useEffect } from 'react';
import { adminService } from '../../api';
import {
    Search,
    Filter,
    Download,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';

export default function TransactionManager() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        type: 'ALL',
        status: 'ALL',
        startDate: '',
        endDate: ''
    });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await adminService.getTransactions(filters);
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchTransactions();
        }, 300); // Debounce
        return () => clearTimeout(timeout);
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'DEPOSIT': return <ArrowDownLeft size={16} className="text-emerald-500" />;
            case 'WITHDRAWAL': return <ArrowUpRight size={16} className="text-red-500" />;
            case 'TRANSFER': return <RefreshCw size={16} className="text-blue-500" />;
            default: return <Clock size={16} className="text-slate-500" />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            SUCCESS: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
            FAILED: 'bg-red-50 text-red-600 border-red-100'
        };
        const icons = {
            SUCCESS: <CheckCircle size={12} />,
            PENDING: <Clock size={12} />,
            FAILED: <XCircle size={12} />
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${styles[status] || 'bg-slate-50 text-slate-500'}`}>
                {icons[status]} {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
                    <p className="text-slate-500">Monitor and audit all system financial activities.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition shadow-sm">
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 flex-1 w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl focus-within:border-emerald-500 focus-within:bg-white transition">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Transaction ID..."
                        className="bg-transparent outline-none w-full text-sm"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                    <select
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 transition"
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <option value="ALL">All Types</option>
                        <option value="DEPOSIT">Deposit</option>
                        <option value="WITHDRAWAL">Withdrawal</option>
                        <option value="TRANSFER">Transfer</option>
                        <option value="PAYMENT">Payment</option>
                    </select>

                    <select
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 transition"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="SUCCESS">Success</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                    </select>

                    <input
                        type="date"
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 transition"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                    <span className="self-center text-slate-400">-</span>
                    <input
                        type="date"
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 transition"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Source / Dest</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading transactions...</td></tr>
                            ) : transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                                            {new Date(tx.date).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-700 font-medium group-hover:text-emerald-600 transition-colors">
                                            {tx.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-white transition-colors">
                                                    {getTypeIcon(tx.type)}
                                                </div>
                                                {tx.type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="flex items-center gap-1">From: <span className="text-slate-700">{tx.source}</span></span>
                                                <span className="flex items-center gap-1">To: <span className="text-slate-700">{tx.destination}</span></span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                                            {tx.currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(tx.status)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">No transactions found matching your filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
