import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../api';
import {
  Search, Clock, User, Shield, Cpu, Database,
  AlertCircle, ChevronLeft, ChevronRight, InboxIcon,
  Filter, Calendar
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
};

const toStartCase = (str) =>
  str ? str.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) : '';

const PAGE_SIZE_OPTIONS = [
  { key: '25', label: '25 rows' },
  { key: '50', label: '50 rows' },
  { key: '100', label: '100 rows' },
];

// Grouped action options for FilterDropdown (flat list with section separators)
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
  { key: 'PARTNER_ROTATION_APPROVED', 'label': 'Approve Rotation' },
  { key: 'PARTNER_ROTATION_REJECTED', label: 'Reject Rotation' },
];

const ACTOR_OPTIONS = [
  { key: 'ALL', label: 'All Sources' },
  { key: 'USER', label: 'Portal Users', cls: 'border-blue-500/20 text-blue-400', activeCls: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
  { key: 'ATM', label: 'ATM Terminals', cls: 'border-amber-500/20 text-amber-400', activeCls: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  { key: 'PARTNER', label: 'Partner Apps', cls: 'border-purple-500/20 text-purple-400', activeCls: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
];

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await adminService.getAuditLogs();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Reset to page 1 when any filter changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm, actorFilter, actionFilter, dateFrom, dateTo, pageSize]);

  const filteredLogs = useMemo(() => logs.filter(log => {
    if (actorFilter !== 'ALL' && log.actorType !== actorFilter) return false;
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (dateFrom && log.createdAt && log.createdAt < dateFrom) return false;
    if (dateTo && log.createdAt && log.createdAt.slice(0, 10) > dateTo) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.action?.toLowerCase().includes(term) ||
        log.actorId?.toLowerCase().includes(term) ||
        log.entityType?.toLowerCase().includes(term) ||
        log.entityId?.toLowerCase().includes(term) ||
        log.id?.toLowerCase().includes(term) ||
        (log.details && log.details.toLowerCase().includes(term))
      );
    }
    return true;
  }), [logs, actorFilter, actionFilter, dateFrom, dateTo, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Stats — always from full (unfiltered) log set for the cards
  const stats = {
    total: logs.length,
    recent: logs.filter(l => {
      const date = new Date(l.createdAt);
      return (Date.now() - date) < 24 * 60 * 60 * 1000;
    }).length,
    users: logs.filter(l => l.actorType === 'USER').length,
    errors: logs.filter(l =>
      l.action?.includes('FAIL') || l.action?.includes('ERROR') || l.details?.includes('error')
    ).length,
  };

  // Quick-filter click handlers for stat cards
  const applyQuickFilter = (actor, action) => {
    setActorFilter(actor ?? 'ALL');
    setActionFilter(action ?? 'ALL');
    setCurrentPage(1);
  };

  // Action option counts
  const actionCounts = useMemo(() => {
    const counts = {};
    ACTION_FLAT_OPTIONS.forEach(opt => {
      if (opt.key !== 'ALL') counts[opt.key] = logs.filter(l => l.action === opt.key).length;
    });
    return counts;
  }, [logs]);

  return (
    <div className="space-y-6">

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Events */}
        <button
          onClick={() => applyQuickFilter('ALL', 'ALL')}
          className="text-left bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">Total Events</div>
          <div className="text-2xl font-bold text-white group-hover:text-cyan-200 transition-colors">{stats.total}</div>
          <div className="text-[10px] text-primary-500 mt-1">Click to reset filters</div>
        </button>

        {/* Last 24h */}
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
          className="text-left bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">Last 24h</div>
          <div className="text-2xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">{stats.recent}</div>
          <div className="text-[10px] text-primary-500 mt-1">Click to filter</div>
        </button>

        {/* User Actions */}
        <button
          onClick={() => applyQuickFilter('USER', 'ALL')}
          className="text-left bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer group"
        >
          <div className="text-xs text-blue-400/80 uppercase tracking-widest font-bold mb-1">User Actions</div>
          <div className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">{stats.users}</div>
          <div className="text-[10px] text-primary-500 mt-1">Click to filter</div>
        </button>

        {/* Errors / Failures */}
        <button
          onClick={() => {
            setActorFilter('ALL');
            setActionFilter('ALL');
            setSearchTerm('FAIL');
            setCurrentPage(1);
          }}
          className="text-left bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-red-500/30 transition-all cursor-pointer group"
        >
          <div className="text-xs text-red-400/80 uppercase tracking-widest font-bold mb-1">Errors / Failures</div>
          <div className="text-2xl font-bold text-red-400 group-hover:text-red-300 transition-colors">{stats.errors}</div>
          <div className="text-[10px] text-primary-500 mt-1">Click to filter</div>
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col lg:flex-row gap-3 w-full">

        {/* Left: Search + Date Range */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
          {/* Search
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl shadow-inner focus-within:border-cyan-500/50 focus-within:bg-black/20 transition-all flex-1 min-w-0 group">
            <Search size={16} className="text-primary-400 group-focus-within:text-cyan-400 transition-colors shrink-0" />
            <input
              type="text"
              placeholder="Search by action, actor ID, or details…"
              className="outline-none text-sm w-full bg-transparent text-white placeholder:text-primary-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div> */}

          {/* Date range */}
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
        </div>

        {/* Right: Filters + Page Size */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <FilterDropdown
            label="Actor"
            options={ACTOR_OPTIONS}
            value={actorFilter}
            onChange={setActorFilter}
            counts={{
              USER: logs.filter(l => l.actorType === 'USER').length,
              ATM: logs.filter(l => l.actorType === 'ATM').length,
              PARTNER: logs.filter(l => l.actorType === 'PARTNER').length,
            }}
          />
          <FilterDropdown
            label="Action"
            options={ACTION_FLAT_OPTIONS}
            value={actionFilter}
            onChange={setActionFilter}
            counts={actionCounts}
          />
          <FilterDropdown
            label="Rows"
            options={PAGE_SIZE_OPTIONS}
            value={String(pageSize)}
            onChange={v => setPageSize(Number(v))}
          />

          {/* Clear filters button — only visible when filters are active */}
          {(actorFilter !== 'ALL' || actionFilter !== 'ALL' || dateFrom || dateTo || searchTerm) && (
            <button
              onClick={() => {
                setActorFilter('ALL');
                setActionFilter('ALL');
                setDateFrom('');
                setDateTo('');
                setSearchTerm('');
                setCurrentPage(1);
              }}
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
            <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold">
              <th className="px-6 py-4 w-44">Timestamp</th>
              <th className="px-6 py-4 w-48">Actor</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Target</th>
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
                    {/* TIMESTAMP */}
                    <td className="px-6 py-4 text-sm text-primary-300 font-mono w-44">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-primary-500 shrink-0" />
                        <span className="text-xs">{ts}</span>
                      </div>
                    </td>

                    {/* ACTOR */}
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

                    {/* ACTION */}
                    <td className="px-6 py-4">
                      <span className={`font-bold px-2.5 py-1 rounded-lg text-xs border shadow-sm ${actionCls}`}>
                        {toStartCase(log.action)}
                      </span>
                    </td>

                    {/* TARGET */}
                    <td className="px-6 py-4">
                      {log.entityType ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary-300 uppercase tracking-wider">{log.entityType}</span>
                          <span className="text-xs font-mono text-primary-400 truncate max-w-[160px]" title={log.entityId}>
                            {log.entityId ? `${String(log.entityId).substring(0, 16)}…` : '—'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-primary-600">—</span>
                      )}
                    </td>

                    {/* DETAILS */}
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
              /* ── Empty State ── */
              <tr>
                <td colSpan="5" className="py-20">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Filter size={28} className="text-primary-500" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-base">No logs found</p>
                      <p className="text-sm text-primary-400 mt-1">
                        No audit events match your current filters.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActorFilter('ALL');
                        setActionFilter('ALL');
                        setDateFrom('');
                        setDateTo('');
                        setSearchTerm('');
                        setCurrentPage(1);
                      }}
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

            {/* Page numbers */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
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
