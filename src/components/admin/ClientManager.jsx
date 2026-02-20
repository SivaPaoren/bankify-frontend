import React, { useEffect, useState } from 'react';
import { adminService } from '../../api';
import { Shield, Power, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ClientManager() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

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
                await adminService.approveClient(clientId);
            } else if (currentStatus === 'ACTIVE') {
                await adminService.disableClient(clientId);
            } else {
                await adminService.activateClient(clientId);
            }
            fetchClients();
        } catch (e) {
            alert(`Failed to update status for client ${clientId}`);
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
                                <th className="px-6 py-4">API Key Prefix</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {clients.length > 0 ? clients.map((row) => (
                                <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/10 flex items-center justify-center font-bold shadow-inner">
                                                {row.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">{row.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="bg-black/30 px-2.5 py-1 rounded-lg text-xs font-mono text-primary-100 border border-white/5">
                                            {row.apiKey ? row.apiKey.substring(0, 8) + '...' : 'N/A'}
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
        </div>
    );
}
