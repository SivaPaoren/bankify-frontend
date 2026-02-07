import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Table from '../common/Table';
import StatusBadge from '../common/StatusBadge';
import { Plus } from 'lucide-react';

export default function AccountManager() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [formData, setFormData] = useState({ customerId: '', type: 'CURRENT', currency: 'THB' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAccounts();
            setAccounts(data);
        } catch (err) {
            console.error("Failed to fetch accounts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await adminService.createAccount(formData);
            setSuccess('Account created successfully');
            setFormData({ customerId: '', type: 'CURRENT', currency: 'THB' });
            setShowCreate(false);
            fetchAccounts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account');
        }
    };

    const columns = [
        { key: 'accountNumber', label: 'Account No.' },
        { key: 'customerId', label: 'Customer ID' }, // Ideally map to name, but ID for now
        { key: 'type', label: 'Type' },
        { key: 'balance', label: 'Balance', render: (row) => `${row.balance} ${row.currency}` },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status || 'ACTIVE'} /> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Bank Accounts</h2>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    <Plus size={16} /> New Account
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

                    <h3 className="font-semibold text-lg mb-4">Open New Account</h3>

                    {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
                    {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}

                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Customer UUID</label>
                            <input
                                type="text"
                                value={formData.customerId}
                                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                placeholder="Paste Customer UUID here"
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
                                <option value="CURRENT">Current</option>
                                <option value="SAVINGS">Savings</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                            <select
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            >
                                <option value="THB">THB</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 pt-2">
                            <button
                                type="submit"
                                className="w-full bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-medium"
                            >
                                Create Account
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <Table columns={columns} data={accounts} />
        </div>
    );
}
