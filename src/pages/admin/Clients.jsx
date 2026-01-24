import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialClients = [
  {
    id: "cli_001",
    name: "Meridian Payroll",
    email: "ops@meridianpayroll.co",
    status: "ACTIVE",
    accountsCreated: 128,
    apiUsage: "1.2M requests",
    apiEnvironment: "LIVE",
  },
  {
    id: "cli_002",
    name: "Northwind Retail",
    email: "admin@northwindretail.com",
    status: "SUSPENDED",
    accountsCreated: 43,
    apiUsage: "320k requests",
    apiEnvironment: "TEST",
  },
  {
    id: "cli_003",
    name: "Atlas Mobility",
    email: "dev@atlasmobility.io",
    status: "ACTIVE",
    accountsCreated: 76,
    apiUsage: "870k requests",
    apiEnvironment: "LIVE",
  },
];

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState(initialClients);
  const [selectedClientId, setSelectedClientId] = useState(initialClients[0]?.id || "");

  const selectedClient = clients.find((client) => client.id === selectedClientId);

  const toggleStatus = (clientId) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === clientId
          ? {
              ...client,
              status: client.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
            }
          : client
      )
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Client Management</h1>
          <p className="text-slate-600">
            Monitor API clients, review usage, and enable or disable access in real time.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/clients/create")}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
        >
          Create Client
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Client Directory</h2>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
              Export list
            </button>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">Client</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">Contact</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-t border-slate-100 hover:bg-slate-50/60"
                >
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedClientId(client.id)}
                      className="text-left"
                    >
                      <p className="font-semibold text-slate-900">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.id}</p>
                    </button>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{client.email}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        client.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      onClick={() => toggleStatus(client.id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      {client.status === "ACTIVE" ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Client Detail</h2>
          {selectedClient ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-slate-500">Client</p>
                <p className="text-lg font-semibold text-slate-900">
                  {selectedClient.name}
                </p>
                <p className="text-xs text-slate-500">{selectedClient.email}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">API usage</p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {selectedClient.apiUsage}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedClient.accountsCreated} accounts created
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  API keys environment
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {selectedClient.apiEnvironment}
                </p>
                <button className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                  View API keys
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Select a client to review usage, status, and API details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
