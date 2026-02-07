import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/api';
import Table from '../common/Table';
import StatusBadge from '../common/StatusBadge';

export default function FinancialActions({ title, subtitle, accountId }) {
  const [activeTab, setActiveTab] = useState('deposit');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [transactions, setTransactions] = useState([]);

  // Form states
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [toAccountId, setToAccountId] = useState('');

  // Fetch history on mount and after successful transaction
  const fetchHistory = async () => {
    if (!accountId) return;
    try {
      const data = await transactionService.getTransactionsByAccount(accountId);
      // Ensure data is array
      setTransactions(Array.isArray(data) ? data : (data.content || []));
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [accountId]);

  const handleTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (activeTab === 'deposit') {
        await transactionService.deposit(accountId, amount, note);
        setMessage({ type: 'success', text: 'Deposit successful!' });
      } else if (activeTab === 'withdraw') {
        await transactionService.withdraw(accountId, amount, note);
        setMessage({ type: 'success', text: 'Withdrawal successful!' });
      } else if (activeTab === 'transfer') {
        await transactionService.transfer(accountId, toAccountId, amount, note);
        setMessage({ type: 'success', text: 'Transfer successful!' });
      }

      // Reset form
      setAmount('');
      setNote('');
      setToAccountId('');

      // Refresh history
      fetchHistory();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Transaction failed' });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'createdAt', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (row) => `${row.amount} ${row.currency || 'THB'}` },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'note', label: 'Note' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-600">{subtitle}</p>
      </div>

      {/* Action Tabs */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex space-x-4 border-b border-slate-100 mb-6">
          {['deposit', 'withdraw', 'transfer'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-4 text-sm font-medium capitalize transition-colors ${activeTab === tab
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleTransaction} className="space-y-4 max-w-lg">
          {message.text && (
            <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
            />
          </div>

          {activeTab === 'transfer' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To Account ID</label>
              <input
                type="text"
                required
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Target Account UUID"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Optional note"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Confirm ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
          </button>
        </form>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Transaction History</h2>
        <Table columns={columns} data={transactions} />
      </div>
    </div>
  );
}
