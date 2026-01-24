export default function History() {
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
      <div>
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <p className="text-zinc-400">Review your recent ATM activity.</p>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <div className="text-4xl">📄</div>
          <h3 className="text-lg font-semibold text-white">No transactions yet</h3>
          <p className="text-sm text-zinc-400">
            Your deposits, withdrawals, and transfers will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950 text-zinc-400">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Type</th>
                <th className="px-6 py-3 text-right font-medium">Amount (THB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="text-zinc-200">
                  <td className="px-6 py-4 text-zinc-300">{tx.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        tx.type === "DEPOSIT"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : tx.type === "WITHDRAW"
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-sky-500/20 text-sky-300"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-white">
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
