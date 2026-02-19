import React, { useEffect, useState } from 'react';
import { adminService } from '../../api';
import { Shield, Plus, Power, CheckCircle, XCircle } from 'lucide-react';

export default function ClientManager() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClientName, setNewClientName] = useState('');

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

    const handleToggleStatus = async (clientId, currentStatus) => {
        try {
            await adminService.disableClient(clientId);
            fetchClients();
        } catch (e) {
            alert("Failed to update status");
        }
    };

    const handleCreateClient = async (e) => {
        e.preventDefault();
        try {
            await adminService.createClient(newClientName);
            setNewClientName('');
            setShowCreateModal(false);
            fetchClients();
        } catch (e) {
            alert("Failed to create client");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">API Clients</h1>
                    <p className="text-primary-300 mt-1">Manage external access and API keys.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(!showCreateModal)}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    <Plus size={20} />
                    New Client
                </button>
            </div>

            {showCreateModal && (
                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/10 animate-page relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                    <h3 className="font-bold text-white mb-4 relative z-10">Register New Client Application</h3>
                    <form onSubmit={handleCreateClient} className="flex gap-4 relative z-10">
                        <input
                            type="text"
                            placeholder="Client Application Name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none text-white placeholder:text-primary-400 focus:border-emerald-500 focus:bg-black/40 transition-all focus:ring-1 focus:ring-emerald-500/50"
                            required
                        />
                        <button type="submit" className="bg-emerald-500 text-white font-bold px-6 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg">
                            Create
                        </button>
                    </form>
                </div>
            )}

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
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {row.status === 'ACTIVE' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(row.id, row.status)}
                                            className={`p-2 rounded-xl transition-all ${row.status === 'ACTIVE'
                                                ? 'text-primary-300 hover:text-red-400 hover:bg-red-500/10'
                                                : 'text-primary-300 hover:text-emerald-400 hover:bg-emerald-500/10'
                                                }`}
                                            title={row.status === 'ACTIVE' ? "Revoke Access" : "Grant Access"}
                                        >
                                            <Power size={16} />
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
