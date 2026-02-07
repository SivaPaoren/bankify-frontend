import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Table from '../common/Table';
import StatusBadge from '../common/StatusBadge';
import { Plus } from 'lucide-react';

export default function CustomerManager() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', type: 'INDIVIDUAL' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getCustomers();
            setCustomers(data);
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
            setFormData({ fullName: '', email: '', phone: '', type: 'INDIVIDUAL' });
            setShowCreate(false);
            fetchCustomers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create customer');
        }
    };

    const columns = [
        { key: 'fullName', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status || 'ACTIVE'} /> },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                    View Accounts
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Customers</h2>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    <Plus size={16} /> New Customer
                </button>
            </div>

            {showCreate && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-fade-in relative">
                    <button
                        onClick={() => setShowCreate(false)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    >
                        ✕
                    </button>

                    <h3 className="font-semibold text-lg mb-4">Add New Customer</h3>

                    {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
                    {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}

                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            >
                                <option value="INDIVIDUAL">Individual</option>
                                <option value="BUSINESS">Business</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <button
                                type="submit"
                                className="w-full bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-medium"
                            >
                                Create Customer
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <Table columns={columns} data={customers} />
        </div>
    );
}
