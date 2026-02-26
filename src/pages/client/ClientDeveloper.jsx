import React, { useState, useEffect } from 'react';
import { partnerService } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
    Key, Copy, CheckCircle, RefreshCw, RotateCcw,
    ShieldCheck, AlertTriangle, Lock, ChevronDown, ChevronUp,
    Clock, LogOut
} from 'lucide-react';

export default function ClientDeveloper() {
    const { logout } = useAuth();

    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false);

    const [copied, setCopied] = useState(null);

    // Rotation form
    const [showRotation, setShowRotation] = useState(false);
    const [rotationReason, setRotationReason] = useState('');
    const [rotationStatus, setRotationStatus] = useState(null); // null | 'loading' | 'success' | 'error'
    const [rotationMsg, setRotationMsg] = useState('');

    // Rotation history
    const [showHistory, setShowHistory] = useState(false);
    const [rotationHistory, setRotationHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const fetchInfo = async () => {
        setLoading(true);
        setError(null);
        setSessionExpired(false);
        try {
            const data = await partnerService.getPartnerInfo();
            setInfo(data);
        } catch (err) {
            const status = err.response?.status;
            if (status === 401 || status === 403) {
                setSessionExpired(true);
            } else {
                setError('Could not load app info. Please try again.');
            }
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
            setRotationMsg('Request submitted. An admin will review and share your new key.');
            setRotationReason('');
        } catch (err) {
            setRotationStatus('error');
            setRotationMsg(err.response?.data?.message || 'Failed to submit request.');
        }
    };

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const data = await partnerService.getRotationHistory();
            setRotationHistory(Array.isArray(data) ? data : []);
        } catch (_) { }
        finally { setHistoryLoading(false); }
    };

    const toggleHistory = () => {
        const next = !showHistory;
        setShowHistory(next);
        if (next && rotationHistory.length === 0 && !historyLoading) fetchHistory();
    };

    const partnerId = info?.partnerAppId ? String(info.partnerAppId) : null;
    const appStatus = info?.appStatus;
    const apiKeyIssued = info?.apiKeyIssued;
    const appName = info?.appName;

    // ── Session Expired State ─────────────────────────────────────────────────
    if (sessionExpired) {
        return (
            <div className="max-w-xl mx-auto mt-16 space-y-6 text-center">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                    <Lock size={36} className="text-amber-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Session Expired</h2>
                    <p className="text-slate-400 text-sm mt-2">
                        Your portal session has expired. Please log out and log back in to access your API credentials.
                    </p>
                </div>
                <button
                    onClick={logout}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 font-bold transition-all"
                >
                    <LogOut size={16} /> Log Out & Re-authenticate
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-6">

            {/* ── Header ────────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">API Console</h1>
                    <p className="text-slate-400 mt-1 text-sm">{appName ? `${appName} — ` : ''}Your API credentials and key management.</p>
                </div>
                <button
                    onClick={fetchInfo}
                    disabled={loading}
                    title="Refresh"
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <RefreshCw size={15} className={loading ? 'animate-spin text-orange-400' : ''} />
                </button>
            </div>

            {error && (
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-amber-300 text-sm">{error}</p>
                </div>
            )}

            {/* ── App Status Card ────────────────────────────────────────────── */}
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Key size={15} className="text-orange-400" /> API Credentials
                    </div>
                    {!loading && appStatus && (
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${appStatus === 'ACTIVE'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : appStatus === 'PENDING'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {appStatus === 'ACTIVE' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5 align-middle" />}
                            {appStatus}
                        </span>
                    )}
                </div>

                <div className="divide-y divide-white/5">
                    {/* Partner ID */}
                    <div className="px-6 py-4">
                        <p className="text-[11px] font-bold uppercase text-slate-500 tracking-widest mb-2">Partner / App ID</p>
                        {loading ? (
                            <div className="h-10 bg-white/3 rounded-xl animate-pulse" />
                        ) : (
                            <div className="flex items-center gap-2 bg-black/40 border border-white/8 rounded-xl px-4 py-3">
                                <code className="flex-1 text-sm font-mono text-slate-200 truncate">
                                    {partnerId || 'Not available'}
                                </code>
                                {partnerId && (
                                    <button
                                        onClick={() => copy(partnerId, 'id')}
                                        className="shrink-0 text-slate-500 hover:text-orange-400 transition-colors p-1"
                                        title="Copy"
                                    >
                                        {copied === 'id'
                                            ? <CheckCircle size={14} className="text-emerald-400" />
                                            : <Copy size={14} />}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* API Key Status */}
                    <div className="px-6 py-4">
                        <p className="text-[11px] font-bold uppercase text-slate-500 tracking-widest mb-2">X-API-Key (Server-to-Server)</p>
                        {loading ? (
                            <div className="h-12 bg-white/3 rounded-xl animate-pulse" />
                        ) : apiKeyIssued === true ? (
                            <div className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-4 py-3">
                                <ShieldCheck size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-emerald-300 text-sm font-semibold">API Key is active</p>
                                    <p className="text-slate-500 text-xs mt-0.5">
                                        Your key was issued at approval time and is stored only as a hash — it cannot be retrieved.
                                        Lost your key? Use <span className="text-orange-300">Request Key Rotation</span> below.
                                    </p>
                                </div>
                            </div>
                        ) : appStatus === 'PENDING' ? (
                            <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3">
                                <Clock size={15} className="text-amber-400 shrink-0" />
                                <p className="text-amber-300 text-sm">Awaiting admin approval — your API key will be issued once approved.</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3">
                                <AlertTriangle size={15} className="text-red-400 shrink-0" />
                                <p className="text-red-300 text-sm">No API key — contact support.</p>
                            </div>
                        )}
                    </div>

                    {/* How to use */}
                    {!loading && apiKeyIssued && (
                        <div className="px-6 py-4">
                            <p className="text-[11px] font-bold uppercase text-slate-500 tracking-widest mb-2">Required Header (All API Calls)</p>
                            <div className="flex items-center gap-2 bg-black/40 border border-white/8 rounded-xl px-4 py-3">
                                <code className="flex-1 text-sm font-mono text-orange-300">X-API-Key: &lt;your-api-key&gt;</code>
                                <button
                                    onClick={() => copy('X-API-Key: <your-api-key>', 'header')}
                                    className="shrink-0 text-slate-500 hover:text-orange-400 transition-colors p-1"
                                    title="Copy"
                                >
                                    {copied === 'header'
                                        ? <CheckCircle size={14} className="text-emerald-400" />
                                        : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Request Key Rotation ──────────────────────────────────────────── */}
            {!loading && !error && (
                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                    <button
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/3 transition-colors text-left"
                        onClick={() => { setShowRotation(v => !v); setRotationStatus(null); }}
                    >
                        <div className="flex items-center gap-2.5">
                            <RotateCcw size={15} className="text-slate-400" />
                            <div>
                                <span className="text-sm font-bold text-white">Request Key Rotation</span>
                                <p className="text-xs text-slate-500 mt-0.5">Lost or compromised your key? Request a replacement.</p>
                            </div>
                        </div>
                        {showRotation
                            ? <ChevronUp size={15} className="text-slate-500 shrink-0" />
                            : <ChevronDown size={15} className="text-slate-500 shrink-0" />}
                    </button>

                    {showRotation && (
                        <div className="px-6 pb-6 border-t border-white/5 pt-4 space-y-3">
                            {rotationStatus === 'success' ? (
                                <div className="flex items-start gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <p className="text-emerald-300 text-sm">{rotationMsg}</p>
                                </div>
                            ) : (
                                <form onSubmit={submitRotation} className="space-y-3">
                                    <textarea
                                        rows={2}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500 transition-all placeholder:text-slate-600 resize-none"
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
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-sm shadow-lg shadow-orange-900/30 hover:from-orange-400 hover:to-red-500 transition-all active:scale-[0.98] disabled:opacity-60"
                                    >
                                        {rotationStatus === 'loading' ? 'Submitting…' : 'Submit Rotation Request'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Rotation History ──────────────────────────────────────────────── */}
            {!loading && !error && (
                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                    <button
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/3 transition-colors text-left"
                        onClick={toggleHistory}
                    >
                        <div className="flex items-center gap-2.5">
                            <Clock size={15} className="text-slate-400" />
                            <span className="text-sm font-bold text-white">Rotation Request History</span>
                        </div>
                        {showHistory
                            ? <ChevronUp size={15} className="text-slate-500 shrink-0" />
                            : <ChevronDown size={15} className="text-slate-500 shrink-0" />}
                    </button>

                    {showHistory && (
                        <div className="border-t border-white/5">
                            {historyLoading ? (
                                <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
                                    <RefreshCw size={14} className="animate-spin" />
                                    <span className="text-sm">Loading…</span>
                                </div>
                            ) : rotationHistory.length === 0 ? (
                                <p className="px-6 py-8 text-center text-slate-500 text-sm">No rotation requests yet.</p>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {rotationHistory.map((req) => (
                                        <div key={req.id} className="px-6 py-4 flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-300 truncate">
                                                    {req.reason || <span className="italic text-slate-600">No reason provided</span>}
                                                </p>
                                                <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                                                    <Clock size={11} />
                                                    {req.createdAt ? new Date(req.createdAt).toLocaleString() : '—'}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${req.status === 'APPROVED'
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                    : req.status === 'REJECTED'
                                                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
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
