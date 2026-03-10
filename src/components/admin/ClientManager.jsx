import React, { useEffect, useState } from 'react';
import { adminService } from '../../api';
import {
    Shield, Power, CheckCircle, XCircle, Clock, Search,
    RefreshCw, Key, Eye, Lock, X, BarChart3, Globe,
    ArrowRightLeft, AlertCircle, Building2, Calendar
} from 'lucide-react';
import FilterDropdown from '../common/FilterDropdown';

export default function ClientManager() {
    const [activeTab, setActiveTab] = useState('partners'); // 'partners' or 'rotations'
    const [clients, setClients] = useState([]);
    const [rotations, setRotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');


    // Dossier Slide-Over State
    const [selectedClient, setSelectedClient] = useState(null);
    const [actionError, setActionError] = useState(null);

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
        setActionError(null);
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
            setActionError(e.response?.data?.message || e.message || 'Action failed.');
            setTimeout(() => setActionError(null), 5000);
        }
    };

    const handleRotationAction = async (rotationId, action) => {
        setActionError(null);
        try {
            if (action === 'approve') {
                await adminService.approveKeyRotation(rotationId);
            } else {
                await adminService.rejectKeyRotation(rotationId);
            }
            loadData();
        } catch (e) {
            setActionError(e.response?.data?.message || e.message || 'Rotation action failed.');
            setTimeout(() => setActionError(null), 5000);
        }
    };

    const stats = {
        total: clients.length,
        active: clients.filter(c => c.status === 'ACTIVE').length,
        pending: clients.filter(c => c.status === 'PENDING').length,
        rotations: rotations.filter(r => r.status === 'PENDING').length,
    };

    const filteredClients = clients.filter(c => {
        if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
        if (searchTerm && !c.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Partner Management</h1>
                    <p className="text-primary-300 mt-1">Review registrations and security rotation requests.</p>
                </div>
            </header>

            {actionError && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl text-sm font-medium">
                    <span className="flex-1">{actionError}</span>
                    <button onClick={() => setActionError(null)} className="p-1 hover:bg-red-500/20 rounded-lg transition-colors text-red-300">&times;</button>
                </div>
            )}

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
                {/* <button
                    onClick={() => setActiveTab('rotations')}
                    className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'rotations' ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                >
                    Rotation Requests
                    {stats.rotations > 0 && (
                        <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">{stats.rotations}</span>
                    )}
                </button> */}
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
                        <FilterDropdown
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { key: 'ALL', label: 'All Status' },
                                { key: 'ACTIVE', label: 'Active' },
                                { key: 'PENDING', label: 'Pending' },
                                { key: 'DISABLED', label: 'Disabled' },
                            ]}
                        />
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
                                {filteredClients.map((row) => (
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
                                {clients.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center">
                                            {/* <Globe size={36} className="mx-auto mb-3 text-slate-600" /> */}
                                            <p className="text-slate-400 font-medium">No partner applications registered yet.</p>
                                            <p className="text-slate-600 text-sm mt-1">Partners can sign up from the partner portal.</p>
                                        </td>
                                    </tr>
                                )}
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


            {/* Partner Details Slide-Over */}
            {selectedClient && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        onClick={() => setSelectedClient(null)}
                    />
                    {/* Drawer */}
                    <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#0f1f35] border-l border-white/10 z-50 flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                    <Building2 size={20} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white text-lg leading-tight">{selectedClient.name}</h2>
                                    <p className="text-xs text-primary-400">Partner Application</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedClient(null)}
                                className="p-2 rounded-xl hover:bg-white/10 text-primary-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                                <span className="text-sm text-primary-300 font-medium">Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                    selectedClient.status === 'ACTIVE'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : selectedClient.status === 'PENDING'
                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                    {selectedClient.status}
                                </span>
                            </div>

                            {/* App ID */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 space-y-1">
                                <p className="text-xs text-primary-400 uppercase tracking-widest font-bold">App ID</p>
                                <p className="font-mono text-sm text-white break-all select-all">{selectedClient.id}</p>
                            </div>

                            {/* Registration Date */}
                            {selectedClient.createdAt && (
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                                    <Calendar size={16} className="text-primary-400 shrink-0" />
                                    <div>
                                        <p className="text-xs text-primary-400 uppercase tracking-widest font-bold">Registered</p>
                                        <p className="text-sm text-white">{new Date(selectedClient.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 border-t border-white/10">
                            {selectedClient.status === 'PENDING' && (
                                <button
                                    onClick={async () => { await handleAction(selectedClient.id, selectedClient.status); setSelectedClient(null); }}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl font-bold hover:bg-emerald-500/20 transition-colors"
                                >
                                    <CheckCircle size={18} /> Approve Application
                                </button>
                            )}
                            {selectedClient.status === 'ACTIVE' && (
                                <button
                                    onClick={async () => { await handleAction(selectedClient.id, selectedClient.status); setSelectedClient(null); }}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl font-bold hover:bg-red-500/20 transition-colors"
                                >
                                    <Power size={18} /> Disable Application
                                </button>
                            )}
                            {selectedClient.status === 'DISABLED' && (
                                <button
                                    onClick={async () => { await handleAction(selectedClient.id, selectedClient.status); setSelectedClient(null); }}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl font-bold hover:bg-emerald-500/20 transition-colors"
                                >
                                    <Power size={18} /> Reactivate Application
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}