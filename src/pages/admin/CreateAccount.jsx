import { useState } from "react";

const bankUsers = [
  { id: "usr_001", name: "Marin Lopez", role: "Operator", status: "Active" },
  { id: "usr_002", name: "Elias Grant", role: "Viewer", status: "Active" },
  { id: "usr_003", name: "Priya Voss", role: "Operator", status: "Suspended" },
];

const initialAccounts = [
  {
    id: "acc_2041",
    customer: "Horizon Imports",
    type: "SAVINGS",
    currency: "USD",
    status: "ACTIVE",
  },
  {
    id: "acc_2107",
    customer: "Sunrise Labs",
    type: "WALLET",
    currency: "THB",
    status: "FROZEN",
  },
];

export default function CreateAccount() {
  const [accounts, setAccounts] = useState(initialAccounts);

  const updateStatus = (accountId, status) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === accountId ? { ...account, status } : account
      )
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">User &amp; Bank Account Management</h1>
        <p className="text-slate-600">
          Create foundational accounts, manage internal users, and control account status.
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bankuser Directory</h2>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            Add bankuser
          </button>
        </div>
        <table className="mt-4 min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Name</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Role</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {bankUsers.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.id}</p>
                </td>
                <td className="px-4 py-2 text-slate-600">{user.role}</td>
                <td className="px-4 py-2 text-slate-600">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Create Account Form</h2>
          <p className="mt-2 text-sm text-slate-500">
            Create a customer account using AccountService.create.
          </p>
          <form className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Customer
              </label>
              <input
                type="text"
                placeholder="Search by name or ID"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Account Type
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option>WALLET</option>
                <option>SAVINGS</option>
                <option>CURRENT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Currency
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option>USD</option>
                <option>THB</option>
                <option>EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Starting Balance
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Assigned Operator
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option>Marin Lopez</option>
                <option>Elias Grant</option>
                <option>Priya Voss</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Status Control</h2>
          <p className="mt-2 text-sm text-slate-500">
            Freeze or close accounts when suspicious activity is detected.
          </p>
          <div className="mt-4 space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-xl border border-slate-100 p-4 space-y-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">{account.customer}</p>
                  <p className="text-xs text-slate-500">
                    {account.id} · {account.type} · {account.currency}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={account.status}
                    onChange={(event) => updateStatus(account.id, event.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option>ACTIVE</option>
                    <option>FROZEN</option>
                    <option>CLOSED</option>
                  </select>
                  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
