import React, { useState, useEffect } from 'react';
import { adminService } from '../../api';
import { Search, Clock, User, Shield, Cpu, Database, AlertCircle } from 'lucide-react';

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
  ACCOUNT_UPDATED: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
  ACCOUNT_DISABLED: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
  ACCOUNT_PIN_RESET: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
  TX_DEPOSIT: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  TX_WITHDRAW: 'text-red-300 bg-red-500/10 border-red-500/20',
  TX_TRANSFER: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
};

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const filteredLogs = logs.filter(log => {
    if (actorFilter !== 'ALL' && log.actorType !== actorFilter) return false;
    if (actionFilter !== 'ALL' && !log.action?.includes(actionFilter)) return false;
    if (dateFilter && !log.createdAt?.startsWith(dateFilter)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.action?.toLowerCase().includes(term) ||
        log.actorId?.toLowerCase().includes(term) ||
        log.entityType?.toLowerCase().includes(term) ||
        (log.details && log.details.toLowerCase().includes(term))
      );
    }
    return true;
  });

  // Stats
  const stats = {
    total: filteredLogs.length,
    users: filteredLogs.filter(l => l.actorType === 'USER').length,
    errors: filteredLogs.filter(l => l.action?.includes('FAIL') || l.action?.includes('ERROR') || l.details?.includes('error')).length,
    recent: filteredLogs.filter(l => {
      const date = new Date(l.createdAt);
      const now = new Date();
      return (now - date) < 24 * 60 * 60 * 1000; // last 24h
    }).length
  };

  const ACTOR_CHIPS = [
    { key: 'ALL', label: 'All Actors' },
    { key: 'ADMIN', label: 'Admin', cls: 'border-cyan-500/20 text-cyan-400', activeCls: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' },
    { key: 'USER', label: 'User', cls: 'border-blue-500/20 text-blue-400', activeCls: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
    { key: 'ATM', label: 'ATM', cls: 'border-amber-500/20 text-amber-400', activeCls: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
    { key: 'PARTNER', label: 'Partner', cls: 'border-purple-500/20 text-purple-400', activeCls: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
    { key: 'SYSTEM', label: 'System', cls: 'border-primary-500/20 text-primary-400', activeCls: 'bg-primary-500/20 border-primary-500/40 text-primary-300' },
  ];

  // Common action groups to filter by
  const ACTION_CHIPS = [
    { key: 'ALL', label: 'All Actions' },
    { key: 'LOGIN', label: 'Auth' },
    { key: 'CREATE', label: 'Create' },
    { key: 'UPDATE', label: 'Update' },
    { key: 'DELETE', label: 'Delete' },
    { key: 'TX', label: 'Transactions' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">Total Events</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">Last 24h</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.recent}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-xs text-blue-400/80 uppercase tracking-widest font-bold mb-1">User Actions</div>
          <div className="text-2xl font-bold text-blue-400">{stats.users}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-xs text-red-400/80 uppercase tracking-widest font-bold mb-1">Errors/Failures</div>
          <div className="text-2xl font-bold text-red-400">{stats.errors}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Search & Date */}
        <div className="flex gap-3 min-w-[300px]">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl shadow-inner focus-within:border-cyan-500/50 focus-within:bg-black/20 transition-all flex-1 group">
            <Search size={18} className="text-primary-400 group-focus-within:text-cyan-400 transition-colors shrink-0" />
            <input
              type="text"
              placeholder="Search logs..."
              className="outline-none text-sm w-full bg-transparent text-white placeholder:text-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <input
            type="date"
            className="bg-black/20 border border-white/10 text-primary-300 rounded-xl px-4 py-2.5 focus:border-cyan-500 outline-none hover:bg-white/5 transition-colors"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Actor Chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-primary-400 font-bold uppercase tracking-widest mr-1">Actor</span>
            {ACTOR_CHIPS.map(c => (
              <button
                key={c.key}
                onClick={() => setActorFilter(c.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${actorFilter === c.key
                    ? c.activeCls || 'bg-white/10 text-white border-white/30'
                    : c.cls || 'border-white/10 text-primary-300 hover:bg-white/5'
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          {/* Action Chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-primary-400 font-bold uppercase tracking-widest mr-1">Action</span>
            {ACTION_CHIPS.map(c => (
              <button
                key={c.key}
                onClick={() => setActionFilter(c.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${actionFilter === c.key
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'border-white/10 text-primary-300 hover:bg-white/5'
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
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
              <tr><td colSpan="5" className="text-center py-12 text-primary-400/60 italic">Loading audit logs...</td></tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log, idx) => {
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
                        {log.action}
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
              <tr><td colSpan="5" className="text-center py-12 text-primary-400/60 italic">No audit logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
