import React, { useState } from 'react';
import { Search, FileText, Clock, User } from 'lucide-react';

export default function AuditLogs() {
  // Mock Data
  const logs = [
    { id: 1, action: "CUSTOMER_CREATED", user: "admin@bankify.local", details: "Created customer Jane Doe", time: "2 mins ago" },
    { id: 2, action: "ACCOUNT_FROZEN", user: "admin@bankify.local", details: "Frozen account #8822 due to suspicion", time: "1 hour ago" },
    { id: 3, action: "API_CLIENT_DISABLED", user: "system", details: "Auto-disabled Client X for rate limit", time: "3 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-500">System-wide activity trail.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm w-72">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-slate-100 text-slate-600">
                      <FileText size={14} />
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{log.action}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  {log.user}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{log.details}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Clock size={12} />
                  {log.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
