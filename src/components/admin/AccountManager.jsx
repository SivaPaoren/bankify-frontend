import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { Wallet, Snowflake, Ban, Plus, Search } from 'lucide-react';

export default function AccountManager() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Form State
    const [customerId, setCustomerId] = useState('');
    const [type, setType] = useState('SAVINGS');
    const [currency, setCurrency] = useState('THB');

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAccounts();
            setAccounts(Array.isArray(data) ? data : (data.content || []));
        } catch (error) {
            console.error("Failed to fetch accounts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        try {
            await adminService.createAccount({ customerId, type, currency });
            setShowCreate(false);
            fetchAccounts();
            setCustomerId('');
        } catch (e) {
            alert("Failed to create account");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Account Management</h1>
                    <p className="text-slate-500">Oversee customer bank accounts and status.</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold transition shadow-lg shadow-emerald-200"
                >
                    <Plus size={20} />
                    Open Account
                </button>
            </div>

            {showCreate && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 animate-page">
                    <h3 className="font-bold text-slate-800 mb-4">Open New Account</h3>
                    <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Customer ID"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition"
                            required
                        />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition"
                        >
                            <option value="SAVINGS">Savings</option>
                            <option value="CURRENT">Current</option>
                            <option value="WALLET">Wallet</option>
                        </select>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition"
                        >
                            <option value="THB">THB</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                        <button type="submit" className="bg-emerald-500 text-white font-bold px-6 rounded-xl hover:bg-emerald-600 transition">
                            Create
                        </button>
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
                            {accounts.length > 0 ? accounts.map((acc, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-600">{acc.accountNumber || `8822-000${i}`}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Wallet size={16} className="text-slate-400" />
                                            <span className="text-sm font-medium text-slate-700">{acc.type || 'SAVINGS'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-800">
                                        {acc.currency} {(acc.balance || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                            ACTIVE
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Freeze">
                                            <Snowflake size={18} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Close">
                                            <Ban size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">
                                        No accounts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
