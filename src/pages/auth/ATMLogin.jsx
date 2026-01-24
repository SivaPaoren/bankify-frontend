import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ATMLogin() {
  const navigate = useNavigate();
  const [bankId, setBankId] = useState("ATM-0001");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (bankId && password) {
      navigate("/atm");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-2">Bankify ATM</h1>
        <p className="text-sm text-zinc-400 mb-6">
          Sign in with your Bank ID for quick transactions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">
              Bank ID
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime-400"
              value={bankId}
              onChange={(event) => setBankId(event.target.value)}
              placeholder="ATM-0001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime-400"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 transition"
          >
            Enter ATM
          </button>
        </form>
      </div>
    </div>
  );
}
