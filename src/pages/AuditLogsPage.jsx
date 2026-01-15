import { useEffect, useState } from "react";

export default function AuditLogsPage() {
  // ERD-correct mock data (temporary, will be replaced by API)
  const dummyLogs = [
    {
      id: "log_001",
      user_id: "user_123",
      action: "CREATE_ACCOUNT",
      entity_type: "ACCOUNT",
      entity_id: "acc_456",
      created_at: "2026-01-12T09:15:00Z",
    },
    {
      id: "log_002",
      user_id: "user_789",
      action: "PROCESS_PAYMENT",
      entity_type: "PAYMENT",
      entity_id: "pay_001",
      created_at: "2026-01-12T10:42:00Z",
    },
    {
      id: "log_003",
      user_id: "user_123",
      action: "FREEZE_ACCOUNT",
      entity_type: "ACCOUNT",
      entity_id: "acc_789",
      created_at: "2026-01-13T08:05:00Z",
    },
  ];

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // later: replace with axios.get("/api/audit-logs")
    setLogs(dummyLogs);
    setLoading(false);
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading audit logs...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                Log ID
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                User ID
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                Action
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                Entity Type
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                Entity ID
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                Created At
              </th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{log.id}</td>
                <td className="px-4 py-2">{log.user_id}</td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">{log.entity_type}</td>
                <td className="px-4 py-2">
                  {log.entity_id ?? "-"}
                </td>
                <td className="px-4 py-2">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
