// src/pages/atm/Withdraw.jsx
import { useState } from "react";

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");

  return (
    <div className="max-w-md space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Withdraw
        </h2>
        <p className="text-sm text-slate-600">
          Withdraw money from your account
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Amount (THB)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50.00"
            className="mt-1 w-full rounded-lg border border-slate-300
                       px-3 py-2 text-sm focus:outline-none
                       focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <button
          className="w-full px-4 py-2 rounded-lg bg-slate-900
                     text-white text-sm font-medium
                     hover:bg-slate-800 transition"
        >
          Withdraw
        </button>
      </div>

      {/* Info / warning */}
      <div className="text-xs text-slate-500 space-y-1">
        <p>• Withdrawals are processed immediately.</p>
        <p>• Ensure sufficient balance before withdrawing.</p>
      </div>
    </div>
  );
}
