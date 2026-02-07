import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { Wallet, Snowflake, Ban, Plus, CreditCard } from 'lucide-react';

export default function AccountManager() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [creationMode, setCreationMode] = useState(false);
    const [formData, setFormData] = useState({
        customerId: '',
        type: 'WALLET',
        currency: 'THB'
    });

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAccounts();
            setAccounts(Array.isArray(data) ? data : (data.content || []));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await adminService.createAccount(formData);
            setCreationMode(false);
            setFormData({ customerId: '', type: 'WALLET', currency: 'THB' });
            fetchAccounts();
        } catch (e) {
            alert('Failed to create account');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Bank Accounts</h1>
                    <p className="text-slate-500">Manage customer accounts and statuses.</p>
                </div>
                <button
                    onClick={() => setCreationMode(!creationMode)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold transition shadow-lg shadow-emerald-200"
                >
                    <Plus size={20} />
                    New Account
                </button>
            </div>

            {creationMode && (
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 animate-page">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Wallet className="text-emerald-500" />
                        Create New Account
                    </h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Customer ID</label>
                            <input
                                type="text"
                                required
                                value={formData.customerId}
                                onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white transition"
                                placeholder="UUID or Customer ID"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white transition"
                            >
                                <option value="WALLET">Wallet (Digital)</option>
                                <option value="SAVINGS">Savings Account</option>
                                <option value="CURRENT">Current Account</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 shadow-md transform active:scale-95 transition">
                                Confirm Creation
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
                                <th className="px-6 py-4">Account No.</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Balance</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {accounts.map((acc, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{acc.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                                <CreditCard size={14} />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{acc.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-800">
                                        {acc.balance} <span className="text-xs text-slate-400 font-normal">{acc.currency}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${acc.status === 'ACTIVE'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-orange-50 text-orange-600 border-orange-100'
                                            }`}>
                                            {acc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Freeze">
                                            <Snowflake size={18} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Close Account">
                                            <Ban size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
