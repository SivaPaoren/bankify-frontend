import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../api';
import { Plus, Search, User, Mail, Phone, Building2, Trash2, AlertTriangle } from 'lucide-react';

export default function CustomerManager() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', type: 'INDIVIDUAL' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Delete Confirmation Logic
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getCustomers();
            setCustomers(Array.isArray(data) ? data : (data.content || []));
        } catch (err) {
            console.error("Failed to fetch customers", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await adminService.createCustomer(formData);
            setSuccess('Customer created successfully');
            setFormData({ firstName: '', lastName: '', email: '', phone: '', type: 'INDIVIDUAL' });
            setShowCreate(false);
            fetchCustomers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create customer');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await adminService.deleteCustomer(deleteModal.id);
            setDeleteModal({ show: false, id: null, name: '' });
            fetchCustomers();
        } catch (err) {
            alert("Failed to delete customer");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
                    <p className="text-slate-500">Manage bank customers and their profiles.</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold transition shadow-lg shadow-emerald-200"
                >
                    <Plus size={20} />
                    New Customer
                </button>
            </div>

            {showCreate && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 animate-page">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Add New Customer</h3>
                        <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    {error && <p className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded-lg">{error}</p>}
                    {success && <p className="text-emerald-500 mb-4 text-sm bg-emerald-50 p-2 rounded-lg">{success}</p>}

                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500">First Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500">Last Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500">Phone</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500">Type</label>
                            <div className="relative">
                                <Building2 size={16} className="absolute left-3 top-3 text-slate-400" />
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition appearance-none"
                                >
                                    <option value="INDIVIDUAL">Individual</option>
                                    <option value="BUSINESS">Business</option>
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <button
                                type="submit"
                                className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-200"
                            >
                                Create Customer
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {customers.length > 0 ? customers.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-700">{row.firstName} {row.lastName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600">{row.email}</div>
                                        <div className="text-xs text-slate-400">{row.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold uppercase">
                                            {row.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100`}>
                                            ACTIVE
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => navigate(`/admin/accounts?customerId=${row.id}`)}
                                                className="text-emerald-600 hover:text-emerald-700 text-sm font-bold"
                                            >
                                                View Accounts
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ show: true, id: row.id, name: row.fullName })}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Permanently Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">
                                        {loading ? 'Loading customers...' : 'No customers found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 p-6">
                        <div className="flex items-center gap-3 mb-4 text-red-500">
                            <AlertTriangle size={24} />
                            <h2 className="text-xl font-bold text-slate-900">Delete Customer?</h2>
                        </div>
                        <p className="text-slate-600 mb-2">
                            Are you sure you want to permanently delete <strong>{deleteModal.name}</strong>?
                        </p>
                        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 mb-8">
                            <strong>Warning:</strong> This action will also permanently delete <u>ALL accounts</u> associated with this customer. This cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                                className="px-4 py-2 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition shadow-sm hover:shadow-md"
                            >
                                Permanently Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
