import React, { useState, useEffect } from 'react';
import { adminService } from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { Search, RefreshCw, BookOpen, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function AdminLedger() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reference, setReference] = useState('');
    const [search, setSearch] = useState('');

    const fetchLedger = async (ref) => {
        setLoading(true);
        try {
            const params = ref ? { reference: ref } : {};
            const data = await adminService.getLedger(params);
            setEntries(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch ledger', err);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check if navigated with ?reference=... query param
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('reference') || '';
        setReference(ref);
        fetchLedger(ref);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLedger(reference);
    };

    // Group entries by transactionId so DEBIT+CREDIT pairs are visible
    const grouped = {};
    entries.forEach(e => {
        if (!grouped[e.transactionId]) grouped[e.transactionId] = [];
        grouped[e.transactionId].push(e);
    });

    const stats = {
        total: entries.length,
        debits: entries.filter(e => e.direction === 'DEBIT').length,
        credits: entries.filter(e => e.direction === 'CREDIT').length,
        totalVolume: entries.filter(e => e.direction === 'DEBIT').reduce((s, e) => s + (e.amount || 0), 0),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <BookOpen size={28} className="text-cyan-400" />
                        Global Ledger
                    </h1>
                    <p className="text-primary-300 mt-1">Every DEBIT and CREDIT entry in the bank's accounting book.</p>
                </div>
                <button
                    onClick={() => fetchLedger(reference)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl font-bold transition-all border border-white/5"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Entries', value: stats.total, color: 'text-white' },
                    { label: 'Debits', value: stats.debits, color: 'text-red-400' },
                    { label: 'Credits', value: stats.credits, color: 'text-emerald-400' },
                    { label: 'Total Volume', value: formatCurrency(stats.totalVolume), color: 'text-cyan-400' },
                ].map(s => (
                    <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                        <div className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">{s.label}</div>
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filter by reference */}
            <form onSubmit={handleSearch} className="flex gap-3 bg-white/3 border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3 bg-black/20 px-4 py-2.5 rounded-xl border border-white/10 focus-within:border-cyan-500 transition-all flex-1 group">
                    <Search size={16} className="text-primary-400 group-focus-within:text-cyan-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Filter by transaction reference / ID..."
                        className="bg-transparent outline-none text-white w-full placeholder:text-primary-500 text-sm font-mono"
                        value={reference}
                        onChange={e => setReference(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shrink-0"
                >
                    Filter
                </button>
                {reference && (
                    <button
                        type="button"
                        onClick={() => { setReference(''); fetchLedger(''); }}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-primary-300 font-bold rounded-xl transition-all shrink-0 border border-white/10"
                    >
                        Clear
                    </button>
                )}
            </form>

            {/* Ledger Table */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold">
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Direction</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4">Currency</th>
                                <th className="px-6 py-4">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-primary-300 italic">
                                        Loading ledger…
                                    </td>
                                </tr>
                            ) : entries.length > 0 ? (
                                entries.map((entry, i) => {
                                    const isDebit = entry.direction === 'DEBIT';
                                    return (
                                        <tr key={entry.id || i} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <code className="text-xs font-mono text-primary-300 bg-black/30 px-2 py-1 rounded">
                                                    {entry.transactionId ? String(entry.transactionId).substring(0, 16) + '…' : '—'}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${isDebit
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    }`}>
                                                    {isDebit ? <ArrowUpRight size={11} /> : <ArrowDownLeft size={11} />}
                                                    {entry.direction}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-bold ${isDebit ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {isDebit ? '-' : '+'}{formatCurrency(entry.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono text-primary-300 bg-black/20 px-2 py-1 rounded">
                                                    {entry.currency || '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-primary-200 font-mono">
                                                {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '—'}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-primary-400/60 italic">
                                        {reference ? `No ledger entries for reference: "${reference}"` : 'No ledger entries found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-xs text-center text-primary-500 font-mono">
                Every transfer generates 1 DEBIT entry and 1 CREDIT entry. Deposits generate 1 CREDIT. Withdrawals generate 1 DEBIT.
            </p>
        </div>
    );
}
