// src/pages/DashboardPage.jsx
export default function DashboardPage() {
  const stats = [
    { label: "Total Customers", value: 128 },
    { label: "Active Accounts", value: 342 },
    { label: "Payments Today", value: 27 },
    { label: "Failed Transactions", value: 3 },
  ];

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-600">
          Overview of system activity and performance
        </p>
      </div>

      {/* Stats section */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
          Key Metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-6
                         hover:shadow-md transition-shadow"
            >
              <p className="text-sm text-slate-500">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-slate-200" />

      {/* System status */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          System Status
        </h2>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-2">
          <p className="text-sm text-slate-600 leading-relaxed">
            All core services are operating normally. Transactions,
            account updates, and ledger entries are being processed
            without delays.
          </p>

          <p className="text-xs text-slate-400">
            Last checked: just now
          </p>
        </div>
      </section>
    </div>
  );
}
