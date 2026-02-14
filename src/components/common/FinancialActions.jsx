import React, { useState, useEffect } from 'react';
import { transactionService } from '../../api';
import Table from '../common/Table';
import StatusBadge from '../common/StatusBadge';
import { ArrowRightLeft, Download, Upload, Landmark, CheckCircle, X } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export default function FinancialActions({ title, subtitle, accountId, service = transactionService }) {
  const { user } = useAuth();
  const currency = user?.currency || 'THB';

  const [activeTab, setActiveTab] = useState('deposit');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [transactions, setTransactions] = useState([]);

  // Form states
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [bankId, setBankId] = useState('');

  const fetchHistory = async () => {
    // If service uses 'getTransactions' (no arg), use that. 
    // If it relies on getTransactionsByAccount(id) (legacy), use that.
    // The new service structure favors getTransactions() for "me".
    // But if we are Admin mock using this? Unlikely.
    try {
      const data = await service.getTransactions(accountId); // Pass accountId just in case allowed, or ignored.
      setTransactions(Array.isArray(data) ? data : (data.content || []));
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [accountId, service]);

  const handleTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (activeTab === 'deposit') {
        // Updated Signature: (amount, note)
        await service.deposit(amount, note);
        setMessage({ type: 'success', text: 'Deposit successful!' });
      } else if (activeTab === 'withdraw') {
        // Updated Signature: (amount, note)
        await service.withdraw(amount, note);
        setMessage({ type: 'success', text: 'Withdrawal successful!' });
      } else if (activeTab === 'transfer') {
        const finalNote = bankId ? `[Bank: ${bankId}] ${note}` : note;
        // Updated Signature: (toAccountNumber, amount, note)
        // We use toAccountId as the toAccountNumber
        await service.transfer(toAccountId, amount, finalNote);
        setMessage({ type: 'success', text: 'Transfer successful!' });
      }

      setAmount('');
      setNote('');
      setToAccountId('');
      setBankId('');
      fetchHistory();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Transaction failed' });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'createdAt', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: 'type', label: 'Type', render: (row) => <span className="font-semibold text-xs uppercase text-slate-500">{row.type}</span> },
    { key: 'amount', label: 'Amount', render: (row) => <span className={row.type === 'DEPOSIT' || row.toAccountId === accountId ? 'text-emerald-600 font-bold' : 'text-slate-800'}>{row.amount} {row.currency || currency}</span> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  const tabs = [
    { id: 'deposit', label: 'Deposit', icon: Upload },
    { id: 'withdraw', label: 'Withdraw', icon: Download },
    { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Action Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }}
                  className={`flex-1 py-4 flex flex-col items-center gap-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-500'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              <form onSubmit={handleTransaction} className="space-y-5">
                {message.text && (
                  <div className={`p-3 rounded-lg text-sm border flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
                    {message.text}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Amount ({currency})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 font-semibold">{currency}</span>
                    <input

                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-12 pr-3 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-lg font-bold text-slate-800 outline-none transition"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {activeTab === 'transfer' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Destination Bank</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Landmark size={16} className="text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={bankId}
                          onChange={(e) => setBankId(e.target.value)}
                          className="w-full pl-9 pr-3 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                          placeholder="Bank Name / Code"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Account Number</label>
                      <input
                        type="text"
                        required
                        value={toAccountId}
                        onChange={(e) => setToAccountId(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono"
                        placeholder="Target Account UUID"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Note</label>
                  <textarea
                    rows="2"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                    placeholder="Optional description..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? 'Processing...' : (
                    <>
                      {activeTab === 'deposit' && <Upload size={18} />}
                      {activeTab === 'withdraw' && <Download size={18} />}
                      {activeTab === 'transfer' && <ArrowRightLeft size={18} />}
                      Confirm {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-700">Recent Transactions</h2>
              <button onClick={fetchHistory} className="text-xs text-emerald-600 font-bold hover:text-emerald-700">REFRESH</button>
            </div>
            <div className="p-0 overflow-x-auto">
              <Table columns={columns} data={transactions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
