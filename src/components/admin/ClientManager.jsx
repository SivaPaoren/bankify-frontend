import React, { useEffect, useState } from 'react';
import { adminService } from '../../api';
import { Shield, Power, CheckCircle, XCircle, Clock, Search, X, Calendar, Info } from 'lucide-react';
import FilterDropdown from '../common/FilterDropdown';

export default function ClientManager() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [newKeyDialog, setNewKeyDialog] = useState({ open: false, key: '' });

    // Dossier Slide-Over
    const [selectedClient, setSelectedClient] = useState(null);

    const fetchClients = async () => {
        try {
            const data = await adminService.getClients();
            setClients(Array.isArray(data) ? data : (data.content || []));
        } catch (error) {
            console.error("Failed to fetch clients", error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await fetchClients();
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAction = async (clientId, currentStatus) => {
        try {
            if (currentStatus === 'PENDING') {
                const response = await adminService.approveClient(clientId);
                if (response?.apiKeyPlain) {
                    setNewKeyDialog({ open: true, key: response.apiKeyPlain });
                }
            } else if (currentStatus === 'ACTIVE') {
                await adminService.disableClient(clientId);
            } else {
                await adminService.activateClient(clientId);
            }
            closeDossier();
            fetchClients();
        } catch (e) {
            const errorMsg = e.response?.data?.message || e.message;
            alert(`Failed: ${errorMsg}`);
        }
    };

    const filteredClients = clients.filter(c => {
        if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
        if (searchTerm) {
            const t = searchTerm.toLowerCase();
            return c.name?.toLowerCase().includes(t) || c.id?.toLowerCase().includes(t);
        }
        return true;
    });

    const stats = {
        total: clients.length,
        active: clients.filter(c => c.status === 'ACTIVE').length,
        pending: clients.filter(c => c.status === 'PENDING').length,
        disabled: clients.filter(c => c.status === 'DISABLED').length,
    };

    const STATUS_CHIPS = [
        { key: 'ALL', label: 'All Status' },
        { key: 'ACTIVE', label: 'Active' },
        { key: 'PENDING', label: 'Pending' },
        { key: 'DISABLED', label: 'Disabled' },
    ];

    const closeDossier = () => {
        setSelectedClient(null);
        setKeyRevealed(false);
    };

    const formatDate = (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Partner Apps</h1>
                    <p className="text-primary-300 mt-1">Manage external access and evaluate incoming registration requests.</p>
                </div>
            </div>

            <div className="space-y-6 animate-fade-in">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                        <div className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">Total Apps</div>
                        <div className="text-3xl font-bold text-white">{stats.total}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                        <div className="text-xs text-emerald-400/80 uppercase tracking-widest font-bold mb-1">Active</div>
                        <div className="text-3xl font-bold text-emerald-400">{stats.active}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                        <div className="text-xs text-amber-400/80 uppercase tracking-widest font-bold mb-1">Pending</div>
                        <div className="text-3xl font-bold text-amber-400">{stats.pending}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                        <div className="text-xs text-red-400/80 uppercase tracking-widest font-bold mb-1">Disabled</div>
                        <div className="text-3xl font-bold text-red-400">{stats.disabled}</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white/3 border border-white/10 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-3 bg-black/20 px-4 py-2.5 rounded-xl border border-white/10 focus-within:border-cyan-500 focus-within:bg-black/30 transition-all flex-1 min-w-0 group">
                        <Search size={18} className="text-primary-400 group-focus-within:text-cyan-400 transition-colors shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by name or App ID..."
                            className="bg-transparent outline-none text-white w-full placeholder:text-primary-500 text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 ml-auto shrink-0">
                        <FilterDropdown
                            label="Status"
                            options={STATUS_CHIPS}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            counts={{
                                ACTIVE: stats.active,
                                PENDING: stats.pending,
                                DISABLED: stats.disabled
                            }}
                        />
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
                                    <th className="px-6 py-4">Registered On</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredClients.length > 0 ? filteredClients.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                                        onClick={() => { setSelectedClient(row); setKeyRevealed(false); }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/10 flex items-center justify-center font-bold shadow-inner">
                                                    {row.name.charAt(0).toUpperCase()}
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
                                        <td className="px-6 py-4 text-sm text-primary-400 font-mono">
                                            {formatDate(row.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAction(row.id, row.status);
                                                }}
                                                className={`p-2 rounded-xl transition-all ${row.status === 'ACTIVE'
                                                    ? 'text-primary-300 hover:text-red-400 hover:bg-red-500/10'
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
                                        <td colSpan="5" className="px-6 py-12 text-center text-primary-400/60 italic">
                                            {loading ? 'SYNCING DATA...' : 'NO CLIENTS FOUND'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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

            {/* PARTNER DOSSIER SLIDE-OVER */}
            {selectedClient && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={closeDossier}></div>
                    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-primary-950 border-l border-white/10 shadow-2xl z-50 transform transition-transform flex flex-col pt-16 md:pt-0">

                        {/* Dossier Header */}
                        <div className="p-6 border-b border-white/5 bg-[#0b1121] flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${selectedClient.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : selectedClient.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {selectedClient.status}
                                    </span>
                                    <span className="text-xs text-primary-400 font-mono">ID: {selectedClient.id?.substring(0, 8)}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">{selectedClient.name}</h2>
                            </div>
                            <button onClick={closeDossier} className="text-primary-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Dossier Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                            {/* API Secret — key is only shown once at approval or rotation, stored as hash only */}

                            {/* App Details */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary-400 flex items-center gap-2">
                                    <Info size={14} /> App Details
                                </h3>
                                <div className="bg-white/5 border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden">
                                    <div className="flex justify-between items-center px-4 py-3 text-sm">
                                        <span className="text-primary-400">Full App ID</span>
                                        <code className="text-xs font-mono text-primary-100 bg-black/30 px-2 py-0.5 rounded border border-white/5 max-w-[200px] truncate" title={selectedClient.id}>
                                            {selectedClient.id}
                                        </code>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3 text-sm">
                                        <span className="text-primary-400">Registered On</span>
                                        <span className="text-white font-mono text-xs">{formatDate(selectedClient.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3 text-sm">
                                        <span className="text-primary-400">Current Status</span>
                                        <span className={`text-xs font-bold uppercase ${selectedClient.status === 'ACTIVE' ? 'text-emerald-400' : selectedClient.status === 'PENDING' ? 'text-amber-400' : 'text-red-400'}`}>
                                            {selectedClient.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Key Management Info */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary-400 flex items-center gap-2">
                                    <Calendar size={14} /> Key Management
                                </h3>
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-sm text-primary-300 space-y-2">
                                    <p>API keys are generated <strong className="text-white">once</strong> at approval time and stored only as a secure hash.</p>
                                    <p className="text-primary-500 text-xs">To rotate a key, the partner must submit a rotation request. Navigate to <strong className="text-primary-300">Security Approvals</strong> to manage pending requests.</p>
                                </div>
                            </div>
                        </div>

                        {/* Dossier Footer */}
                        <div className="p-6 border-t border-white/5 bg-black/20">
                            {selectedClient.status === 'PENDING' && (
                                <button
                                    onClick={() => handleAction(selectedClient.id, 'PENDING')}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl font-bold transition-all"
                                >
                                    <CheckCircle size={18} /> Approve This App
                                </button>
                            )}
                            {selectedClient.status === 'ACTIVE' && (
                                <button
                                    onClick={() => handleAction(selectedClient.id, 'ACTIVE')}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl font-bold transition-all"
                                >
                                    <Power size={18} /> Emergency Kill Switch
                                </button>
                            )}
                            {selectedClient.status === 'DISABLED' && (
                                <button
                                    onClick={() => handleAction(selectedClient.id, 'DISABLED')}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl font-bold transition-all"
                                >
                                    <CheckCircle size={18} /> Restore Client Access
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
