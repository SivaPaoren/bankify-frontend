import React, { useEffect, useState } from 'react';
import { adminService } from '../../api';
import { Shield, Power, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ClientManager() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newKeyDialog, setNewKeyDialog] = useState({ open: false, key: '' });

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await adminService.getClients();
            setClients(Array.isArray(data) ? data : (data.content || []));
        } catch (error) {
            console.error("Failed to fetch clients", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleAction = async (clientId, currentStatus) => {
        try {
            if (currentStatus === 'PENDING') {
                const response = await adminService.approveClient(clientId);
                if (response?.apiKey) {
                    setNewKeyDialog({ open: true, key: response.apiKey });
                }
            } else if (currentStatus === 'ACTIVE') {
                await adminService.disableClient(clientId);
            } else {
                await adminService.activateClient(clientId);
            }
            fetchClients();
        } catch (e) {
            const errorMsg = e.response?.data?.message || e.message;
            alert(`Failed: ${errorMsg}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">API Clients</h1>
                    <p className="text-primary-300 mt-1">Manage external access and evaluate incoming registration requests.</p>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold">
                                <th className="px-6 py-4">Client Name</th>
                                <th className="px-6 py-4">App ID</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {clients.length > 0 ? clients.map((row) => (
                                <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/10 flex items-center justify-center font-bold shadow-inner">
                                                {row.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">{row.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="bg-black/30 px-2.5 py-1 rounded-lg text-xs font-mono text-primary-100 border border-white/5">
                                            {row.id ? row.id.substring(0, 8).toUpperCase() : 'N/A'}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${row.status === 'ACTIVE'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : row.status === 'PENDING'
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {row.status === 'ACTIVE' && <CheckCircle size={10} />}
                                            {row.status === 'PENDING' && <Clock size={10} />}
                                            {row.status !== 'ACTIVE' && row.status !== 'PENDING' && <XCircle size={10} />}
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleAction(row.id, row.status)}
                                            className={`p-2 rounded-xl transition-all ${row.status === 'ACTIVE'
                                                ? 'text-primary-300 hover:text-red-400 hover:bg-red-500/10'
                                                : row.status === 'PENDING'
                                                    ? 'text-primary-300 hover:text-emerald-400 hover:bg-emerald-500/10'
                                                    : 'text-primary-300 hover:text-emerald-400 hover:bg-emerald-500/10'
                                                }`}
                                            title={row.status === 'ACTIVE' ? "Revoke Access" : row.status === 'PENDING' ? "Approve Client" : "Grant Access"}
                                        >
                                            {row.status === 'PENDING' ? <CheckCircle size={16} /> : <Power size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-primary-400/60 italic">
                                        {loading ? 'SYNCING DATA...' : 'NO CLIENTS FOUND'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ONE-TIME RECORD API KEY MODAL */}
            {newKeyDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div className="bg-primary-900 border border-emerald-500/30 rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="flex justify-center mb-5 relative z-10">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                <Shield size={32} className="text-emerald-400" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white text-center mb-2 relative z-10">Client Approved!</h2>
                        <p className="text-primary-300 text-center text-sm mb-6 relative z-10">
                            The Client App has been approved. The following API Key was generated. <br />
                            <span className="text-amber-400 font-bold">This is the ONLY time it will be shown.</span> Please copy and securely forward it to the partner.
                        </p>

                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-8 flex flex-col items-center justify-center relative z-10">
                            <code className="text-emerald-400 font-mono text-lg tracking-wider break-all text-center selection:bg-emerald-500/30">
                                {newKeyDialog.key}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(newKeyDialog.key);
                                    alert("API Key copied to clipboard!");
                                }}
                                className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-primary-200 text-xs font-bold uppercase tracking-wider rounded-lg border border-white/10 transition-colors"
                            >
                                Copy to Clipboard
                            </button>
                        </div>

                        <div className="flex justify-center relative z-10">
                            <button
                                onClick={() => setNewKeyDialog({ open: false, key: '' })}
                                className="px-8 py-3 rounded-xl border border-white/10 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                            >
                                I have copied the Key safely
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
