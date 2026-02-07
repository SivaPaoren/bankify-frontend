import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Table from '../common/Table';
import StatusBadge from '../common/StatusBadge';
import { Copy, Plus, AlertTriangle } from 'lucide-react';

export default function ClientManager() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newApiKey, setNewApiKey] = useState(null);
    const [error, setError] = useState('');

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await adminService.getClients();
            setClients(data);
        } catch (err) {
            console.error("Failed to fetch clients", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleCreateClient = async (e) => {
        e.preventDefault();
        setError('');
        setNewApiKey(null);

        try {
            const data = await adminService.createClient(newClientName);
            setNewApiKey(data.apiKey); // Show once
            setNewClientName('');
            fetchClients(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create client');
        }
    };

    const handleDisable = async (clientId) => {
        if (!window.confirm('Are you sure you want to disable this client?')) return;
        try {
            await adminService.disableClient(clientId);
            fetchClients();
        } catch (err) {
            alert('Failed to disable client');
        }
    };

    const columns = [
        { key: 'name', label: 'Client Name' },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'createdAt', label: 'Created At', render: (row) => new Date(row.createdAt).toLocaleDateString() },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => row.status === 'ACTIVE' ? (
                <button
                    onClick={() => handleDisable(row.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                    Disable
                </button>
            ) : <span className="text-slate-400 text-sm">Disabled</span>
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">API Clients</h2>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    <Plus size={16} /> New Client
                </button>
            </div>

            {showCreate && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-fade-in relative">
                    <button
                        onClick={() => { setShowCreate(false); setNewApiKey(null); }}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    >
                        ✕
                    </button>

                    <h3 className="font-semibold text-lg mb-4">Register New API Client</h3>

                    {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

                    {!newApiKey ? (
                        <form onSubmit={handleCreateClient} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Client Name / Team</label>
                                <input
                                    type="text"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                    placeholder="e.g. Mobile App Team"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-medium"
                            >
                                Generate Key
                            </button>
                        </form>
                    ) : (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-full text-green-700">
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-green-900 text-sm uppercase tracking-wide mb-1">API Key Generated</h4>
                                    <p className="text-green-800 text-sm mb-3">
                                        Copy this key now. You will create it only once. It cannot be retrieved later.
                                    </p>
                                    <div className="flex items-center gap-2 bg-white border border-green-200 rounded px-3 py-2 font-mono text-sm break-all">
                                        <span className="flex-1 text-slate-700">{newApiKey}</span>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(newApiKey)}
                                            className="text-slate-400 hover:text-primary-600 transition"
                                            title="Copy to clipboard"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Table columns={columns} data={clients} />
        </div>
    );
}
