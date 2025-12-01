// src/pages/AccountsPage.jsx
export default function AccountsPage() {
  // later: fetch accounts from backend
  const dummyAccounts = [
    { id: 1, type: "WALLET", currency: "THB", balance: 1000 },
    { id: 2, type: "SAVINGS", currency: "USD", balance: 200 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          Create new account
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">ID</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Type</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Currency</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Balance</th>
            </tr>
          </thead>
          <tbody>
            {dummyAccounts.map((acc) => (
              <tr key={acc.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{acc.id}</td>
                <td className="px-4 py-2">{acc.type}</td>
                <td className="px-4 py-2">{acc.currency}</td>
                <td className="px-4 py-2">{acc.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
