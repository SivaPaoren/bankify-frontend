import React, { useState, useEffect } from 'react';
import { partnerService } from '../../api';
import { Wallet, Clock, RefreshCw, AlertTriangle, Lock } from 'lucide-react';

const formatCurrency = (amount, currency = 'THB') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount ?? 0);

export default function MyAccounts() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await partnerService.getBalance();
      setAccount(data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Balance requires X-API-Key authentication (server-to-server). This endpoint cannot be called from the browser.');
      } else if (status === 403) {
        setError('Access denied — your partner app may be pending approval.');
      } else {
        setError('Could not load account data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settlement Account</h1>
          <p className="text-slate-400 mt-1 text-sm">Your partner settlement account managed by the bank.</p>
        </div>
        <button
          onClick={fetchAccount}
          disabled={loading}
          title="Refresh"
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin text-orange-400' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-orange-400 rounded-full animate-spin" />
            <span className="text-sm italic">Loading account…</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Lock size={18} className="text-orange-400" />
          </div>
          <div>
            <p className="font-bold text-orange-300 text-sm">Server-to-Server Only</p>
            <p className="text-orange-400/80 text-xs mt-1 leading-relaxed">{error}</p>
            <p className="text-slate-500 text-xs mt-2">
              Use <code className="bg-black/30 px-1 rounded text-orange-300">X-API-Key</code> from your backend server to access <code className="bg-black/30 px-1 rounded text-slate-300">/partner/me/balance</code>.
            </p>
          </div>
        </div>
      ) : account ? (
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          {/* Account header */}
          <div className="p-6 border-b border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
              <Wallet size={22} className="text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-1">Settlement Account</p>
              <p className="text-white font-bold text-lg">Partner Settlement</p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
          </div>

          {/* Account details */}
          <div className="divide-y divide-white/5">
            <div className="flex justify-between items-center px-6 py-4 text-sm">
              <span className="text-slate-400">Account ID</span>
              <code className="text-xs font-mono text-slate-200 bg-black/30 px-2 py-0.5 rounded border border-white/5">
                {account.accountId}
              </code>
            </div>
            <div className="flex justify-between items-center px-6 py-4 text-sm">
              <span className="text-slate-400">Current Balance</span>
              <span className="text-2xl font-black text-white">
                {formatCurrency(account.balance, account.currency || 'THB')}
              </span>
            </div>
            <div className="flex justify-between items-center px-6 py-4 text-sm">
              <span className="text-slate-400">Currency</span>
              <span className="text-white font-bold font-mono">{account.currency || 'THB'}</span>
            </div>
            <div className="flex justify-between items-center px-6 py-4 text-sm">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock size={13} /> Last Updated
              </span>
              <span className="text-slate-300 font-mono text-xs">
                {account.updatedAt ? new Date(account.updatedAt).toLocaleString() : '—'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-10 text-center text-slate-500">
          No account data available.
        </div>
      )}

      <div className="bg-white/3 border border-white/8 rounded-2xl p-5 flex items-start gap-3">
        <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-white">Money operations are server-to-server only</p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Deposit, Withdraw, and Transfer require <code className="bg-black/30 px-1 rounded text-orange-300">X-API-Key</code> and
            must be called from your backend server — never from a browser. See the <strong className="text-slate-300">Developer Console</strong> for endpoint docs and code examples.
          </p>
        </div>
      </div>
    </div>
  );
}
