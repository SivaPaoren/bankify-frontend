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
        // Ensure data is array
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
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-500">System-wide activity trail.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm focus-within:border-emerald-500 transition">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            className="outline-none text-sm w-64 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-8 text-slate-400">Loading audit logs...</td></tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono w-48">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs">{log.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-600">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="text-slate-400" />
                      {log.details || '-'}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center py-8 text-slate-400">No audit logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
