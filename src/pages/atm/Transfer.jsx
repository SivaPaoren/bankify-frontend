// src/pages/atm/Transfer.jsx
import { useState } from "react";

export default function TransferPage() {
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="max-w-md space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Transfer
        </h2>
        <p className="text-sm text-slate-600">
          Send money to another account
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Recipient Account Number
          </label>
          <input
            type="text"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            placeholder="9359XXXXXXXX"
            className="mt-1 w-full rounded-lg border border-slate-300
                       px-3 py-2 text-sm focus:outline-none
                       focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Amount (THB)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="25.00"
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
          Transfer
        </button>
      </div>

      {/* Info */}
      <div className="text-xs text-slate-500 space-y-1">
        <p>• Transfers are processed immediately.</p>
        <p>• Double-check the recipient account number.</p>
      </div>
    </div>
  );
}
