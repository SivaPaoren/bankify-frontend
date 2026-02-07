import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
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
                    <h1 className="text-2xl font-bold text-slate-900">API Clients</h1>
                    <p className="text-slate-500">Manage external access and API keys.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(!showCreateModal)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold transition shadow-lg shadow-emerald-200"
                >
                    <Plus size={20} />
                    New Client
                </button>
            </div>

            {showCreateModal && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 animate-page">
                    <h3 className="font-bold text-slate-800 mb-4">Register New Client</h3>
                    <form onSubmit={handleCreateClient} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Client Application Name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white transition"
                            required
                        />
                        <button type="submit" className="bg-emerald-500 text-white font-bold px-6 rounded-xl hover:bg-emerald-600">
                            Create
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-6 py-4">Client Name</th>
                                <th className="px-6 py-4">API Key Prefix</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {clients.length > 0 ? clients.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                                {row.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-slate-700">{row.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-500">
                                            {row.apiKey ? row.apiKey.substring(0, 8) + '...' : 'N/A'}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${row.status === 'ACTIVE'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                            {row.status === 'ACTIVE' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(row.id, row.status)}
                                            className={`p-2 rounded-lg transition-colors ${row.status === 'ACTIVE'
                                                    ? 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                                    : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'
                                                }`}
                                        >
                                            <Power size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic">
                                        {loading ? 'Loading clients...' : 'No clients found.'}
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
