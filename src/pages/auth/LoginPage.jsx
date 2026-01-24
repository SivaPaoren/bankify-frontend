import { useState } from "react";
import { useNavigate } from "react-router-dom";
// later you’ll replace this with axios + real API

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@bankify.local");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // TEMP: fake login, you’ll replace with backend call
    if (email && password) {
      // localStorage.setItem("token", "dummy");
      navigate(role === "admin" ? "/admin/dashboard" : "/client/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-2 text-slate-900">Bankify Login</h1>
        <p className="text-sm text-slate-500 mb-6">
          Choose a role and enter your credentials to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bankify.local"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
          <div>
            <p className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </p>
            <div className="grid grid-cols-2 gap-2">
              {["admin", "client"].map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium cursor-pointer transition ${
                    role === option
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option}
                    checked={role === option}
                    onChange={(event) => setRole(event.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  {option === "admin" ? "Admin" : "Client"}
                </label>
              ))}
            </div>
          </div>
