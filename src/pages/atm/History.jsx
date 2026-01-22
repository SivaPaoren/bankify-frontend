// src/pages/atm/History.jsx
export default function HistoryPage() {
  // DESIGN-ONLY mock data
  const transactions = [
    {
      id: "tx-001",
      type: "DEPOSIT",
      amount: 1000,
      date: "2024-01-20 10:12",
    },
    {
      id: "tx-002",
      type: "WITHDRAW",
      amount: 200,
      date: "2024-01-21 14:30",
    },
    {
      id: "tx-003",
      type: "TRANSFER",
      amount: 150,
      date: "2024-01-22 09:05",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Transaction History
        </h2>
        <p className="text-sm text-slate-600">
          Review your recent account activity
        </p>
      </div>

      {/* Empty state */}
      {transactions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center space-y-4">
          <div className="text-4xl">📄</div>
          <h3 className="text-lg font-semibold text-slate-900">
            No transactions yet
          </h3>
          <p className="text-sm text-slate-600">
            Your deposits, withdrawals, and transfers will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Type</th>
                <th className="px-6 py-3 text-right font-medium">Amount (THB)</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 text-slate-600">
                    {tx.date}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                        ${
                          tx.type === "DEPOSIT"
                            ? "bg-green-100 text-green-700"
                            : tx.type === "WITHDRAW"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {tx.type}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    {tx.type === "WITHDRAW" ? "-" : "+"}
                    {tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
