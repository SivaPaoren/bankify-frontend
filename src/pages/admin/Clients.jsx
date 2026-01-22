import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ClientsPage() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([
    {
      id: "1",
      name: "Ecommerce Team",
      status: "ACTIVE",
      createdAt: "2024-01-05",
    },
    {
      id: "2",
      name: "Test Partner App",
      status: "DISABLED",
      createdAt: "2024-01-10",
    },
  ]);

  const [clientToDisable, setClientToDisable] = useState(null);

  const handleConfirmDisable = () => {
    // DESIGN-ONLY: simulate disable
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientToDisable.id
          ? { ...c, status: "DISABLED" }
          : c
      )
    );
    setClientToDisable(null);
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            API Clients
          </h1>
          <p className="text-sm text-slate-600">
            Manage external applications that access Bankify APIs
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/clients/create")}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm
                     hover:bg-slate-800 transition"
        >
          + Create Client
        </button>
      </div>

      {/* CLIENTS TABLE */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center space-y-4">
          <div className="text-4xl">🔑</div>
          <h2 className="text-lg font-semibold text-slate-900">
            No API clients yet
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Create an API client to allow external applications to securely
            access Bankify services.
          </p>
          <button
            onClick={() => navigate("/admin/clients/create")}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm
                       hover:bg-slate-800 transition"
          >
            Create your first client
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Name</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Created At</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4">{client.name}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                        ${
                          client.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                    >
                      {client.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {client.createdAt}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {client.status === "ACTIVE" ? (
                      <button
                        onClick={() => setClientToDisable(client)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Disable
                      </button>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DISABLE CONFIRMATION MODAL */}
      {clientToDisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
                        bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Disable API Client
            </h2>

            <p className="text-sm text-slate-600">
              Disabling <strong>{clientToDisable.name}</strong> will immediately
              revoke its API key. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setClientToDisable(null)}
                className="px-4 py-2 rounded-lg border border-slate-300
                           text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisable}
                className="px-4 py-2 rounded-lg bg-red-600 text-white
                           text-sm hover:bg-red-700"
              >
                Disable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
