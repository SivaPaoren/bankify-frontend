import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../api';
import { formatCurrency } from '../../utils/formatters';
import {
    Search, UserPlus, Mail, Phone, X, User,
    Snowflake, CheckCircle, XCircle, AlertTriangle, ChevronUp, RefreshCw, Copy, ExternalLink
} from 'lucide-react';
import FilterDropdown from '../common/FilterDropdown';

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
    ACTIVE: { label: 'Active', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
    FROZEN: { label: 'Frozen', cls: 'bg-amber-500/10  text-amber-400  border-amber-500/20', dot: 'bg-amber-400' },
    CLOSED: { label: 'Closed', cls: 'bg-red-500/10    text-red-400    border-red-500/20', dot: 'bg-red-400' },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] ?? STATUS_CFG.ACTIVE;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

// ─── Confirmation Dialog ────────────────────────────────────────────────────────
const DIALOG_CFG = {
    freeze: {
        title: 'Freeze Customer?',
        icon: <Snowflake size={32} className="text-amber-400" />,
        ring: 'border-amber-500/20 bg-amber-500/10',
        bar: 'from-amber-500 to-yellow-500',
        btnCls: 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20',
        btnLabel: 'Freeze',
        desc: (name) => <>Freeze <b className="text-white">{name}</b>? Their active accounts will also be frozen. This can be undone.</>,
    },
    reactivate: {
        title: 'Re-activate Customer?',
        icon: <CheckCircle size={32} className="text-emerald-400" />,
        ring: 'border-emerald-500/20 bg-emerald-500/10',
        bar: 'from-emerald-500 to-cyan-500',
        btnCls: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20',
        btnLabel: 'Re-activate',
        desc: (name) => <>Re-activate <b className="text-white">{name}</b>? Their frozen accounts will also be restored to active.</>,
    },
    close: {
        title: 'Close Customer Permanently?',
        icon: <XCircle size={32} className="text-red-400" />,
        ring: 'border-red-500/20 bg-red-500/10',
        bar: 'from-red-600 to-rose-500',
        btnCls: 'bg-red-600 hover:bg-red-500 shadow-red-500/20',
        btnLabel: 'Close Permanently',
        desc: (name) => (
            <>
                <b className="text-white">{name}</b> will be permanently closed. All their bank accounts will also be closed.
                <br /><span className="text-amber-400 text-xs font-semibold">⚠ This cannot be reversed.</span>
            </>
        ),
    },
};

