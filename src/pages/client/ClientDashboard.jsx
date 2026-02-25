import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { partnerService } from '../../api';
import {
    Wallet, ArrowUpRight, ArrowDownLeft, ArrowLeftRight,
    RefreshCw, X, CheckCircle, Clock, AlertCircle, TrendingUp,
    Lock, ShieldCheck
} from 'lucide-react';

const formatCurrency = (amount, currency = 'THB') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount ?? 0);

const ACTION_CONFIG = {
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

// Generates a unique idempotency key per call — critical for safe payments
const generateIdempotencyKey = (prefix = 'TX') => {
    const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    return `${prefix}-${uuid}`;
};

export default function ClientDashboard() {
    const { user } = useAuth();
    const [balanceData, setBalanceData] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(true);
    const [balanceError, setBalanceError] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [form, setForm] = useState({ amount: '', note: '', accountNumber: '' });
    const [txStatus, setTxStatus] = useState(null);
    const [txMessage, setTxMessage] = useState('');

    const fetchBalance = useCallback(async () => {
        setLoadingBalance(true);
        setBalanceError(null);
        try {
            const data = await partnerService.getBalance();
            setBalanceData(data);
        } catch (err) {
            const status = err.response?.status;
            if (status === 401) {
                setBalanceError('Unauthorized — balance requires X-API-Key (server-to-server only).');
            } else if (status === 403) {
                setBalanceError('Access denied — your partner app may still be pending approval.');
            } else {
                setBalanceError('Could not load balance. Please try again.');
            }
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

        // Each submission generates a FRESH unique idempotency key
        // This guarantees uniqueness even if the user submits the same amount twice
        const idempotencyKey = generateIdempotencyKey(activeModal === 'withdraw' ? 'WDR' : 'TRF');
        console.log('[Bankify] Idempotency-Key:', idempotencyKey);

        try {
            if (activeModal === 'withdraw') {
                await partnerService.withdraw(form.amount, form.note);
            } else if (activeModal === 'transfer') {
                await partnerService.transfer(form.accountNumber, form.amount, form.note);
            }
            setTxStatus('success');
            setTxMessage('Transaction completed successfully!');
            fetchBalance();
        } catch (err) {
            const status = err.response?.status;
            let message = err.response?.data?.message || 'Transaction failed. Please try again.';
            if (status === 401) message = 'Unauthorized — this operation requires X-API-Key (server-to-server).';
            if (status === 403) message = 'Forbidden — your partner app may be pending approval.';
            setTxStatus('error');
            setTxMessage(message);
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
                                <p className="text-slate-400 text-xs font-mono mt-0.5">
                                    {user?.email || 'Loading...'}
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
                        ) : balanceError ? (
                            <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl max-w-xl">
                                <Lock size={20} className="text-orange-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-orange-300 font-bold text-sm">Balance Requires X-API-Key</p>
                                    <p className="text-orange-400/70 text-xs mt-1">
                                        The <code className="bg-black/30 px-1 rounded">/partner/me/balance</code> endpoint is a server-to-server API.
                                        Use your <strong>X-API-Key</strong> from the Developer Console on your backend server to access it.
                                    </p>
                                </div>
                            </div>
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

                    {/* Quick Action Buttons — server-to-server only notice */}
                    <div className="flex flex-wrap gap-3 items-center">
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
                        <span className="text-slate-600 text-xs flex items-center gap-1.5">
                            <ShieldCheck size={12} className="text-slate-500" />
                            All transactions secured with unique Idempotency-Key
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {
                        label: 'Email',
                        value: user?.email || '—',
                        icon: TrendingUp,
                        color: 'orange',
                        sub: 'Portal login'
                    },
                    {
                        label: 'Account Type',
                        value: 'PARTNER',
                        icon: Wallet,
                        color: 'blue',
                        sub: 'Enterprise'
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
                            <p className="text-lg font-bold text-white font-mono truncate">{s.value}</p>
                            <p className="text-xs text-slate-600 mt-1">{s.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* API Note */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Lock size={15} className="text-blue-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white">Server-to-Server Money Operations</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Deposit, Withdraw, and Transfer endpoints require <code className="bg-black/30 px-1 rounded text-orange-300">X-API-Key</code> authentication.
                        These operations must be called from your backend server — never from the browser.
                        Each request must include a unique <code className="bg-black/30 px-1 rounded text-orange-300">Idempotency-Key</code> header to prevent duplicate charges.
                    </p>
                </div>
            </div>

            {/* Transaction Modal */}
            {activeModal && cfg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={closeModal}>
                    <div
                        className="bg-[#111115] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={`absolute top-0 right-0 w-40 h-40 bg-${cfg.color}-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none`} />

                        <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                                    <cfg.icon size={20} className={cfg.text} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{cfg.label}</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <ShieldCheck size={10} className="text-emerald-500" />
                                        Unique Idempotency-Key per request
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors p-1">
                                <X size={22} />
                            </button>
                        </div>

                        <div className="p-6 relative z-10">
                            {txStatus === 'success' ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} className="text-emerald-400" />
                                    </div>
                                    <p className="text-white font-bold text-lg">Success!</p>
                                    <p className="text-slate-400 text-sm mt-1">{txMessage}</p>
                                    <button onClick={closeModal} className="mt-6 w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-all">
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
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">THB</span>
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
                                            placeholder={activeModal === 'withdraw' ? 'Settlement' : 'Payout'}
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
                                        <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-all">
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
