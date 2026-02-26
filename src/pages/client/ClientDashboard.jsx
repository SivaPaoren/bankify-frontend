import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { partnerService } from '../../api';
import {
    Wallet, ArrowUpRight, ArrowDownLeft, ArrowLeftRight,
    RefreshCw, X, CheckCircle, Clock, TrendingUp,
    Lock, ShieldCheck, Copy, Terminal
} from 'lucide-react';

const formatCurrency = (amount, currency = 'THB') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount ?? 0);

const ACTION_CONFIG = {
    deposit: {
        label: 'Deposit',
        icon: ArrowDownLeft,
        color: 'emerald',
        btnClass: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
        endpoint: 'POST /api/v1/partner/me/deposit',
        body: `{ "amount": 5000.00, "note": "Settlement credit" }`,
    },
    withdraw: {
        label: 'Withdraw',
        icon: ArrowUpRight,
        color: 'orange',
        btnClass: 'from-orange-500 to-red-600 shadow-orange-500/20',
        endpoint: 'POST /api/v1/partner/me/withdraw',
        body: `{ "amount": 1000.00, "note": "Payout" }`,
    },
    transfer: {
        label: 'Transfer',
        icon: ArrowLeftRight,
        color: 'blue',
        btnClass: 'from-blue-500 to-cyan-600 shadow-blue-500/20',
        endpoint: 'POST /api/v1/partner/me/transfer',
        body: `{ "accountNumber": "000123456", "amount": 500.00, "note": "To merchant" }`,
    },
};

export default function ClientDashboard() {
    const { user } = useAuth();
    const [balanceData, setBalanceData] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(true);
    const [balanceError, setBalanceError] = useState(null);
    const [partnerInfo, setPartnerInfo] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [copied, setCopied] = useState(false);

    const fetchBalance = useCallback(async () => {
        setLoadingBalance(true);
        setBalanceError(null);
        try {
            const data = await partnerService.getBalance();
            setBalanceData(data);
        } catch (err) {
            const status = err.response?.status;
            if (status === 401) {
                setBalanceError('Balance requires X-API-Key authentication (server-to-server).');
            } else if (status === 403) {
                setBalanceError('Access denied — your partner app may be pending approval.');
            } else {
                setBalanceError('Could not load balance.');
            }
        } finally {
            setLoadingBalance(false);
        }
    }, []);

    const fetchPartnerInfo = useCallback(async () => {
        try {
            const data = await partnerService.getPartnerInfo();
            setPartnerInfo(data);
        } catch (_) {
            // non-critical
        }
    }, []);

    useEffect(() => {
        fetchBalance();
        fetchPartnerInfo();
    }, [fetchBalance, fetchPartnerInfo]);

    const openModal = (type) => {
        setActiveModal(type);
        setCopied(false);
    };
    const closeModal = () => setActiveModal(null);

    const cfg = activeModal ? ACTION_CONFIG[activeModal] : null;

    const codeSnippet = cfg ? `// Node.js — call from your backend server\nconst idempotencyKey = \`tx-\${crypto.randomUUID()}\`;\n\nawait fetch('https://your-bank-host${cfg.endpoint.split(' ')[1]}', {\n  method: 'POST',\n  headers: {\n    'X-API-Key':       process.env.BANKIFY_API_KEY, // ← provided at approval\n    'Idempotency-Key': idempotencyKey,              // ← unique per request\n    'Content-Type':    'application/json',\n  },\n  body: JSON.stringify(${cfg.body}),\n});` : '';

    const appStatus = partnerInfo?.appStatus ?? 'ACTIVE';

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
                    onClick={() => { fetchBalance(); fetchPartnerInfo(); }}
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
                                <p className="text-slate-400 text-xs font-mono mt-0.5">{user?.email || 'Loading...'}</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${appStatus === 'ACTIVE'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : appStatus === 'PENDING'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${appStatus === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : appStatus === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'}`} />
                            {appStatus}
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
                                        The <code className="bg-black/30 px-1 rounded">/partner/me/balance</code> endpoint is server-to-server.
                                        Use your <strong>X-API-Key</strong> from your backend to access it.
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

                    {/* Action Buttons */}
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
                            Server-to-server with X-API-Key
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Email', value: user?.email || '—', icon: TrendingUp, color: 'orange', sub: 'Portal login' },
                    { label: 'Account Type', value: 'PARTNER', icon: Wallet, color: 'blue', sub: 'Enterprise' },
                    {
                        label: 'Status',
                        value: appStatus,
                        icon: CheckCircle,
                        color: appStatus === 'ACTIVE' ? 'emerald' : appStatus === 'PENDING' ? 'amber' : 'red',
                        sub: 'App standing'
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

            {/* Server-side Note */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Lock size={15} className="text-blue-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white">Server-to-Server Money Operations</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Deposit, Withdraw, and Transfer require <code className="bg-black/30 px-1 rounded text-orange-300">X-API-Key</code> authentication.
                        These must be called from your backend server — never from the browser.
                        Each request needs a unique <code className="bg-black/30 px-1 rounded text-orange-300">Idempotency-Key</code> to prevent duplicate charges.
                    </p>
                </div>
            </div>

            {/* Informational Modal — shows code snippet, does NOT call the API */}
            {activeModal && cfg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={closeModal}>
                    <div
                        className="bg-[#111115] border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={`absolute top-0 right-0 w-40 h-40 bg-${cfg.color}-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none`} />

                        <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl bg-${cfg.color}-500/10 border border-${cfg.color}-500/20`}>
                                    <cfg.icon size={20} className={`text-${cfg.color}-400`} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{cfg.label}</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Terminal size={10} className="text-slate-600" />
                                        Backend server call — X-API-Key required
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors p-1">
                                <X size={22} />
                            </button>
                        </div>

                        <div className="p-6 relative z-10 space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-amber-500/8 border border-amber-500/15 rounded-xl">
                                <Lock size={14} className="text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-amber-300 text-xs leading-relaxed">
                                    This operation must be performed from <strong>your backend server</strong> using your <strong>X-API-Key</strong>.
                                    It cannot be executed from the browser for security reasons.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Node.js example</p>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(codeSnippet); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                        className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-orange-400 transition-colors"
                                    >
                                        {copied ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <pre className="bg-black/50 border border-white/6 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre">
                                    {codeSnippet}
                                </pre>
                            </div>

                            <button onClick={closeModal} className="w-full py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-all text-sm">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
