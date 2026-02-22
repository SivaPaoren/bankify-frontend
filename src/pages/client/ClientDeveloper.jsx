import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { partnerService } from '../../api';
import {
    Copy, Eye, EyeOff, CheckCircle, AlertTriangle,
    Key, Zap, ShieldCheck, Globe, Code2
} from 'lucide-react';

export default function ClientDeveloper() {
    const { user } = useAuth();
    const [partnerInfo, setPartnerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const data = await partnerService.getPartnerInfo();
                setPartnerInfo(data);
            } catch (err) {
                console.error('Failed to fetch partner info', err);
                setError('Could not load partner info. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, []);

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2500);
    };

    const apiKey = partnerInfo?.apiKey || partnerInfo?.clientSecret || partnerInfo?.key;
    const clientId = partnerInfo?.id || partnerInfo?.clientId || user?.username;
    const status = partnerInfo?.status || 'ACTIVE';

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Developer Console</h1>
                <p className="text-slate-400 mt-1">Manage your API credentials for server-to-server integrations.</p>
            </div>

            {error && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3 text-yellow-400">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* API Credentials */}
            <div className="bg-white/3 border border-white/8 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <Key size={18} className="text-orange-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">API Credentials</h3>
                            <p className="text-sm text-slate-500">Use X-API-Key header for server-to-server requests</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border
                        ${status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        {status}
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Partner ID */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Partner ID</label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-black/30 border border-white/8 rounded-xl px-4 py-3 font-mono text-sm text-slate-300 overflow-hidden">
                                {loading ? (
                                    <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                                ) : (
                                    clientId || 'N/A'
                                )}
                            </div>
                            <button
                                onClick={() => handleCopy(clientId, 'id')}
                                className="p-3 text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-xl border border-white/8 transition-colors"
                                title="Copy ID"
                            >
                                {copied === 'id' ? <CheckCircle size={18} className="text-emerald-400" /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* API Key */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">API Key (X-API-Key)</label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <div className={`w-full bg-black/40 border border-white/8 text-orange-300 px-4 py-3 rounded-xl font-mono text-sm overflow-hidden transition-all ${!showKey ? 'blur-sm select-none' : ''}`}>
                                    {loading ? (
                                        <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
                                    ) : (
                                        showKey ? (apiKey || 'Not available — check backend') : '••••••••••••••••••••••••••••••••'
                                    )}
                                </div>
                                {!showKey && !loading && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-xs text-slate-500 font-medium bg-black/60 px-2 py-1 rounded-lg">Hidden for security</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="p-3 text-slate-500 hover:text-white hover:bg-white/8 rounded-xl border border-white/8 transition-colors"
                                title={showKey ? 'Hide Key' : 'Reveal Key'}
                            >
                                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <button
                                onClick={() => handleCopy(apiKey, 'key')}
                                className="p-3 text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-xl border border-white/8 transition-colors"
                                title="Copy Key"
                            >
                                {copied === 'key' ? <CheckCircle size={18} className="text-emerald-400" /> : <Copy size={18} />}
                            </button>
                        </div>
                        <p className="text-xs text-orange-400/70 flex items-center gap-1.5 mt-1">
                            <AlertTriangle size={11} />
                            Never expose your API key in frontend code. Keep it on your server.
                        </p>
                    </div>
                </div>
            </div>

            {/* Integration Guide */}
            <div className="bg-white/3 border border-white/8 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Code2 size={18} className="text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Quick Integration</h3>
                        <p className="text-sm text-slate-500">Example API calls with required headers</p>
                    </div>
                </div>
                <div className="p-6 space-y-5">

                    {/* Check Balance */}
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Check Balance</p>
                        <pre className="bg-black/40 border border-white/8 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                            {`GET /api/v1/partner/me/balance
X-API-Key: YOUR_API_KEY`}
                        </pre>
                    </div>

                    {/* Deposit */}
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Deposit</p>
                        <pre className="bg-black/40 border border-white/8 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                            {`POST /api/v1/partner/me/deposit
X-API-Key: YOUR_API_KEY
Idempotency-Key: unique-key-001

{ "amount": 500.00, "note": "Topup" }`}
                        </pre>
                    </div>

                    {/* Transfer */}
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Transfer</p>
                        <pre className="bg-black/40 border border-white/8 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                            {`POST /api/v1/partner/me/transfer
X-API-Key: YOUR_API_KEY
Idempotency-Key: unique-key-002

{ "accountNumber": "000123456789", "amount": 150.00, "note": "Payout" }`}
                        </pre>
                    </div>
                </div>
            </div>

            {/* Security Checklist */}
            <div className="bg-white/3 border border-white/8 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <ShieldCheck size={18} className="text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Security Best Practices</h3>
                        <p className="text-sm text-slate-500">Follow these to ensure safe integrations</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {[
                        { label: 'Always use HTTPS for API requests', icon: Globe },
                        { label: 'Rotate your API key if it gets exposed', icon: Key },
                        { label: 'Send a unique Idempotency-Key per transaction to avoid double charges', icon: Zap },
                        { label: 'Never send X-API-Key from the browser/frontend', icon: ShieldCheck },
                    ].map(item => (
                        <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <item.icon size={13} className="text-emerald-400" />
                            </div>
                            <p className="text-sm text-slate-300">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
