import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { transactionService } from '../../services/api';
import FinancialActions from '../../components/shared/FinancialActions';
import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function ClientDashboard() {
    const { user } = useAuth();
    const accountId = user?.accountId || user?.id; // Fallback
    const [balance, setBalance] = useState(0);
    const [last3, setLast3] = useState([]);

    // Fetch quick stats
    useEffect(() => {
        if (accountId) {
            // Fetch transactions for last 3
            transactionService.getTransactionsByAccount(accountId).then(data => {
                const list = Array.isArray(data) ? data : (data.content || []);
                setLast3(list.slice(0, 3));
            }).catch(err => console.error(err));
        }
    }, [accountId]);

    return (
        <div className="space-y-8 animate-page">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500">Welcome back, {user?.name || 'Partner'}</p>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Wallet size={24} className="text-white" />
                        </div>
                        <span className="text-xs font-bold bg-black/10 px-2 py-1 rounded text-white/90">Main Account</span>
                    </div>
                    <p className="text-sm text-emerald-50 mb-1">Total Balance</p>
                    <h3 className="text-3xl font-bold tracking-tight">฿ --.--</h3>
                </div>

                <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Last 3 Activities</h3>
                    <div className="space-y-3">
                        {last3.length > 0 ? last3.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${tx.type === 'DEPOSIT' || tx.toAccountId === accountId ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {tx.type === 'DEPOSIT' || tx.toAccountId === accountId ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700 capitalize">{tx.type.toLowerCase()}</p>
                                        <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`font-mono font-medium ${tx.type === 'DEPOSIT' || tx.toAccountId === accountId ? 'text-emerald-600' : 'text-slate-600'}`}>
                                    {tx.type === 'DEPOSIT' || tx.toAccountId === accountId ? '+' : '-'}{tx.amount}
                                </span>
                            </div>
                        )) : <p className="text-slate-400 text-sm italic">No recent activity</p>}
                    </div>
                </div>
            </div>

            {/* Financial Actions Section */}
            <FinancialActions
                title="Quick Actions"
                subtitle="Perform secure transfers and account management."
                accountId={accountId}
            />
        </div>
    );
}
