import { useEffect, useState } from "react";
import Table from "../components/Table";
import StatusBadge from "../components/StatusBadge";

export default function CustomersPage() {
  const dummyCustomers = [
    {
      id: "cus_001",
      full_name: "Namjoon Kim",
      email: "namjoon.kim@example.com",
      type: "INDIVIDUAL",
      status: "ACTIVE",
      created_at: "2026-01-05T09:20:00Z",
    },
    {
      id: "cus_002",
      full_name: "Bankify Corp",
      email: "contact@bankify.co",
      type: "BUSINESS",
      status: "ACTIVE",
      created_at: "2026-01-07T14:45:00Z",
    },
    {
      id: "cus_003",
      full_name: "Pretty Princess",
      email: "pretty.princess@example.com",
      type: "INDIVIDUAL",
      status: "FROZEN",
      created_at: "2026-01-09T11:10:00Z",
    },
  ];

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCustomers(dummyCustomers);
    setLoading(false);
  }, []);

  const columns = [
    { key: "id", label: "Customer ID" },
    { key: "full_name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "type", label: "Type" },
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
        Loading customers...
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Customers</h1>
      <Table columns={columns} data={customers} />
    </div>
  );
}
