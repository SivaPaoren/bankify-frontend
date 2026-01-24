// src/pages/atm/ATMHome.jsx
export default function ATMHome() {
  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        {["Deposit", "Withdraw", "Transfer"].map(action => (
          <button
            key={action}
            className="h-28 bg-zinc-800 rounded-xl text-xl font-semibold"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Last 3 Transactions */}
      <div className="bg-zinc-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          Last 3 Transactions
        </h2>

        {/* mock data now, API later */}
        <ul className="space-y-2 text-zinc-300">
          <li>Withdrawal −500 THB</li>
          <li>Deposit +1,000 THB</li>
          <li>Transfer −200 THB</li>
        </ul>
      </div>

    </div>
  );
}