function ConfirmDialog({ action, customer, onConfirm, onCancel, loading }) {
    if (!action || !customer) return null;
    const cfg = DIALOG_CFG[action];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/90 backdrop-blur-md animate-fade-in">
            <div className="bg-primary-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-6 text-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r ${cfg.bar}`} />
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${cfg.ring}`}>
                    {cfg.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{cfg.title}</h3>
                <p className="text-primary-300 mb-6 leading-relaxed text-sm">{cfg.desc(`${customer.firstName} ${customer.lastName}`)}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors border border-white/5"
                    >Cancel</button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition-colors shadow-lg ${cfg.btnCls}`}
                    >
                        {loading ? <RefreshCw size={16} className="animate-spin mx-auto" /> : cfg.btnLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function CustomerManager() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [dialog, setDialog] = useState({ action: null, customer: null });
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerAccounts, setCustomerAccounts] = useState([]);
    const [showDrawer, setShowDrawer] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        firstName: '', lastName: '', email: '', phone: '', type: 'INDIVIDUAL'
    });

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getCustomers();
            setCustomers(Array.isArray(data) ? data : (data.content || []));
        } catch (err) {
            console.error('Failed to fetch customers', err);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    // ── Filtered view ───────────────────────────────────────────────────────
    const visibleCustomers = customers.filter(c => {
        if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
        if (typeFilter !== 'ALL' && c.type !== typeFilter) return false;
        if (!searchTerm) return true;
        const t = searchTerm.toLowerCase();
        return (
            c.firstName?.toLowerCase().includes(t) ||
            c.lastName?.toLowerCase().includes(t) ||
            c.email?.toLowerCase().includes(t) ||
            c.id?.toString().includes(t)
        );
    });

    const stats = {
        total: customers.length,
        active: customers.filter(c => c.status === 'ACTIVE').length,
        frozen: customers.filter(c => c.status === 'FROZEN').length,
        closed: customers.filter(c => c.status === 'CLOSED').length,
    };

    const STATUS_CHIPS = [
        { key: 'ALL', label: 'All', cls: 'border-white/20 text-primary-200', activeCls: 'bg-white/10 text-white border-white/30' },
        { key: 'ACTIVE', label: 'Active', cls: 'border-emerald-500/20 text-emerald-400/60', activeCls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
        { key: 'FROZEN', label: 'Frozen', cls: 'border-amber-500/20 text-amber-400/60', activeCls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
        { key: 'CLOSED', label: 'Closed', cls: 'border-red-500/20 text-red-400/60', activeCls: 'bg-red-500/15 text-red-400 border-red-500/30' },
    ];

    const TYPE_CHIPS = [
        { key: 'ALL', label: 'All', cls: 'border-white/20 text-primary-200', activeCls: 'bg-white/10 text-white border-white/30' },
        { key: 'INDIVIDUAL', label: 'Individual', cls: 'border-blue-500/20 text-blue-400/60', activeCls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
        { key: 'BUSINESS', label: 'Business', cls: 'border-purple-500/20 text-purple-400/60', activeCls: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    ];

    // ── Actions ─────────────────────────────────────────────────────────────
    const openDialog = (action, customer, e) => {
        e.stopPropagation();
        setDialog({ action, customer });
    };

    const handleConfirm = async () => {
        const { action, customer } = dialog;
        if (!action || !customer) return;
        setActionLoading(true);
        try {
            if (action === 'freeze') await adminService.freezeCustomer(customer.id);
            if (action === 'reactivate') await adminService.reactivateCustomer(customer.id);
            if (action === 'close') await adminService.closeCustomer(customer.id);
            setDialog({ action: null, customer: null });
            await fetchCustomers();
        } catch (err) {
            console.error('Action failed', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await adminService.createCustomer(newCustomer);
            setShowModal(false);
            setNewCustomer({ firstName: '', lastName: '', email: '', phone: '', type: 'INDIVIDUAL' });
            fetchCustomers();
        } catch (err) {
            console.error('Create failed', err);
        }
    };

    const handleViewAccounts = async (customer) => {
        setSelectedCustomer(customer);
        setShowDrawer(true);
        try {
            const accounts = await adminService.getAccounts({ customerId: customer.id });
            setCustomerAccounts(Array.isArray(accounts) ? accounts : (accounts.content || []));
        } catch {
            setCustomerAccounts([]);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Customers</h1>
                    <p className="text-primary-300 mt-1">Manage user profiles and identity verification.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                    <UserPlus size={20} /> Add Customer
                </button>
            </div>

            {/* Stats Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Customers', value: stats.total, color: 'text-white', sub: `${stats.active} active` },
                    { label: 'Active', value: stats.active, color: 'text-emerald-400', sub: 'fully verified' },
                    { label: 'Frozen', value: stats.frozen, color: 'text-amber-400', sub: 'temporarily suspended' },
                    { label: 'Closed', value: stats.closed, color: 'text-red-400', sub: 'archived profiles' },
                ].map(s => (
                    <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                        <div className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">{s.label}</div>
                        <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-primary-500 mt-1">{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white/3 border border-white/10 rounded-2xl px-4 py-3">
                {/* Search */}
                <div className="flex items-center gap-3 bg-black/20 px-4 py-2.5 rounded-xl border border-white/10 focus-within:border-cyan-500 focus-within:bg-black/30 transition-all flex-1 min-w-0 group">
                    <Search size={18} className="text-primary-400 group-focus-within:text-cyan-400 transition-colors shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        className="bg-transparent outline-none text-white w-full placeholder:text-primary-500 text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filters — pushed to the right */}
                <div className="flex items-center gap-3 ml-auto shrink-0">
                    <FilterDropdown
                        label="Status"
                        options={STATUS_CHIPS}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        counts={{
                            ACTIVE: customers.filter(c => c.status === 'ACTIVE').length,
                            FROZEN: customers.filter(c => c.status === 'FROZEN').length,
                            CLOSED: customers.filter(c => c.status === 'CLOSED').length
                        }}
                    />
                    <FilterDropdown
                        label="Type"
                        options={TYPE_CHIPS}
                        value={typeFilter}
                        onChange={setTypeFilter}
                        counts={{
                            INDIVIDUAL: customers.filter(c => c.type === 'INDIVIDUAL').length,
                            BUSINESS: customers.filter(c => c.type === 'BUSINESS').length
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold">
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-primary-300 italic">Loading customers...</td></tr>
                        ) : visibleCustomers.length > 0 ? (
                            visibleCustomers.map(c => (
                                <tr
                                    key={c.id}
                                    onClick={() => handleViewAccounts(c)}
                                    className={`hover:bg-white/5 transition-colors group cursor-pointer ${c.status === 'CLOSED' ? 'opacity-50' : ''}`}
                                >
                                    {/* Customer name */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white border border-white/10 shadow-inner shrink-0">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <div className={`font-bold group-hover:text-cyan-300 transition-colors ${c.status === 'CLOSED' ? 'line-through text-primary-400' : 'text-white'}`}>
                                                    {c.firstName} {c.lastName}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-primary-400 font-mono">
                                                    <span>ID: {String(c.id).substring(0, 8)}...</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(c.id);
                                                            // Optional: toast or tooltip could go here
                                                        }}
                                                        className="p-1 hover:bg-white/10 rounded-md text-primary-500 hover:text-cyan-400 transition-colors"
                                                        title="Copy Customer ID"
                                                    >
                                                        <Copy size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact */}
                                    <td className="px-6 py-4 space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-primary-100">
                                            <Mail size={14} className="text-primary-400 shrink-0" />{c.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-primary-100">
                                            <Phone size={14} className="text-primary-400 shrink-0" />{c.phone || c.phoneNumber || 'N/A'}
                                        </div>
                                    </td>

                                    {/* Type */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${c.type === 'BUSINESS'
                                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                            {c.type}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4 text-center">
                                        <StatusBadge status={c.status} />
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                                            {c.status === 'ACTIVE' && (
                                                <>
                                                    <button
                                                        onClick={e => openDialog('freeze', c, e)}
                                                        title="Freeze customer"
                                                        className="p-2 rounded-xl text-primary-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all"
                                                    >
                                                        <Snowflake size={16} />
                                                    </button>
                                                    <button
                                                        onClick={e => openDialog('close', c, e)}
                                                        title="Close permanently"
                                                        className="p-2 rounded-xl text-primary-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {c.status === 'FROZEN' && (
                                                <>
                                                    <button
                                                        onClick={e => openDialog('reactivate', c, e)}
                                                        title="Re-activate customer"
                                                        className="p-2 rounded-xl text-primary-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={e => openDialog('close', c, e)}
                                                        title="Close permanently"
                                                        className="p-2 rounded-xl text-primary-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {c.status === 'CLOSED' && (
                                                <span className="text-xs text-primary-600 italic px-2">Closed</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-primary-400/60 italic">
                                {searchTerm ? 'No customers match your search.' : 'No customers found.'}
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                action={dialog.action}
                customer={dialog.customer}
                onConfirm={handleConfirm}
                onCancel={() => setDialog({ action: null, customer: null })}
                loading={actionLoading}
            />

            {/* Add Customer Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-primary-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                        <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
                            <h3 className="text-xl font-bold text-white">Add New Customer</h3>
                            <button onClick={() => setShowModal(false)} className="text-primary-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-5 relative z-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">First Name</label>
                                    <input className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all placeholder:text-primary-600"
                                        placeholder="John" value={newCustomer.firstName}
                                        onChange={e => setNewCustomer({ ...newCustomer, firstName: e.target.value })} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Last Name</label>
                                    <input className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all placeholder:text-primary-600"
                                        placeholder="Doe" value={newCustomer.lastName}
                                        onChange={e => setNewCustomer({ ...newCustomer, lastName: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Email Address</label>
                                <input type="email" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all placeholder:text-primary-600"
                                    placeholder="john@example.com" value={newCustomer.email}
                                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Phone Number</label>
                                <input type="tel" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all placeholder:text-primary-600"
                                    placeholder="+1 (555) 000-0000" value={newCustomer.phone}
                                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Customer Type</label>
                                <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all appearance-none"
                                    value={newCustomer.type}
                                    onChange={e => setNewCustomer({ ...newCustomer, type: e.target.value })} required>
                                    <option value="INDIVIDUAL">Individual</option>
                                    <option value="BUSINESS">Business</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
                                Create Customer Profile
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Customer Accounts Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-primary-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transform transition-transform duration-500 z-50 flex flex-col ${showDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedCustomer && (
                    <>
                        <div className="p-6 border-b border-white/5 bg-linear-to-r from-primary-900 to-primary-950 relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <button onClick={() => setShowDrawer(false)} className="p-2 text-primary-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-1">{selectedCustomer.firstName} {selectedCustomer.lastName}</h2>
                                <p className="text-primary-300 text-sm mb-3">{selectedCustomer.email}</p>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedCustomer.type === 'BUSINESS' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                        {selectedCustomer.type}
                                    </span>
                                    <StatusBadge status={selectedCustomer.status} />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-white">Bank Accounts ({customerAccounts.length})</h3>
                                {selectedCustomer.status !== 'CLOSED' && (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedCustomer.id);
                                            // You might want to implement a toast here instead of alert
                                            // But keeping alert for now as it's simple feedback
                                            alert(`Customer ID copied! \n${selectedCustomer.id}`);
                                        }}
                                        className="px-4 py-2 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                                    >
                                        <Copy size={16} /> Copy ID to Open Account
                                    </button>
                                )}
                            </div>
                            {customerAccounts.length > 0 ? customerAccounts.map(account => (
                                <div key={account.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="text-xs text-primary-300 mb-1">{account.type} Account</div>
                                            <div className="font-mono text-white text-lg">{account.accountNumber}</div>
                                        </div>
                                        <StatusBadge status={account.status} />
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-2xl font-bold text-white tracking-tight">
                                            {formatCurrency(account.balance, account.currency)}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-20 text-primary-400/60">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4"><User size={32} /></div>
                                    <p className="italic">No accounts found for this customer.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
