export default function Dashboard() {
  const healthStats = [
    { label: "Active Customers", value: "12,480", delta: "+4.2%" },
    { label: "System Balance", value: "$8.9M", delta: "+1.1%" },
    { label: "Successful Transactions", value: "98.4%", delta: "+0.3%" },
    { label: "Failed Transactions", value: "1.6%", delta: "-0.3%" },
  ];

  const pendingActions = [
    {
      title: "Webhook retries pending",
      detail: "5 failed deliveries need review",
      status: "High",
    },
    {
      title: "Flagged account review",
      detail: "Account #40321 requires manual approval",
      status: "Medium",
    },
    {
      title: "Client status check",
      detail: "Verify activity for Meridian Payroll",
      status: "Low",
    },
  ];

  const volumeSeries = [
    { label: "Mon", value: 40 },
    { label: "Tue", value: 65 },
    { label: "Wed", value: 30 },
    { label: "Thu", value: 80 },
    { label: "Fri", value: 55 },
    { label: "Sat", value: 45 },
    { label: "Sun", value: 70 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-600">
          Overview of system health, transaction volume, and high-priority operations.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {healthStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-semibold text-slate-900">{stat.value}</span>
              <span className="text-xs font-semibold text-emerald-600">{stat.delta}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Transaction Volume</h2>
              <p className="text-sm text-slate-500">
                Daily transfers and payments across all clients.
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Last 7 days
            </span>
          </div>
          <div className="mt-6 h-40">
            <div className="flex h-full items-end gap-3">
              {volumeSeries.map((point) => (
                <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-lg bg-indigo-500/70"
                    style={{ height: `${point.value}%` }}
                    aria-label={`${point.label} volume`}
                  />
                  <span className="text-xs text-slate-500">{point.label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Replace with Recharts to show real-time spikes and anomaly overlays.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pending Actions</h2>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
              View all
            </button>
          </div>
          <ul className="mt-5 space-y-4">
            {pendingActions.map((item) => (
              <li key={item.title} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
