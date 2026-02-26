import React, { useEffect, useState } from 'react';
import { adminService } from '../../api';
import { 
    Shield, Power, CheckCircle, XCircle, Clock, Search, 
    RefreshCw, Key, Eye, Lock, X, BarChart3, Globe,
    ArrowRightLeft, AlertCircle
} from 'lucide-react';
import FilterDropdown from '../common/FilterDropdown';

export default function ClientManager() {
    const [activeTab, setActiveTab] = useState('partners'); // 'partners' or 'rotations'
    const [clients, setClients] = useState([]);
    const [rotations, setRotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [newKeyDialog, setNewKeyDialog] = useState({ open: false, key: '' });

    // Dossier Slide-Over State
    const [selectedClient, setSelectedClient] = useState(null);
    const [revealState, setRevealState] = useState('hidden');
    const [adminPassword, setAdminPassword] = useState('');

    const fetchClients = async () => {
        try {
            const data = await adminService.getClients();
            setClients(Array.isArray(data) ? data : (data.content || []));
        } catch (error) {
            console.error("Failed to fetch clients", error);
        }
    };

    const fetchRotations = async () => {
        try {
            const data = await adminService.listRotationRequests();
            setRotations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch rotations", error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchClients(), fetchRotations()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
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
            alert(`Failed: ${e.response?.data?.message || e.message}`);
        }
    };

    const handleRotationAction = async (rotationId, action) => {
        try {
            if (action === 'approve') {
                const response = await adminService.approveKeyRotation(rotationId);
                if (response?.apiKey) {
                    setNewKeyDialog({ open: true, key: response.apiKey });
                }
            } else {
                await adminService.rejectKeyRotation(rotationId);
            }
            loadData();
        } catch (e) {
            alert(`Failed: ${e.response?.data?.message || e.message}`);
        }
    };

    const stats = {
        total: clients.length,
        active: clients.filter(c => c.status === 'ACTIVE').length,
        pending: clients.filter(c => c.status === 'PENDING').length,
        rotations: rotations.filter(r => r.status === 'PENDING').length,
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Partner Management</h1>
                    <p className="text-primary-300 mt-1">Review registrations and security rotation requests.</p>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                    <div className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">Total Apps</div>
                    <div className="text-3xl font-bold text-white">{stats.total}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                    <div className="text-xs text-emerald-400 uppercase tracking-widest font-bold mb-1">Active</div>
                    <div className="text-3xl font-bold text-emerald-400">{stats.active}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                    <div className="text-xs text-amber-400 uppercase tracking-widest font-bold mb-1">Pending Apps</div>
                    <div className="text-3xl font-bold text-amber-400">{stats.pending}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                    <div className="text-xs text-orange-400 uppercase tracking-widest font-bold mb-1">Pending Rotations</div>
                    <div className="text-3xl font-bold text-orange-400">{stats.rotations}</div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-white/10 space-x-8">
                <button 
                    onClick={() => setActiveTab('partners')}
                    className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'partners' ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                >
                    Partner Apps
                </button>
                <button 
                    onClick={() => setActiveTab('rotations')}
                    className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'rotations' ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                >
                    Rotation Requests
                    {stats.rotations > 0 && (
                        <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">{stats.rotations}</span>
                    )}
                </button>
            </div>

            {activeTab === 'partners' ? (
                <div className="space-y-6">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-3 items-center bg-white/3 border border-white/10 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-3 bg-black/20 px-4 py-2.5 rounded-xl border border-white/10 focus-within:border-cyan-500 transition-all flex-1 group">
                            <Search size={18} className="text-primary-400 group-focus-within:text-cyan-400" />
                            <input
                                type="text"
                                placeholder="Search apps..."
                                className="bg-transparent outline-none text-white w-full text-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Partners Table */}
                    <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold">
                                    <th className="px-6 py-4">Client Name</th>
                                    <th className="px-6 py-4">App ID</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {clients.map((row) => (
                                    <tr key={row.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedClient(row)}>
                                        <td className="px-6 py-4 font-bold text-white">{row.name}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-primary-300">{row.id?.substring(0, 8)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${row.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={(e) => { e.stopPropagation(); handleAction(row.id, row.status); }} className="p-2 text-primary-400 hover:text-white">
                                                {row.status === 'PENDING' ? <CheckCircle size={18} /> : <Power size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Rotations Table */
                <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold">
                                <th className="px-6 py-4">App Name</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Requested Date</th>
                                <th className="px-6 py-4 text-right">Decision</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {rotations.length > 0 ? rotations.map((req) => (
                                <tr key={req.id} className="text-sm">
                                    <td className="px-6 py-4 text-white font-bold">{req.partnerAppName}</td>
                                    <td className="px-6 py-4 text-primary-300 max-w-xs truncate">{req.reason}</td>
                                    <td className="px-6 py-4 text-primary-400 font-mono text-xs">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === 'PENDING' ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleRotationAction(req.id, 'reject')} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                                                    <XCircle size={18} />
                                                </button>
                                                <button onClick={() => handleRotationAction(req.id, 'approve')} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg">
                                                    <CheckCircle size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`text-[10px] font-bold uppercase ${req.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {req.status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">No rotation requests found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ONE-TIME API KEY MODAL */}
            {/* In src/components/admin/ClientManager.jsx */}
            {newKeyDialog.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-10 w-full max-w-xl shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                                <Shield size={40} className="text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">New API Key Generated!</h2>
                            <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-6">Action Required: Secure Hand-off</p>
                            
                            <div className="bg-black/50 border border-white/10 rounded-2xl p-6 w-full mb-8">
                                <p className="text-slate-400 text-xs mb-4 uppercase font-bold italic">
                                    This key is NOT stored in the database. You must copy and send it to the partner now.
                                </p>
                                <code className="text-2xl text-white font-mono break-all block select-all">
                                    {newKeyDialog.key}
                                </code>
                            </div>

                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(newKeyDialog.key);
                                    alert("Copied! Send this to the partner via secure channel.");
                                }}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg mb-4"
                            >
                                Copy Key & Notify Partner
                            </button>
                            
                            <button onClick={() => setNewKeyDialog({ open: false, key: '' })} className="text-slate-500 hover:text-slate-300 text-xs font-bold uppercase underline">
                                I have safely delivered this key
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}