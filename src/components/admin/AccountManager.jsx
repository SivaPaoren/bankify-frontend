import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../api';
import { CreditCard, Plus, Snowflake, Ban, User, X, AlertTriangle } from 'lucide-react';

export default function AccountManager() {
    const [searchParams, setSearchParams] = useSearchParams();
    const customerIdParam = searchParams.get('customerId');

    const [accounts, setAccounts] = useState([]);
    const [customers, setCustomers] = useState([]); // List of customers for dropdown/lookup
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // New state for confirmation modal
    const [confirmModal, setConfirmModal] = useState({ show: false, type: '', id: null, message: '' });

    // Customer ID, Type, Currency for new account form
    const [formData, setFormData] = useState({
        customerId: customerIdParam || '',
        type: 'SAVINGS',
        currency: 'THB'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [accData, custData] = await Promise.all([
                adminService.getAccounts({ customerId: customerIdParam }),
                adminService.getCustomers()
            ]);
            setAccounts(Array.isArray(accData) ? accData : (accData.content || []));
            setCustomers(Array.isArray(custData) ? custData : (custData.content || []));
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (customerIdParam) {
            setFormData(prev => ({ ...prev, customerId: customerIdParam }));
        }
    }, [customerIdParam]);

    const handleCreate = async (e) => {
        e.preventDefault();
        await adminService.createAccount(formData);
        setShowModal(false);
        setFormData({ customerId: '', type: 'SAVINGS', currency: 'THB' });
        fetchData();
    };

    const executeAction = async () => {
        if (confirmModal.type === 'FREEZE') {
            await adminService.freezeAccount(confirmModal.id);
        } else if (confirmModal.type === 'CLOSE') {
            await adminService.closeAccount(confirmModal.id);
        }
        setConfirmModal({ show: false, type: '', id: null, message: '' });
        fetchData();
    };

    // Helper to get customer name
    const getCustomerName = (cId) => {
        const customer = customers.find(c => String(c.id) === String(cId));
        return customer ? customer.fullName : cId; // Fallback to ID if name not found
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Account Management</h1>
                    <p className="text-slate-500">Oversee customer bank accounts and status.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-sm hover:shadow-md"
                >
                    <Plus size={18} />
                    Open Account
                </button>
            </div>

            {customerIdParam && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-center text-blue-700">
                    <span className="font-medium">
                        Showing accounts for customer: <strong>{getCustomerName(customerIdParam)}</strong>
                    </span>
                    <button
                        onClick={() => setSearchParams({})}
                        className="flex items-center gap-1 text-sm bg-white hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                    >
                        <X size={14} /> Clear Filter
                    </button>
                </div>
            )}

            {/* Account List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            <th className="px-6 py-4">Account No.</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Balance</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading accounts...</td></tr>
                        ) : accounts.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No accounts found.</td></tr>
                        ) : (
                            accounts.map((acc) => (
                                <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-600">{acc.accountNumber}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-900 font-medium">
                                            <User size={14} className="text-slate-400" />
                                            {getCustomerName(acc.customerId)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                            <CreditCard size={14} className="text-slate-400" />
                                            {acc.type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        {acc.currency} {(acc.balance || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-bold border ${acc.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                acc.status === 'FROZEN' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                            {acc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            onClick={() => setConfirmModal({
                                                show: true,
                                                type: 'FREEZE',
                                                id: acc.id,
                                                message: `Are you sure you want to ${acc.status === 'FROZEN' ? 'unfreeze' : 'freeze'} account ${acc.accountNumber}?`
                                            })}
                                            className={`p-2 rounded-lg transition ${acc.status === 'FROZEN' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                            title={acc.status === 'FROZEN' ? "Unfreeze" : "Freeze"}
                                        >
                                            <Snowflake size={18} />
                                        </button>
                                        <button
                                            onClick={() => setConfirmModal({
                                                show: true,
                                                type: 'CLOSE',
                                                id: acc.id,
                                                message: `Are you sure you want to CLOSE account ${acc.accountNumber}? This cannot be undone.`
                                            })}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Close"
                                        >
                                            <Ban size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Account Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-100 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-1">Open New Account</h2>
                        <form onSubmit={handleCreate} className="mt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 border border-transparent focus:border-emerald-500 transition"
                                        value={formData.customerId}
                                        onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Customer</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 border border-transparent focus:border-emerald-500 transition"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="SAVINGS">Savings</option>
                                            <option value="CURRENT">Current</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 border border-transparent focus:border-emerald-500 transition"
                                            value={formData.currency}
                                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                        >
                                            <option value="THB">THB</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium transition shadow-sm hover:shadow-md"
                                >
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 p-6">
                        <div className="flex items-center gap-3 mb-4 text-amber-500">
                            <AlertTriangle size={24} />
                            <h2 className="text-xl font-bold text-slate-900">Confirm Action</h2>
                        </div>
                        <p className="text-slate-600 mb-8">{confirmModal.message}</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                className="px-4 py-2 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeAction}
                                className={`px-4 py-2 rounded-xl font-medium text-white transition shadow-sm hover:shadow-md ${confirmModal.type === 'CLOSE' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                                    }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
