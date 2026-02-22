import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { partnerService } from '../../api';
import {
    Wallet, ArrowUpRight, ArrowDownLeft, ArrowLeftRight,
    RefreshCw, X, CheckCircle, Clock, AlertCircle, TrendingUp
} from 'lucide-react';

const formatCurrency = (amount, currency = 'THB') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount ?? 0);

const ACTION_CONFIG = {
    // deposit: {
    //     label: 'Deposit',
    //     icon: ArrowDownLeft,
    //     color: 'emerald',
    //     gradient: 'from-emerald-500 to-teal-500',
    //     bg: 'bg-emerald-500/10',
    //     border: 'border-emerald-500/20',
    //     text: 'text-emerald-400',
    //     btnClass: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    // },
    withdraw: {
        label: 'Withdraw',
        icon: ArrowUpRight,
        color: 'orange',
        gradient: 'from-orange-500 to-red-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        text: 'text-orange-400',
        btnClass: 'from-orange-500 to-red-600 shadow-orange-500/20',
    },
    transfer: {
        label: 'Transfer',
        icon: ArrowLeftRight,
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        btnClass: 'from-blue-500 to-cyan-600 shadow-blue-500/20',
    },
};

export default function ClientDashboard() {
    const { user } = useAuth();
    const [balanceData, setBalanceData] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(true);
    const [activeModal, setActiveModal] = useState(null); // 'deposit' | 'withdraw' | 'transfer'
    const [form, setForm] = useState({ amount: '', note: '', accountNumber: '' });
    const [txStatus, setTxStatus] = useState(null); // null | 'loading' | 'success' | 'error'
    const [txMessage, setTxMessage] = useState('');

    const fetchBalance = useCallback(async () => {
        setLoadingBalance(true);
        try {
            const data = await partnerService.getBalance();
            setBalanceData(data);
        } catch (err) {
            console.error('Balance fetch failed', err);
        } finally {
            setLoadingBalance(false);
        }
    }, []);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    const openModal = (type) => {
        setActiveModal(type);
        setForm({ amount: '', note: '', accountNumber: '' });
        setTxStatus(null);
        setTxMessage('');
    };

    const closeModal = () => {
        setActiveModal(null);
        setTxStatus(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTxStatus('loading');
        try {
            if (activeModal === 'deposit') {
                await partnerService.deposit(form.amount, form.note);
            } else if (activeModal === 'withdraw') {
                await partnerService.withdraw(form.amount, form.note);
            } else if (activeModal === 'transfer') {
                await partnerService.transfer(form.accountNumber, form.amount, form.note);
            }
            setTxStatus('success');
            setTxMessage('Transaction completed successfully!');
            fetchBalance(); // Refresh balance
        } catch (err) {
            setTxStatus('error');
            setTxMessage(err.response?.data?.message || 'Transaction failed. Please try again.');
        }
    };

    const cfg = activeModal ? ACTION_CONFIG[activeModal] : null;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Welcome back, <span className="text-orange-400">{user?.email?.split('@')[0] || 'Partner'}</span>
                    </h1>
                    <p className="text-slate-400 mt-1">Here's your account overview for today.</p>
                </div>
                <button
                    onClick={fetchBalance}
                    disabled={loadingBalance}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <RefreshCw size={17} className={loadingBalance ? 'animate-spin text-orange-400' : ''} />
                </button>
            </div>

            {/* Balance Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-950/80 via-[#1a0e00] to-red-950/60 border border-orange-500/20 p-8 shadow-2xl shadow-orange-900/20">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-red-500/8 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shadow-lg shadow-orange-500/10">
                                <Wallet size={22} className="text-orange-400" />
                            </div>
                            <div>
                                <p className="text-orange-300/70 text-sm font-semibold uppercase tracking-widest">Partner Account</p>
                                <p className="text-slate-400 text-xs font-mono mt-0.5 truncate max-w-[200px]">
                                    {balanceData?.accountId ? `ID: ${String(balanceData.accountId).substring(0, 16)}...` : 'Loading...'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            ACTIVE
                        </div>
                    </div>

                    <div className="mb-8">
                        <p className="text-slate-400 text-sm mb-2 font-semibold uppercase tracking-widest">Current Balance</p>
                        {loadingBalance ? (
                            <div className="h-14 w-64 bg-white/5 rounded-2xl animate-pulse" />
                        ) : (
                            <div className="flex items-end gap-3">
                                <span className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(251,146,60,0.3)]">
                                    {formatCurrency(balanceData?.balance, balanceData?.currency || 'THB')}
                                </span>
                            </div>
                        )}
                        {balanceData?.updatedAt && (
                            <p className="text-slate-600 text-xs mt-2 flex items-center gap-1.5">
                                <Clock size={11} />
                                Updated {new Date(balanceData.updatedAt).toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(ACTION_CONFIG).map(([type, config]) => {
                            const Icon = config.icon;
                            return (
                                <button
                                    key={type}
                                    onClick={() => openModal(type)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${config.btnClass} text-white font-bold text-sm shadow-lg transition-all hover:scale-[1.03] active:scale-[0.97]`}
                                >
                                    <Icon size={16} />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {
                        label: 'Currency',
                        value: balanceData?.currency || '—',
                        icon: TrendingUp,
                        color: 'orange',
                        sub: 'Base currency'
                    },
                    {
                        label: 'Account ID',
                        value: balanceData?.accountId ? String(balanceData.accountId).substring(0, 8) + '...' : '—',
                        icon: Wallet,
                        color: 'blue',
                        sub: 'Unique identifier'
                    },
                    {
                        label: 'Status',
                        value: 'ACTIVE',
                        icon: CheckCircle,
                        color: 'emerald',
                        sub: 'Account standing'
                    },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:bg-white/5 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-bold uppercase text-slate-500 tracking-widest">{s.label}</p>
                                <div className={`w-8 h-8 rounded-lg bg-${s.color}-500/10 border border-${s.color}-500/20 flex items-center justify-center`}>
                                    <Icon size={15} className={`text-${s.color}-400`} />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-white font-mono">{loadingBalance ? '...' : s.value}</p>
                            <p className="text-xs text-slate-600 mt-1">{s.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* Transaction Modal */}
            {activeModal && cfg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={closeModal}>
                    <div
                        className="bg-[#111115] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Glow */}
                        <div className={`absolute top-0 right-0 w-40 h-40 bg-${cfg.color}-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none`} />

                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                                    <cfg.icon size={20} className={cfg.text} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{cfg.label}</h3>
                                    <p className="text-xs text-slate-500">Secured with Idempotency-Key</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors p-1">
                                <X size={22} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 relative z-10">
                            {txStatus === 'success' ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} className="text-emerald-400" />
                                    </div>
                                    <p className="text-white font-bold text-lg">Success!</p>
                                    <p className="text-slate-400 text-sm mt-1">{txMessage}</p>
                                    <button
                                        onClick={closeModal}
                                        className="mt-6 w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {activeModal === 'transfer' && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Destination Account Number</label>
                                            <input
                                                type="text"
                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-all placeholder:text-slate-600 font-mono"
                                                placeholder="000123456789"
                                                value={form.accountNumber}
                                                onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{balanceData?.currency || 'THB'}</span>
                                            <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                className="w-full bg-black/30 border border-white/10 rounded-xl pl-16 pr-4 py-3 text-white outline-none focus:border-orange-500 transition-all placeholder:text-slate-600 text-lg font-bold"
                                                placeholder="0.00"
                                                value={form.amount}
                                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Note (optional)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-all placeholder:text-slate-600"
                                            placeholder={activeModal === 'deposit' ? 'Topup' : activeModal === 'withdraw' ? 'Settlement' : 'Payout'}
                                            value={form.note}
                                            onChange={e => setForm({ ...form, note: e.target.value })}
                                        />
                                    </div>

                                    {txStatus === 'error' && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400 text-sm">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                            <span>{txMessage}</span>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={txStatus === 'loading'}
                                            className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg bg-gradient-to-r ${cfg.btnClass} transition-all active:scale-[0.98] disabled:opacity-60`}
                                        >
                                            {txStatus === 'loading' ? 'Processing...' : `Confirm ${cfg.label}`}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
