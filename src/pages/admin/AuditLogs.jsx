import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../api';
import {
  Clock, User, Shield, Cpu, Database,
  ChevronLeft, ChevronRight, FileText, AlertCircle, Calendar,
  ChevronUp, ChevronDown, ChevronsUpDown
} from 'lucide-react';
import FilterDropdown from '../../components/common/FilterDropdown';

// Parse "reason=admin_FROZEN" → "Admin → FROZEN"
function parseDetails(details, entityType, entityId) {
  if (!details && !entityId) return null;
  if (details) {
    const match = details.match(/^reason=admin_(.+)$/);
    if (match) return `Admin → ${match[1]}`;
    const txMatch = details.match(/^reason=(.+)$/);
    if (txMatch) return txMatch[1].replace(/_/g, ' ');
    return details;
  }
  return `${entityType ?? ''}: ${entityId ?? ''}`;
}

const ACTOR_BADGE = {
  USER: { cls: 'bg-blue-500/10 text-blue-300 border-blue-500/20', Icon: User, label: 'USER' },
  ATM: { cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20', Icon: Cpu, label: 'ATM' },
  PARTNER: { cls: 'bg-purple-500/10 text-purple-300 border-purple-500/20', Icon: Shield, label: 'PARTNER' },
};

const ACTION_COLOR = {
  USER_LOGIN: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
  ACCOUNT_CREATE: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  ACCOUNT_UPDATE: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
  ACCOUNT_FREEZE: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  ACCOUNT_REACTIVATE: 'text-teal-300 bg-teal-500/10 border-teal-500/20',
  ACCOUNT_CLOSE: 'text-red-300 bg-red-500/10 border-red-500/20',
  ACCOUNT_DISABLED: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  ACCOUNT_PIN_RESET: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
  TRANSACTION_DEPOSIT: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  TRANSACTION_WITHDRAW: 'text-red-300 bg-red-500/10 border-red-500/20',
  TRANSACTION_TRANSFER: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
  TX_DEPOSIT: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  TX_WITHDRAW: 'text-red-300 bg-red-500/10 border-red-500/20',
  TX_TRANSFER: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
  CUSTOMER_CREATE: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  CUSTOMER_UPDATE: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  CUSTOMER_FREEZE: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  CUSTOMER_REACTIVATE: 'text-teal-300 bg-teal-500/10 border-teal-500/20',
  CUSTOMER_CLOSE: 'text-red-300 bg-red-500/10 border-red-500/20',
  PARTNER_ROTATION_APPROVED: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
  PARTNER_ROTATION_REJECTED: 'text-red-300 bg-red-500/10 border-red-500/20',
  PARTNER_APP_APPROVED: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  PARTNER_APP_DISABLED: 'text-red-300 bg-red-500/10 border-red-500/20',
  PARTNER_APP_ACTIVATED: 'text-teal-300 bg-teal-500/10 border-teal-500/20',
};

const toStartCase = (str) =>
  str ? str.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) : '';

const PAGE_SIZE_OPTIONS = [
  { key: '25', label: '25 rows' },
  { key: '50', label: '50 rows' },
  { key: '100', label: '100 rows' },
];

const ACTION_FLAT_OPTIONS = [
  { key: 'ALL', label: 'All Actions' },
  { key: 'USER_LOGIN', label: 'User Login' },
  { key: 'ACCOUNT_CREATE', label: 'Create Account' },
  { key: 'ACCOUNT_FREEZE', label: 'Freeze Account' },
  { key: 'ACCOUNT_REACTIVATE', label: 'Reactivate Account' },
  { key: 'ACCOUNT_CLOSE', label: 'Close Account' },
  { key: 'ACCOUNT_PIN_RESET', label: 'PIN Reset' },
  { key: 'CUSTOMER_CREATE', label: 'Create Customer' },
  { key: 'CUSTOMER_FREEZE', label: 'Freeze Customer' },
  { key: 'CUSTOMER_REACTIVATE', label: 'Reactivate Customer' },
  { key: 'CUSTOMER_CLOSE', label: 'Close Customer' },
  { key: 'TRANSACTION_DEPOSIT', label: 'Deposit' },
  { key: 'TRANSACTION_WITHDRAW', label: 'Withdraw' },
  { key: 'TRANSACTION_TRANSFER', label: 'Transfer' },
  { key: 'PARTNER_ROTATION_APPROVED', label: 'Approve Rotation' },
  { key: 'PARTNER_ROTATION_REJECTED', label: 'Reject Rotation' },
  { key: 'PARTNER_APP_APPROVED', label: 'Approve Partner App' },
  { key: 'PARTNER_APP_DISABLED', label: 'Disable Partner App' },
  { key: 'PARTNER_APP_ACTIVATED', label: 'Reactivate Partner App' },
];

