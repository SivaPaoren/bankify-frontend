import React, { useState } from 'react';
import { FileText, Search, Clock, User } from 'lucide-react';

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Logs
  const logs = [
    { id: 1, action: "LOGIN_SUCCESS", user: "admin@bankify.local", ip: "192.168.1.1", time: "2024-02-07 10:00:00" },
    { id: 2, action: "CREATE_CLIENT", user: "admin@bankify.local", ip: "192.168.1.1", time: "2024-02-07 10:05:22" },
    { id: 3, action: "FREEZE_ACCOUNT", user: "system_monitor", ip: "10.0.0.55", time: "2024-02-07 11:30:00" },
  ];

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
              <th className="px-6 py-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    {log.time}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-700">{log.action}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-600">{log.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-mono">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
