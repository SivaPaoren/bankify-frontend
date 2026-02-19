import React, { useState, useEffect } from 'react';
import { adminService } from '../../api';
import { FileText, Search, Clock, User, AlertCircle } from 'lucide-react';

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await adminService.getAuditLogs();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log =>
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actorType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit Logs</h1>
          <p className="text-primary-200">System-wide activity trail.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl shadow-inner focus-within:border-cyan-500/50 focus-within:bg-black/20 transition-all group">
          <Search size={18} className="text-primary-400 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search logs..."
            className="outline-none text-sm w-64 bg-transparent text-white placeholder:text-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold">
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-12 text-primary-400/60 italic">Loading audit logs...</td></tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-sm text-primary-200 font-mono w-56">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-primary-400" />
                      <span className="text-xs text-primary-400 uppercase">{log.actorType || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg text-xs border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.1)]">{log.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <div className="p-1 rounded bg-white/10">
                        <User size={12} className="text-primary-200" />
                      </div>
                      <span className="text-sm group-hover:text-cyan-200 transition-colors font-mono text-xs">{log.actorId || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-primary-100">
                    <div className="flex items-center gap-2">
                      {log.details || log.entityId ? (
                        <>
                          <AlertCircle size={14} className="text-primary-400" />
                          {log.details || `${log.entityType}: ${log.entityId}`}
                        </>
                      ) : (
                        <span className="text-primary-600">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center py-12 text-primary-400/60 italic">No audit logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
