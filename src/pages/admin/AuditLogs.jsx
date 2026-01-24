import { useMemo, useState } from "react";

const auditEntries = [
  {
    id: "log_9012",
    action: "ACCOUNT_CREATE",
    userId: "usr_001",
    detail: "Created SAVINGS account for Horizon Imports",
    timestamp: "2024-02-11 09:14",
  },
  {
    id: "log_9013",
    action: "TRANSFER_FAILED",
    userId: "usr_003",
    detail: "Transfer failed for acc_2107",
    timestamp: "2024-02-11 10:02",
  },
  {
    id: "log_9014",
    action: "CLIENT_SUSPEND",
    userId: "admin_22",
    detail: "Suspended client cli_002",
    timestamp: "2024-02-11 11:37",
  },
  {
    id: "log_9015",
    action: "WEBHOOK_RETRY",
    userId: "system",
    detail: "Retry queued for webhook wh_304",
    timestamp: "2024-02-11 12:05",
  },
];

const webhookEvents = [
  {
    id: "wh_301",
    endpoint: "https://meridianpayroll.co/webhooks",
    statusCode: 200,
    attempts: 1,
    lastSent: "2024-02-11 11:52",
  },
  {
    id: "wh_302",
    endpoint: "https://northwindretail.com/hooks",
    statusCode: 500,
    attempts: 3,
    lastSent: "2024-02-11 11:50",
  },
  {
    id: "wh_303",
    endpoint: "https://atlasmobility.io/api/webhooks",
    statusCode: 202,
    attempts: 2,
    lastSent: "2024-02-11 11:48",
  },
];

export default function AuditLogs() {
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const filteredLogs = useMemo(() => {
    return auditEntries.filter((entry) => {
      const matchesQuery =
        entry.action.toLowerCase().includes(query.toLowerCase()) ||
        entry.userId.toLowerCase().includes(query.toLowerCase()) ||
        entry.detail.toLowerCase().includes(query.toLowerCase());
      const matchesAction = actionFilter === "ALL" || entry.action === actionFilter;
      return matchesQuery && matchesAction;
    });
  }, [query, actionFilter]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Audit &amp; Compliance</h1>
        <p className="text-slate-600">
          Search activity logs and review webhook delivery status for compliance reporting.
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Audit Log Viewer</h2>
            <p className="text-sm text-slate-500">
              Filter by action, user, or keyword.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search logs"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="ALL">All actions</option>
              <option value="ACCOUNT_CREATE">Account create</option>
              <option value="TRANSFER_FAILED">Transfer failed</option>
              <option value="CLIENT_SUSPEND">Client suspend</option>
              <option value="WEBHOOK_RETRY">Webhook retry</option>
            </select>
          </div>
        </div>
        <table className="mt-6 min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Action</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">User</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Detail</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((entry) => (
              <tr key={entry.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {entry.action}
                </td>
                <td className="px-4 py-3 text-slate-600">{entry.userId}</td>
                <td className="px-4 py-3 text-slate-600">{entry.detail}</td>
                <td className="px-4 py-3 text-slate-600">{entry.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">
            No log entries match your search.
          </p>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Webhook Monitor</h2>
            <p className="text-sm text-slate-500">
              Review outgoing webhook payload deliveries and status codes.
            </p>
          </div>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            Retry failed
          </button>
        </div>
        <table className="mt-6 min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Event ID
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Endpoint
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Status Code
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Attempts
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Last Sent
              </th>
            </tr>
          </thead>
          <tbody>
            {webhookEvents.map((event) => (
              <tr key={event.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-900">{event.id}</td>
                <td className="px-4 py-3 text-slate-600">{event.endpoint}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      event.statusCode >= 200 && event.statusCode < 300
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {event.statusCode}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{event.attempts}</td>
                <td className="px-4 py-3 text-slate-600">{event.lastSent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
