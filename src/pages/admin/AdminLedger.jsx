import React, { useState, useEffect } from 'react';
import { adminService } from '../../api';
import { useSearchParams } from 'react-router-dom';
import FilterDropdown from '../../components/common/FilterDropdown';
import { Search, RefreshCw, XCircle, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle, Clock } from 'lucide-react';

export default function AdminLedger() {
    const [searchParams, setSearchParams] = useSearchParams();
    const referenceFilter = searchParams.get('reference') || '';

    const [ledgers, setLedgers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(referenceFilter);
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => {
        // If reference is in URL, update searchTerm instantly
        if (referenceFilter && referenceFilter !== searchTerm) {
            setSearchTerm(referenceFilter);
        }
    }, [referenceFilter]);

    useEffect(() => {
        fetchLedgers();
    }, [searchParams]);

    const fetchLedgers = async () => {
        setLoading(true);
        try {
            // Fetch global ledgers, passing reference if present
            const params = {};
            if (referenceFilter) {
                params.reference = referenceFilter;
            }
            const data = await adminService.getGlobalLedger(params);
            setLedgers(data || []);
        } catch (error) {
            console.error("Failed to fetch global ledger", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
    };

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            if (searchTerm) {
                setSearchParams({ reference: searchTerm });
            } else {
                setSearchParams({});
            }
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSearchParams({});
    };

    // Filter frontend side for type
    const filteredLedgers = ledgers.filter(entry => {
        if (typeFilter !== 'ALL' && entry.direction !== typeFilter) return false;
        // Optionally, if the user Types without pressing Enter, we can local filter too
        if (searchTerm && !referenceFilter) {
            const term = searchTerm.toLowerCase();
            return (
                entry.id?.toLowerCase().includes(term) ||
                entry.transactionId?.toLowerCase().includes(term)
            );
        }
        return true;
    });

    const stats = {
        totalEntries: ledgers.length,
        totalDebits: ledgers.filter(l => l.direction === 'DEBIT').reduce((s, l) => s + (l.amount || 0), 0),
        totalCredits: ledgers.filter(l => l.direction === 'CREDIT').reduce((s, l) => s + (l.amount || 0), 0),
    };

    const TYPE_CHIPS = [
        { key: 'ALL', label: 'All Entries' },
        { key: 'CREDIT', label: 'Credits (+)', icon: <ArrowDownLeft size={14} /> },
        { key: 'DEBIT', label: 'Debits (-)', icon: <ArrowUpRight size={14} /> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Master General Ledger</h1>
                    <p className="text-primary-300 mt-1">Forensic tracking of the total money movement in the bank.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchLedgers}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl font-bold transition-all border border-white/5 active:scale-95"
                    >
                        <RefreshCw size={18} />
                        Refresh Ledger
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">Total Entries</div>
                    <div className="text-2xl font-bold text-white">{stats.totalEntries}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-xs text-emerald-400/80 uppercase tracking-widest font-bold mb-1">Total Credits (Incoming)</div>
                    <div className="text-2xl font-bold text-emerald-400">
                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(stats.totalCredits)}
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-xs text-red-400/80 uppercase tracking-widest font-bold mb-1">Total Debits (Outgoing)</div>
                    <div className="text-2xl font-bold text-red-400">
                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(stats.totalDebits)}
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white/3 border border-white/10 rounded-2xl px-4 py-3">
                {/* Search */}
                <div className="flex items-center gap-3 bg-black/20 px-4 py-2.5 rounded-xl border border-white/10 focus-within:border-cyan-500 focus-within:bg-black/30 transition-all flex-1 min-w-0 group relative">
                    <Search size={18} className="text-primary-400 group-focus-within:text-cyan-400 transition-colors shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by ID or Transaction Reference..."
                        className="bg-transparent outline-none text-white w-full placeholder:text-primary-500 text-sm"
                        value={searchTerm}
                        onChange={handleSearch}
                        onKeyDown={handleSearchSubmit}
                        title="Press Enter to filter on backend."
                    />
                    {searchTerm && (
                        <button onClick={clearSearch} className="absolute right-4 text-primary-400 hover:text-white">
                            <XCircle size={16} />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 ml-auto shrink-0">
                    <FilterDropdown
                        label="Direction"
                        options={TYPE_CHIPS}
                        value={typeFilter}
                        onChange={setTypeFilter}
                        counts={{
                            CREDIT: ledgers.filter(l => l.direction === 'CREDIT').length,
                            DEBIT: ledgers.filter(l => l.direction === 'DEBIT').length
                        }}
                    />
                </div>
            </div>

            {referenceFilter && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2 text-amber-300 text-sm mb-4">
                    <FileText size={18} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Filtered View</p>
                        <p className="text-amber-200/80">Showing ledger entries for transaction reference: <span className="font-mono">{referenceFilter}</span></p>
                    </div>
                </div>
            )}

            {/* Ledger Table */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold">
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Ledger ID</th>
                                <th className="px-6 py-4">Transaction Ref</th>
                                <th className="px-6 py-4">Direction</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-primary-300 italic">Loading global ledger...</td></tr>
                            ) : filteredLedgers.length > 0 ? (
                                filteredLedgers.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-primary-200 font-mono">
                                            {entry.createAt ? new Date(entry.createAt).toLocaleString(undefined, {
                                                year: 'numeric', month: 'numeric', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            }) : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs text-primary-400" title={entry.id}>{entry.id.substring(0, 18)}...</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-sm text-primary-100 bg-black/30 px-2 py-1 rounded inline-block">
                                                {entry.transactionId || 'SYSTEM'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${entry.direction === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {entry.direction === 'CREDIT' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                </div>
                                                <span className={`font-bold text-sm ${entry.direction === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>{entry.direction}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold text-[15px] ${entry.direction === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {entry.direction === 'CREDIT' ? '+' : '-'} {new Intl.NumberFormat('en-US', { style: 'currency', currency: entry.currency || 'THB' }).format(entry.amount)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-primary-300 italic">No ledger entries found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
