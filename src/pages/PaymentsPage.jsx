import { useEffect, useState } from "react";
import Table from "../components/Table";
import StatusBadge from "../components/StatusBadge";

export default function PaymentsPage() {
  // ERD-correct mock data (temporary)
  const dummyPayments = [
    {
      id: "pay_001",
      type: "DEPOSIT",
      amount: 150,
      currency: "USD",
      status: "SUCCEEDED",
      created_at: "2026-01-10T10:30:00Z",
    },
    {
      id: "pay_002",
      type: "WITHDRAWAL",
      amount: 75,
      currency: "EUR",
      status: "PENDING",
      created_at: "2026-01-11T14:05:00Z",
    },
  ];

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // later: replace with API call
    setPayments(dummyPayments);
    setLoading(false);
  }, []);

  const columns = [
    { key: "id", label: "Payment ID" },
    { key: "type", label: "Type" },
    { key: "amount", label: "Amount" },
    { key: "currency", label: "Currency" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "created_at",
      label: "Created At",
      render: (row) =>
        new Date(row.created_at).toLocaleString(),
    },
  ];

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading payments...
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payments</h1>
      <Table columns={columns} data={payments} />
    </div>
  );
}
