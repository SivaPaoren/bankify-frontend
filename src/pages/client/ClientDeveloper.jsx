import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clientService } from '../../services/api';
import { Copy, Eye, EyeOff, Globe, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function ClientDeveloper() {
    const { user } = useAuth();
    const [clientData, setClientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSecret, setShowSecret] = useState(false);
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        // Fetch current client data
        // Assuming clientService.me() or similar exists, otherwise fallback to user
        const fetchClient = async () => {
            try {
                // In a real scenario, we'd fetch the secure details here.
                // For now, we might simulate or use what's available.
                // If api.js doesn't have a specific 'me' endpoint for clients, we might need to rely on local state or adding one.
                // Mocking structure for display based on requirements:
                setClientData({
                    clientId: user?.username || 'client_id_placeholder',
                    clientSecret: 'sk_live_Pm8...92z', // Mock for UI
                    status: 'ACTIVE',
                    webhookUrl: 'https://api.yourbusiness.com/webhooks/bankify',
                    environment: 'LIVE'
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [user]);

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-8 animate-page">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Developer Console</h1>
                <p className="text-slate-500">Manage your API credentials and webhook integrations.</p>
            </header>

            {/* API Credentials Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">API Credentials</h3>
                        <p className="text-sm text-slate-500">Use these keys to authenticate API requests.</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {clientData?.environment || 'LIVE'} Environment
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Client ID */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Client ID</label>
                        <div className="flex gap-2">
                            <code className="flex-1 bg-slate-100 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-mono text-sm">
                                {clientData?.clientId}
                            </code>
                            <button
                                onClick={() => handleCopy(clientData?.clientId, 'id')}
                                className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors relative group"
                                title="Copy Client ID"
                            >
                                {copied === 'id' ? <CheckCircle size={20} className="text-emerald-500" /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Client Secret */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Client Secret</label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <code className={`block w-full bg-slate-900 border border-slate-800 text-emerald-400 px-4 py-3 rounded-xl font-mono text-sm overflow-hidden ${!showSecret && 'blur-sm select-none'}`}>
                                    {showSecret ? clientData?.clientSecret : '••••••••••••••••••••••••••••••••'}
                                </code>
                                {!showSecret && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs text-slate-500 font-medium bg-slate-900/80 px-2 py-1 rounded">Hidden for security</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setShowSecret(!showSecret)}
                                className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                                title={showSecret ? "Hide Secret" : "Reveal Secret"}
                            >
                                {showSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                            <button
                                onClick={() => handleCopy(clientData?.clientSecret, 'secret')}
                                className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors"
                                title="Copy Secret"
                            >
                                {copied === 'secret' ? <CheckCircle size={20} className="text-emerald-500" /> : <Copy size={20} />}
                            </button>
                        </div>
                        <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                            <AlertTriangle size={12} />
                            Never share your client secret. Keep it secure on your backend.
                        </p>
                    </div>
                </div>
            </div>

            {/* Webhooks Configuration */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Globe size={20} className="text-slate-400" />
                        Webhooks
                    </h3>
                    <button className="text-sm text-emerald-600 font-bold hover:underline flex items-center gap-1">
                        <RefreshCw size={14} /> Test Delivery
                    </button>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Events URL</label>
                            <input
                                type="url"
                                value={clientData?.webhookUrl || ''}
                                readOnly
                                className="w-full bg-slate-50 border border-slate-200 text-slate-600 px-4 py-3 rounded-xl font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <h4 className="text-sm font-bold text-slate-700 mb-3">Recent Deliveries</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-200 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <span className="font-mono text-slate-600">evt_tx_19283</span>
                                    </div>
                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">200 OK</span>
                                </div>
                                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-200 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <span className="font-mono text-slate-600">evt_tx_19284</span>
                                    </div>
                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">200 OK</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
