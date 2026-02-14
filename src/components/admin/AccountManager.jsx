import React, { useState, useEffect } from 'react';
import { adminService } from '../../api';
import { Search, Plus, CreditCard, DollarSign, Calendar, X, ArrowRight, ArrowUpRight, ArrowDownLeft, Ban, AlertCircle, FileText } from 'lucide-react';

export default function AccountManager() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTransactionsDrawer, setShowTransactionsDrawer] = useState(false);
    const [accountTransactions, setAccountTransactions] = useState([]);

    // Form State
    const [newAccount, setNewAccount] = useState({
        customerId: '',
        accountType: 'SAVINGS',
        initialDeposit: '',
        currency: 'USD'
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAccounts();
            setAccounts(data);
        } catch (error) {
            console.error("Failed to fetch accounts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        try {
            await adminService.createAccount(
                newAccount.customerId,
                newAccount.accountType,
                parseFloat(newAccount.initialDeposit),
                newAccount.currency
            );
            setShowCreateModal(false);
            setNewAccount({ customerId: '', accountType: 'SAVINGS', initialDeposit: '', currency: 'USD' });
            fetchAccounts();
        } catch (error) {
            alert("Failed to create account. Ensure Customer ID is valid.");
        }
    };

    const handleUpdateStatus = async (accountId, status) => {
        try {
            await adminService.updateAccountStatus(accountId, status);
            fetchAccounts();
            if (selectedAccount && selectedAccount.id === accountId) {
                setSelectedAccount({ ...selectedAccount, status });
            }
        } catch (error) {
            console.error("Status update failed", error);
        }
    };

    const openTransactions = async (account) => {
        setSelectedAccount(account);
        setShowTransactionsDrawer(true);
        try {
            const txs = await adminService.getAccountTransactions(account.id);
            setAccountTransactions(txs);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Accounts</h1>
                    <p className="text-primary-200">Oversee customer bank accounts and balances.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    <Plus size={20} />
                    Open Account
                </button>
            </div>

            {/* Account List */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 overflow-hidden min-h-[500px]">
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-3 bg-black/20 px-4 py-2.5 rounded-xl border border-white/10 focus-within:border-emerald-500 transition-all max-w-md group">
                        <Search size={18} className="text-primary-400 group-focus-within:text-emerald-400 scale-100 group-focus-within:scale-110 transition-all" />
                        <input
                            type="text"
                            placeholder="Search accounts..."
                            className="bg-transparent outline-none text-white w-full placeholder:text-primary-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold">
                                <th className="px-6 py-4">Account No.</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-right">Balance</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-primary-300 italic">Loading accounts...</td></tr>
                            ) : accounts.length > 0 ? (
                                accounts.map((account) => (
                                    <tr key={account.id} onClick={() => openTransactions(account)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-300 border border-white/5">
                                                    <CreditCard size={18} />
                                                </div>
                                                <span className="font-mono text-white tracking-wide group-hover:text-emerald-300 transition-colors">{account.accountNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-primary-100 font-medium">
                                            {account.customerName || `Customer #${account.customerId}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-xs font-bold text-primary-200 uppercase tracking-wider">
                                                {account.accountType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-white text-lg tracking-tight">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: account.currency }).format(account.balance)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${account.status === 'ACTIVE'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {account.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="p-2 rounded-xl text-primary-400 hover:text-white hover:bg-white/10 transition-all">
                                                <ArrowRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-primary-300 italic">No accounts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Account Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-primary-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
                            <h3 className="text-xl font-bold text-white">Open New Account</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-primary-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAccount} className="p-6 space-y-5 relative z-10">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Customer ID</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all placeholder:text-primary-600"
                                    placeholder="Enter Customer ID"
                                    value={newAccount.customerId}
                                    onChange={e => setNewAccount({ ...newAccount, customerId: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Account Type</label>
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all appearance-none"
                                        value={newAccount.accountType}
                                        onChange={e => setNewAccount({ ...newAccount, accountType: e.target.value })}
                                    >
                                        <option value="SAVINGS">Savings</option>
                                        <option value="CHECKING">Checking</option>
                                        <option value="BUSINESS">Business</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Currency</label>
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all appearance-none"
                                        value={newAccount.currency}
                                        onChange={e => setNewAccount({ ...newAccount, currency: e.target.value })}
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="THB">THB (฿)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Initial Deposit</label>
                                <div className="relative">
                                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                                    <input
                                        type="number"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-emerald-500 transition-all placeholder:text-primary-600"
                                        placeholder="0.00"
                                        value={newAccount.initialDeposit}
                                        onChange={e => setNewAccount({ ...newAccount, initialDeposit: e.target.value })}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]">
                                    Confirm & Open Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transactions Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-primary-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transform transition-transform duration-500 z-50 flex flex-col ${showTransactionsDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedAccount && (
                    <>
                        <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-primary-900 to-primary-950 relative overflow-hidden shrink-0">
                            {/* Decorative Blobs */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-6 relative z-10 w-full">
                                <button onClick={() => setShowTransactionsDrawer(false)} className="p-2 -ml-2 text-primary-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <ArrowRight size={24} />
                                </button>
                                <div className="flex gap-2">
                                    {selectedAccount.status === 'ACTIVE' ? (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedAccount.id, 'SUSPENDED')}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-colors"
                                        >
                                            <Ban size={16} /> Suspend
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedAccount.id, 'ACTIVE')}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-sm hover:bg-emerald-500/20 transition-colors"
                                        >
                                            <CheckCircle size={16} /> Activate
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="relative z-10">
                                <p className="text-primary-300 font-medium mb-1">{selectedAccount.accountType} Account</p>
                                <h2 className="text-3xl font-mono text-white tracking-tight mb-4">{selectedAccount.accountNumber}</h2>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-bold text-white tracking-tighter">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedAccount.currency }).format(selectedAccount.balance)}
                                    </span>
                                    <span className="mb-1.5 px-2.5 py-0.5 rounded-lg bg-white/10 text-xs font-bold text-primary-200">Current Balance</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative bg-black/20">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <FileText size={20} className="text-primary-400" />
                                Transaction History
                            </h3>

                            <div className="space-y-4">
                                {accountTransactions.length > 0 ? accountTransactions.map((tx) => (
                                    <div key={tx.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-white/10 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                    tx.type === 'WITHDRAWAL' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                }`}>
                                                {tx.type === 'DEPOSIT' && <ArrowDownLeft size={24} />}
                                                {tx.type === 'WITHDRAWAL' && <ArrowUpRight size={24} />}
                                                {tx.type === 'TRANSFER' && <ArrowRight size={24} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white mb-0.5">{tx.description || tx.type}</div>
                                                <div className="text-xs text-primary-300 flex items-center gap-2">
                                                    <Calendar size={12} />
                                                    {new Date(tx.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-right font-bold text-lg ${tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-white'
                                            }`}>
                                            {tx.type === 'DEPOSIT' ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedAccount.currency }).format(tx.amount)}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-primary-400/60">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                            <AlertCircle size={32} />
                                        </div>
                                        <p className="italic">No transactions found for this account.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
