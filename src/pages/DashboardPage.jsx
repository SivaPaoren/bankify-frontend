export default function DashboardPage() {
  // temporary mock metrics (replace with API later)
  const stats = [
    { label: "Total Customers", value: 128 },
    { label: "Active Accounts", value: 342 },
    { label: "Payments Today", value: 27 },
    { label: "Failed Transactions", value: 3 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl shadow-sm p-5"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* System note */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-lg font-semibold">System Status</h2>
        <p className="mt-2 text-sm text-slate-600">
          Bankify is running normally. All core services are operational.
          Transactions and ledger entries are being recorded successfully.
        </p>
      </div>
    </div>
  );
}
