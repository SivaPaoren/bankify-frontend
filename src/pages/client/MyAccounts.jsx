import { useEffect, useState } from "react";
import Table from "../../components/common/Table.jsx";

export default function MyAccounts() {
  const dummyAccounts = [
    {
      id: "acc_001",
      type: "WALLET",
      currency: "THB",
      balance: 1000,
      created_at: "2026-01-08T10:00:00Z",
    },
    {
      id: "acc_002",
      type: "SAVINGS",
      currency: "USD",
      balance: 200,
      created_at: "2026-01-09T15:30:00Z",
    },
  ];

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAccounts(dummyAccounts);
    setLoading(false);
  }, []);

  const columns = [
    { key: "id", label: "Account ID" },
    { key: "type", label: "Type" },
    { key: "currency", label: "Currency" },
    { key: "balance", label: "Balance" },
    {
      key: "created_at",
      label: "Created At",
      render: (row) => new Date(row.created_at).toLocaleString(),
    },
  ];

  if (loading) {
    return <p className="text-sm text-slate-500">Loading accounts...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Accounts</h1>
        <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          Create new account
        </button>
      </div>

      <Table columns={columns} data={accounts} />
    </div>
  );
}
