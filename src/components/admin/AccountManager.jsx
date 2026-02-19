import React, { useState, useEffect } from 'react';
import { adminService } from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { Search, Plus, CreditCard, DollarSign, Calendar, X, ArrowRight, ArrowUpRight, ArrowDownLeft, Ban, AlertCircle, FileText, CheckCircle } from 'lucide-react';

export default function AccountManager() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTransactionsDrawer, setShowTransactionsDrawer] = useState(false);
    const [accountTransactions, setAccountTransactions] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState({
        open: false, accountId: null, accountNumber: null, customerName: null, newStatus: null
    });
    const [newAccount, setNewAccount] = useState({
        customerId: '', accountType: 'SAVINGS', currency: 'THB', pin: '123456'
    });
    const [searchTerm, setSearchTerm] = useState('');

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
            const accountData = {
                customerId: newAccount.customerId,
                type: newAccount.accountType,
                currency: newAccount.currency,
                pin: newAccount.pin
            };

            await adminService.createAccount(accountData);

            setShowCreateModal(false);
            setNewAccount({ customerId: '', accountType: 'SAVINGS', currency: 'USD', pin: '123456' });
            fetchAccounts();
        } catch (error) {
            console.error("Create account error", error);
            alert("Failed to create account. Ensure Customer ID is valid.");
        }
    };

    const openConfirm = (account, newStatus) => {
        setConfirmDialog({
            open: true,
            accountId: account.id,
            accountNumber: account.accountNumber,
            customerName: account.customerName || `Customer #${String(account.customerId).substring(0, 8)}...`,
            newStatus
        });
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
            alert("Failed to update account status.");
        }
    };

    const confirmAndUpdate = async () => {
        const { accountId, newStatus } = confirmDialog;
        setConfirmDialog({ open: false });
        await handleUpdateStatus(accountId, newStatus);
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

    // Filter accounts by searchTerm across key fields
    const filteredAccounts = accounts.filter(acc => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        return (
            acc.accountNumber?.toLowerCase().includes(term) ||
            acc.customerName?.toLowerCase().includes(term) ||
            acc.customerId?.toLowerCase().includes(term) ||
            acc.type?.toLowerCase().includes(term) ||
            acc.status?.toLowerCase().includes(term)
        );
    });

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
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
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
                            ) : filteredAccounts.length > 0 ? (
                                filteredAccounts.map((account) => (
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
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-white">
                                                    {account.customerName || 'Partner Account'}
                                                </span>
                                                <span className="text-xs text-primary-400 font-mono mt-0.5">
                                                    {account.customerId
                                                        ? `ID: ${String(account.customerId).substring(0, 16)}...`
                                                        : account.partnerAppId ? `Partner: ${String(account.partnerAppId).substring(0, 16)}...` : '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${account.type === 'WALLET'
                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                : account.type === 'SAVINGS'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                                }`}>
                                                {account.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-white text-lg tracking-tight">
                                                {formatCurrency(account.balance, account.currency)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${account.status === 'ACTIVE'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : account.status === 'FROZEN'
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {account.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {account.status === 'ACTIVE' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openConfirm(account, 'FROZEN'); }}
                                                        className="p-2 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
                                                        title="Freeze Account"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M12 2v20M6 6l12 12M6 18L18 6" /></svg>
                                                    </button>
                                                )}
                                                {account.status === 'FROZEN' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openConfirm(account, 'ACTIVE'); }}
                                                        className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all"
                                                        title="Activate Account"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                    </button>
                                                )}
                                                {account.status !== 'CLOSED' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openConfirm(account, 'CLOSED'); }}
                                                        className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                                                        title="Close Account"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                    </button>
                                                )}
                                            </div>
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
                                        required
                                    >
                                        <option value="SAVINGS">Savings</option>
                                        <option value="CURRENT">Current</option>
                                        <option value="WALLET">Wallet</option>
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
                                <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">ATM PIN (6 digits)</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all placeholder:text-primary-600 font-mono text-center text-lg tracking-widest"
                                    placeholder="123456"
                                    value={newAccount.pin}
                                    onChange={e => setNewAccount({ ...newAccount, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                    maxLength="6"
                                    required
                                />
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
                                            onClick={() => openConfirm(selectedAccount, 'FROZEN')}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-bold text-sm hover:bg-blue-500/20 transition-colors"
                                        >
                                            <Ban size={16} /> Freeze
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => openConfirm(selectedAccount, 'ACTIVE')}
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
                                        {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
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
                                                    {new Date(tx.createdAt).toLocaleString()}
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

            {/* ── Confirmation Dialog ─────────────────────────────── */}
            {confirmDialog.open && (() => {
                const cfg = {
                    FROZEN: { label: 'Freeze Account', verb: 'freeze', icon: '❄️', accent: 'blue', btnCls: 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/30' },
                    ACTIVE: { label: 'Activate Account', verb: 'activate', icon: '✅', accent: 'emerald', btnCls: 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30' },
                    CLOSED: { label: 'Close Account', verb: 'close', icon: '🔒', accent: 'red', btnCls: 'bg-red-500 hover:bg-red-400 shadow-red-500/30' },
                }[confirmDialog.newStatus] || {};
                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setConfirmDialog({ open: false })}>
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        {/* Panel */}
                        <div
                            className="relative bg-primary-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div className="flex justify-center mb-5">
                                <span className="text-5xl">{cfg.icon}</span>
                            </div>
                            <h2 className="text-xl font-bold text-white text-center mb-2">{cfg.label}</h2>
                            <p className="text-primary-300 text-center text-sm mb-6">
                                Are you sure you want to <span className="font-semibold text-white">{cfg.verb}</span> account
                                {' '}<span className="font-mono text-primary-100">{confirmDialog.accountNumber}</span>
                                {' '}belonging to <span className="font-semibold text-white">{confirmDialog.customerName}</span>?
                                {confirmDialog.newStatus === 'CLOSED' && (
                                    <span className="block mt-2 text-red-400 font-semibold">⚠️ This action cannot be undone.</span>
                                )}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDialog({ open: false })}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-primary-200 font-semibold hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAndUpdate}
                                    className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-all active:scale-[0.98] ${cfg.btnCls}`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