const ACTOR_OPTIONS = [
  { key: 'ALL', label: 'All Sources' },
  { key: 'USER', label: 'Portal Users', cls: 'border-blue-500/20 text-blue-400', activeCls: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
  { key: 'ATM', label: 'ATM Terminals', cls: 'border-amber-500/20 text-amber-400', activeCls: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  { key: 'PARTNER', label: 'Partner Apps', cls: 'border-purple-500/20 text-purple-400', activeCls: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
];

export default function AuditLogs() {
  const [actorFilter, setActorFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = {};
        if (actorFilter !== 'ALL') params.actorType = actorFilter;
        if (actionFilter !== 'ALL') params.action = actionFilter;

        const data = await adminService.getAuditLogs(params);
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [actorFilter, actionFilter]);

  // Reset to page 1 when any filter changes
  useEffect(() => { setCurrentPage(1); }, [actorFilter, actionFilter, dateFrom, dateTo, pageSize, sortConfig]);

  const filteredLogs = useMemo(() => {
    let result = logs.filter(log => {
      // Actor and Action are now filtered by the backend
      if (dateFrom && log.createdAt && log.createdAt < dateFrom) return false;
      if (dateTo && log.createdAt && log.createdAt.slice(0, 10) > dateTo) return false;
      return true;
    });

    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === 'createdAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [logs, dateFrom, dateTo, sortConfig]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Stats — always from full (unfiltered) log set
  const stats = {
    total: logs.length,
    recent: logs.filter(l => (Date.now() - new Date(l.createdAt)) < 86400000).length,
    users: logs.filter(l => l.actorType === 'USER').length,
    errors: logs.filter(l => l.action?.includes('FAIL') || l.action?.includes('ERROR') || l.details?.includes('error')).length,
  };

  // Quick-filter helpers
  const applyQuickFilter = (actor, action) => {
    setActorFilter(actor ?? 'ALL');
    setActionFilter(action ?? 'ALL');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActorFilter('ALL');
    setActionFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    setSortConfig({ key: 'createdAt', direction: 'desc' });
  };

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ChevronsUpDown size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-cyan-400" /> : <ChevronDown size={14} className="text-cyan-400" />;
  };

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Audit Logs
          </h1>
          <p className="text-primary-300 mt-1">Full audit trail of all system actions and events.</p>
        </div>
        <div className="text-xs font-mono text-primary-400 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
          {logs.length} total events
        </div>
      </div>

      {/* ── Stats Row ── same compact card style as Transactions/Customers/Accounts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => applyQuickFilter('ALL', 'ALL')}
          className="text-left bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-white/20 transition-all group"
        >
          <div className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">Total Events</div>
          <div className="text-2xl font-bold text-white group-hover:text-cyan-200 transition-colors">{stats.total}</div>
        </button>

        <button
          onClick={() => {
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            const today = new Date().toISOString().slice(0, 10);
            setDateFrom(yesterday);
            setDateTo(today);
            setActorFilter('ALL');
            setActionFilter('ALL');
            setCurrentPage(1);
          }}
          className="text-left bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-white/20 transition-all group"
        >
          <div className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">Last 24h</div>
          <div className="text-2xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">{stats.recent}</div>
        </button>

        <button
          onClick={() => applyQuickFilter('USER', 'ALL')}
          className="text-left bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-blue-500/30 transition-all group"
        >
          <div className="text-xs text-blue-400/80 uppercase tracking-widest font-bold mb-1">User Actions</div>
          <div className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">{stats.users}</div>
        </button>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-xs text-red-400/80 uppercase tracking-widest font-bold mb-1">Errors / Failures</div>
          <div className="text-2xl font-bold text-red-400">{stats.errors}</div>
        </div>
      </div>

      {/* ── Toolbar — date left, filters right ── */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white/3 border border-white/10 rounded-2xl px-4 py-3">

        {/* Left: Date Range */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors">
            <Calendar size={14} className="text-primary-400 shrink-0" />
            <input
              type="date"
              className="bg-transparent text-primary-300 text-sm outline-none cursor-pointer"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              title="From date"
            />
          </div>
          <span className="text-primary-500 text-xs">to</span>
          <div className="flex items-center gap-1.5 bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors">
            <Calendar size={14} className="text-primary-400 shrink-0" />
            <input
              type="date"
              className="bg-transparent text-primary-300 text-sm outline-none cursor-pointer"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              title="To date"
            />
          </div>
        </div>

        {/* Right: Filters pushed to far right */}
        <div className="flex items-center gap-3 ml-auto shrink-0 flex-wrap">
          <FilterDropdown
            label="Actor"
            options={ACTOR_OPTIONS}
            value={actorFilter}
            onChange={setActorFilter}
          />
          <FilterDropdown
            label="Action"
            options={ACTION_FLAT_OPTIONS}
            value={actionFilter}
            onChange={setActionFilter}
          />
          <FilterDropdown
            label="Rows"
            options={PAGE_SIZE_OPTIONS}
            value={String(pageSize)}
            onChange={v => setPageSize(Number(v))}
          />

          {(actorFilter !== 'ALL' || actionFilter !== 'ALL' || dateFrom || dateTo || sortConfig.key !== 'createdAt' || sortConfig.direction !== 'desc') && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-3 py-2.5 rounded-xl transition-all hover:bg-red-500/5 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold select-none">
              <th className="px-6 py-4 w-44 cursor-pointer hover:bg-white/10 transition-colors group" onClick={() => requestSort('createdAt')}>
                <div className="flex items-center gap-2">Timestamp {getSortIcon('createdAt')}</div>
              </th>
              <th className="px-6 py-4 w-48 cursor-pointer hover:bg-white/10 transition-colors group" onClick={() => requestSort('actorType')}>
                <div className="flex items-center gap-2">Actor {getSortIcon('actorType')}</div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-white/10 transition-colors group" onClick={() => requestSort('action')}>
                <div className="flex items-center gap-2">Action {getSortIcon('action')}</div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-white/10 transition-colors group" onClick={() => requestSort('entityType')}>
                <div className="flex items-center gap-2">Target {getSortIcon('entityType')}</div>
              </th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-primary-400/60">
                    <div className="w-8 h-8 border-2 border-primary-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    <span className="text-sm italic">Loading audit logs…</span>
                  </div>
                </td>
              </tr>
            ) : paginatedLogs.length > 0 ? (
              paginatedLogs.map((log, idx) => {
                const actor = ACTOR_BADGE[log.actorType] ?? ACTOR_BADGE.USER;
                const ActorIcon = actor.Icon;
                const actionCls = ACTION_COLOR[log.action] ?? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20';
                const detail = parseDetails(log.details, log.entityType, log.entityId);
                const ts = log.createdAt
                  ? new Date(log.createdAt).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })
                  : '—';

                return (
                  <tr key={log.id ?? idx} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm text-primary-300 font-mono w-44">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-primary-500 shrink-0" />
                        <span className="text-xs">{ts}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 w-48">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1.5 self-start px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${actor.cls}`}>
                          <ActorIcon size={10} />
                          {actor.label}
                        </span>
                        <span className="text-xs text-primary-100 font-mono group-hover:text-cyan-200 transition-colors truncate max-w-[180px]" title={log.actorId}>
                          {log.actorId || '—'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`font-bold px-2.5 py-1 rounded-lg text-xs border shadow-sm ${actionCls}`}>
                        {toStartCase(log.action)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {log.entityType ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary-300 uppercase tracking-wider">{log.entityType}</span>
                          <span className="text-xs font-mono text-primary-400 truncate max-w-40" title={log.entityId}>
                            {log.entityId ? `${String(log.entityId).substring(0, 16)}…` : '—'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-primary-600">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-primary-100">
                      {detail ? (
                        <div className="flex items-center gap-2">
                          <Database size={13} className="text-primary-400 shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ) : (
                        <span className="text-primary-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-20">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <AlertCircle size={28} className="text-primary-500" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-base">No logs found</p>
                      <p className="text-sm text-primary-400 mt-1">No audit events match your current filters.</p>
                    </div>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 px-4 py-2 rounded-xl transition-all hover:bg-cyan-500/5 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {!loading && filteredLogs.length > 0 && (
        <div className="flex items-center justify-between text-sm text-primary-400">
          <span>
            Showing{' '}
            <span className="text-white font-semibold">
              {Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)}–{Math.min(currentPage * pageSize, filteredLogs.length)}
            </span>
            {' '}of{' '}
            <span className="text-white font-semibold">{filteredLogs.length}</span>
            {' '}events
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium border transition-all
                    ${currentPage === page
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      : 'border-white/10 hover:bg-white/5 text-primary-300 hover:text-white'
                    }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
