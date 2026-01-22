import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateClientPage() {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState("");
  const [apiKey] = useState("sk_test_9f8a1b2c3d4e"); // mock key (design-only)

  return (
    <div className="max-w-xl space-y-8">
      {/* Go back */}
      <button
        onClick={() => navigate("/admin/clients")}
        className="text-sm text-slate-600 hover:underline"
      >
        ← Back to API Clients
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Create API Client
        </h1>
        <p className="text-sm text-slate-600">
          Generate an API key for a new partner application
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Client Name
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ecommerce Team"
            className="mt-1 w-full rounded-lg border border-slate-300
                       px-3 py-2 text-sm focus:outline-none
                       focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm
                       hover:bg-slate-800 transition"
          >
            Create Client
          </button>

          <button
            onClick={() => navigate("/admin/clients")}
            className="px-4 py-2 rounded-lg border border-slate-300
                       text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* API Key display (DESIGN ONLY) */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium text-yellow-800">
          API Key (shown once)
        </p>

        <div className="flex items-center justify-between bg-white rounded-lg
                        border px-3 py-2 text-sm font-mono">
          {apiKey}
          <button className="text-slate-600 hover:underline">
            Copy
          </button>
        </div>

        <p className="text-xs text-yellow-700">
          ⚠️ This API key will not be shown again. Store it securely.
        </p>
      </div>
    </div>
  );
}
