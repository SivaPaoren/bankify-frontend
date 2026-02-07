import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { Shield, Plus, MoreHorizontal, Power, CheckCircle, XCircle } from 'lucide-react';
import Table from '../common/Table'; // We will assume generic table works or needs update in next step if broken styled

export default function ClientManager() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false); // Placeholder for modal logic
    const [newClientName, setNewClientName] = useState('');

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await adminService.getClients();
            // Handle array or pageable content
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
            // Optimistic update or refetch
            // Assumes API has disable/enable toggle or distinct endpoints
            await adminService.disableClient(clientId);
            fetchClients(); // Refetch to be safe
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

    // Columns configuration
    const columns = [
        {
            key: 'name',
            label: 'Client Name',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        {row.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-700">{row.name}</span>
                </div>
            )
        },
        {
            key: 'apiKey',
            label: 'API Key Prefix',
            render: (row) => <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-500">{row.apiKey ? row.apiKey.substring(0, 8) + '...' : 'N/A'}</code>
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${row.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                    {row.status === 'ACTIVE' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {row.status}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <button
                    onClick={() => handleToggleStatus(row.id, row.status)}
                    title={row.status === 'ACTIVE' ? "Disable Client" : "Enable Client"}
                    className={`p-2 rounded-lg transition-colors ${row.status === 'ACTIVE'
                            ? 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                            : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'
                        }`}
                >
                    <Power size={18} />
                </button>
            )
        }
    ];

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

            {/* Create Modal Area (Embedded for simplicity) */}
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
                <div className="p-0">
                    {/* Table Wrapper to ensure correct styling for standard Table component */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    {columns.map(col => (
                                        <th key={col.key} className="px-6 py-4">{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {clients.length > 0 ? clients.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        {columns.map(col => (
                                            <td key={col.key} className="px-6 py-4 text-sm text-slate-600">
                                                {col.render ? col.render(row) : row[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-400 italic">
                                            {loading ? 'Loading clients...' : 'No clients found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
