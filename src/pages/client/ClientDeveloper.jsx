import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { partnerService } from '../../api';
import {
    Key, Copy, CheckCircle, AlertTriangle,
    RefreshCw, RotateCcw, Lock, ShieldCheck,
    ChevronDown, ChevronUp, Terminal, BookOpen, History, Clock
} from 'lucide-react';

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const CopyBtn = ({ text, field, copied, onCopy }) => (
    <button
        onClick={() => onCopy(text, field)}
        className="shrink-0 text-slate-600 hover:text-orange-400 transition-colors p-1"
        title="Copy"
    >
        {copied === field
            ? <CheckCircle size={13} className="text-emerald-400" />
            : <Copy size={13} />}
    </button>
);

const MonoBlock = ({ children, label, copiable, copied, onCopy }) => (
    <div className="space-y-1.5">
        {label && <p className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">{label}</p>}
        <div className="flex items-center gap-2 bg-black/40 border border-white/8 rounded-xl px-4 py-3">
            <code className="flex-1 text-sm font-mono text-slate-200 truncate">{children}</code>
            {copiable && <CopyBtn text={copiable} field={label} copied={copied} onCopy={onCopy} />}
        </div>
    </div>
);

// ─── idempotency key generator (matches backend format) ───────────────────────
const newKey = (prefix = 'tx') =>
    `${prefix}-${(typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2)}`;

export default function ClientDeveloper() {
    const { user } = useAuth();
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // rotation
    const [rotationReason, setRotationReason] = useState('');
    const [rotationStatus, setRotationStatus] = useState(null);
    const [rotationMsg, setRotationMsg] = useState('');
    const [showRotation, setShowRotation] = useState(false);

    // copy
    const [copied, setCopied] = useState(null);

    // live idempotency example key (refreshes on each render)
    const [exampleKey] = useState(() => newKey('tx'));

    // rotation history
    const [showHistory, setShowHistory] = useState(false);
    const [rotationHistory, setRotationHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(null);

    const fetchInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await partnerService.getPartnerInfo();
            setInfo(data);
        } catch (err) {
            const status = err.response?.status;
            if (status === 403) setError('Partner app is pending admin approval. Credentials will appear here once approved.');
            else if (status === 401) setError('Session expired — please log out and log back in.');
            else setError('Could not load partner info. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInfo(); }, []);

    const copy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text).catch(() => { });
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    const submitRotation = async (e) => {
        e.preventDefault();
        setRotationStatus('loading');
        try {
            await partnerService.requestRotation(rotationReason);
            setRotationStatus('success');
            setRotationMsg('Rotation request submitted. An admin will approve it and share the new key with you.');
            setRotationReason('');
            // refresh history if it's open
            if (showHistory) fetchHistory();
        } catch (err) {
            setRotationStatus('error');
            setRotationMsg(err.response?.data?.message || 'Failed to submit rotation request.');
        }
    };

    const fetchHistory = async () => {
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            const data = await partnerService.getRotationHistory();
            setRotationHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            setHistoryError('Failed to load rotation history.');
        } finally {
            setHistoryLoading(false);
        }
    };

    const toggleHistory = () => {
        const next = !showHistory;
        setShowHistory(next);
        if (next && rotationHistory.length === 0 && !historyLoading) fetchHistory();
    };

    const partnerId = info?.partnerAppId ? String(info.partnerAppId) : null;
    const appName = info?.appName;
    const appStatus = info?.appStatus;
    const apiKeyIssued = info?.apiKeyIssued;

    // ─── Section helpers ────────────────────────────────────────────────────────
    const SectionHeader = ({ icon: Icon, title, sub }) => (
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/6">
            <Icon size={15} className="text-orange-400" />
            <div>
                <p className="text-sm font-bold text-white">{title}</p>
                {sub && <p className="text-xs text-slate-500">{sub}</p>}
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl space-y-6">

            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Developer Console</h1>
                    <p className="text-slate-400 mt-1 text-sm">API credentials and integration guide.</p>
                </div>
                <button onClick={fetchInfo} disabled={loading} title="Refresh"
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <RefreshCw size={15} className={loading ? 'animate-spin text-orange-400' : ''} />
                </button>
            </div>

            {/* ── Error ──────────────────────────────────────────────────────────── */}
            {error && (
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-amber-300 text-sm">{error}</p>
                </div>
            )}

            {/* ── 1. Credentials ─────────────────────────────────────────────────── */}
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                <SectionHeader icon={Key} title="API Credentials"
                    sub={loading ? '...' : (appName || user?.email)} />

                <div className="px-6 py-5 space-y-4">
                    {/* status badge */}
                    {!loading && appStatus && (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${appStatus === 'ACTIVE'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${appStatus === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                            {appStatus}
                        </div>
                    )}

                    {/* Partner ID */}
                    <MonoBlock label="Partner ID" copiable={partnerId} copied={copied} onCopy={copy}>
                        {loading ? '—' : (partnerId || 'Not available')}
                    </MonoBlock>

                    {/* API Key status */}
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">X-API-Key</p>
                        {loading ? (
                            <div className="h-12 bg-white/3 rounded-xl animate-pulse" />
                        ) : apiKeyIssued === true ? (
                            <div className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-4 py-3">
                                <ShieldCheck size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-emerald-300 text-sm font-semibold">API Key is active</p>
                                    <p className="text-slate-500 text-xs mt-0.5">
                                        Your key was shared by the admin at approval time. It cannot be retrieved again —
                                        if you've lost it, use <span className="text-orange-300">Request Key Rotation</span> below.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3">
                                <Lock size={15} className="text-amber-400 shrink-0" />
                                <p className="text-amber-300 text-sm">
                                    No API key yet — awaiting admin approval.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* How to authenticate */}
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Required header on all server-side API calls</p>
                        <div className="bg-black/40 border border-white/8 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
                            <code className="text-sm font-mono text-orange-300">X-API-Key: &lt;your-api-key&gt;</code>
                            <CopyBtn text="X-API-Key: <your-api-key>" field="header" copied={copied} onCopy={copy} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 2. Idempotency Key ─────────────────────────────────────────────── */}
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                <SectionHeader icon={ShieldCheck}
                    title="Idempotency Key — Critical for Payments"
                    sub="Every money operation must include a unique Idempotency-Key header" />

                <div className="px-6 py-5 space-y-4">
                    <p className="text-sm text-slate-400 leading-relaxed">
                        If the same request is sent twice with the <span className="text-orange-300 font-mono text-xs">Idempotency-Key</span>,
                        the backend returns the <strong className="text-white">original transaction</strong> — it will NOT charge twice.
                        Always generate a new unique key for each distinct operation.
                    </p>

                    {/* Live example key */}
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Format — UUID prefixed</p>
                        <div className="bg-black/40 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-2">
                            <code className="flex-1 text-sm font-mono text-emerald-300 truncate">{exampleKey}</code>
                            <CopyBtn text={exampleKey} field="idem" copied={copied} onCopy={copy} />
                        </div>
                        <p className="text-[11px] text-slate-600">Prefixes: <code className="text-slate-400">tx-</code> for generic, <code className="text-slate-400">dep-</code> deposit, <code className="text-slate-400">wdr-</code> withdraw, <code className="text-slate-400">trf-</code> transfer</p>
                    </div>

                    {/* Code snippet */}
                    <pre className="bg-black/50 border border-white/6 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre">{`// Node.js / server-side — generate per request
const idempotencyKey = \`tx-\${crypto.randomUUID()}\`;
// → "tx-a1b2c3d4-..."  (unique every call)

await fetch('https://your-bank-host/api/v1/partner/me/deposit', {
  method: 'POST',
  headers: {
    'X-API-Key':        process.env.BANKIFY_API_KEY,
    'Idempotency-Key':  idempotencyKey,   // ← must be unique per operation
    'Content-Type':     'application/json',
  },
  body: JSON.stringify({ amount: 5000.00, note: 'Settlement credit' }),
});`}</pre>
                </div>
            </div>

            {/* ── 3. Endpoint Reference ──────────────────────────────────────────── */}
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                <SectionHeader icon={Terminal} title="Server-to-Server Endpoints (X-API-Key)" />

                <div className="divide-y divide-white/5">
                    {[
                        {
                            method: 'GET', path: '/api/v1/partner/me/balance',
                            label: 'Get Balance', idem: false,
                            note: 'Returns current settlement account balance',
                        },
                        {
                            method: 'GET', path: '/api/v1/partner/me/transactions',
                            label: 'Transaction History', idem: false,
                            note: 'Your account transaction list',
                        },
                        {
                            method: 'POST', path: '/api/v1/partner/me/deposit',
                            label: 'Deposit', idem: true,
                            body: '{ "amount": 5000.00, "note": "Settlement" }',
                        },
                        {
                            method: 'POST', path: '/api/v1/partner/me/withdraw',
                            label: 'Withdraw', idem: true,
                            body: '{ "amount": 1000.00, "note": "Payout" }',
                        },
                        {
                            method: 'POST', path: '/api/v1/partner/me/transfer',
                            label: 'Transfer', idem: true,
                            body: '{ "accountNumber": "123456", "amount": 500.00, "note": "To merchant" }',
                        },
                    ].map(ep => (
                        <div key={ep.path} className="px-5 py-4 flex items-start gap-3">
                            <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-black font-mono mt-0.5 ${ep.method === 'GET' ? 'bg-blue-500/15 text-blue-400' : 'bg-orange-500/15 text-orange-400'
                                }`}>{ep.method}</span>
                            <div className="flex-1 min-w-0">
                                <code className="text-xs font-mono text-slate-300 block truncate">{ep.path}</code>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-[11px] text-slate-500">{ep.note || ep.body}</span>
                                    {ep.idem && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                                            Idempotency-Key required
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 4. Portal Endpoints (Bearer JWT) ───────────────────────────────── */}
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                <SectionHeader icon={BookOpen}
                    title="Partner Portal Endpoints (Bearer JWT)"
                    sub="Use Authorization: Bearer <portal-token> — from POST /partner/auth/login" />
                <div className="divide-y divide-white/5">
                    {[
                        { method: 'POST', path: '/api/v1/partner/auth/login', label: 'Login → returns PARTNER_PORTAL_TOKEN' },
                        { method: 'GET', path: '/api/v1/partner/portal/me', label: 'Get partner info, app status, apiKeyIssued' },
                        { method: 'POST', path: '/api/v1/partner/portal/keys/rotate-request', label: 'Request API key rotation (admin approves)' },
                        { method: 'GET', path: '/api/v1/partner/portal/keys/rotation-requests', label: 'View your rotation request history' },
                    ].map(ep => (
                        <div key={ep.path} className="px-5 py-3.5 flex items-start gap-3">
                            <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-black font-mono mt-0.5 ${ep.method === 'GET' ? 'bg-blue-500/15 text-blue-400' : 'bg-emerald-500/15 text-emerald-400'
                                }`}>{ep.method}</span>
                            <div className="min-w-0">
                                <code className="text-xs font-mono text-slate-300 block truncate">{ep.path}</code>
                                <p className="text-[11px] text-slate-500 mt-0.5">{ep.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 5. Key Rotation Request ────────────────────────────────────────── */}
            {!loading && !error && (
                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                    <button
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/3 transition-colors text-left"
                        onClick={() => { setShowRotation(v => !v); setRotationStatus(null); }}
                    >
                        <div className="flex items-center gap-2.5">
                            <RotateCcw size={15} className="text-slate-400" />
                            <span className="text-sm font-bold text-white">Request Key Rotation</span>
                        </div>
                        {showRotation
                            ? <ChevronUp size={15} className="text-slate-500" />
                            : <ChevronDown size={15} className="text-slate-500" />}
                    </button>

                    {showRotation && (
                        <div className="px-6 pb-6 border-t border-white/5 pt-4 space-y-3">
                            <p className="text-sm text-slate-400">
                                Submit a request if your key is lost or compromised. An admin will generate a new key and share it with you.
                            </p>
                            {rotationStatus === 'success' ? (
                                <div className="flex items-start gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <p className="text-emerald-300 text-sm">{rotationMsg}</p>
                                </div>
                            ) : (
                                <form onSubmit={submitRotation} className="space-y-3">
                                    <input
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500 transition-all placeholder:text-slate-600"
                                        placeholder="Reason (optional) — e.g. key compromised, lost key..."
                                        value={rotationReason}
                                        onChange={e => setRotationReason(e.target.value)}
                                    />
                                    {rotationStatus === 'error' && (
                                        <p className="text-red-400 text-xs flex items-center gap-1.5">
                                            <AlertTriangle size={12} /> {rotationMsg}
                                        </p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={rotationStatus === 'loading'}
                                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-sm shadow-lg shadow-orange-900/30 hover:from-orange-400 hover:to-red-500 transition-all active:scale-[0.98] disabled:opacity-60"
                                    >
                                        {rotationStatus === 'loading' ? 'Submitting…' : 'Submit Rotation Request'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* —— 6. Rotation Request History —————————————————— */}
            {!loading && !error && (
                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                    <button
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/3 transition-colors text-left"
                        onClick={toggleHistory}
                    >
                        <div className="flex items-center gap-2.5">
                            <History size={15} className="text-slate-400" />
                            <span className="text-sm font-bold text-white">My Rotation Requests</span>
                        </div>
                        {showHistory ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
                    </button>

                    {showHistory && (
                        <div className="border-t border-white/5">
                            {historyLoading ? (
                                <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
                                    <RefreshCw size={14} className="animate-spin" />
                                    <span className="text-sm">Loading history…</span>
                                </div>
                            ) : historyError ? (
                                <div className="px-6 py-4 text-sm text-red-400 flex items-center gap-2">
                                    <AlertTriangle size={14} /> {historyError}
                                </div>
                            ) : rotationHistory.length === 0 ? (
                                <div className="px-6 py-8 text-center text-slate-500 text-sm">
                                    No rotation requests submitted yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {rotationHistory.map((req) => (
                                        <div key={req.id} className="px-6 py-4 flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-300 truncate">{req.reason || <span className="italic text-slate-600">No reason provided</span>}</p>
                                                <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                                                    <Clock size={11} />
                                                    {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'Unknown date'}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${req.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                    : req.status === 'REJECTED' ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                }`}>{req.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
