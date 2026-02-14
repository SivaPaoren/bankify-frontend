import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/BankifyLogo.png";
import { User, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth(); // Destructure properly

  const [email, setEmail] = useState("admin@bankify.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Monitor Auth State for Safe Redirect
  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "CLIENT") {
        navigate("/client");
      }
      // If other roles exist, handle them or do nothing (let them see login if unrelated)
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.message || "Invalid credentials");
        setLoading(false); // Only unset loading on failure, otherwise let redirect happen
      }
      // On success, useEffect will handle the redirect
    } catch (err) {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-[480px] bg-white shadow-xl shadow-slate-200/50 rounded-3xl p-10 space-y-8 animate-page border border-slate-100">

        {/* Header with Logo */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-2">
            <img src={logo} alt="Bankify" className="w-10 h-10 object-contain invert brightness-0 filter" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 mt-2 text-lg">Sign in to your dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700 font-medium placeholder:text-slate-400"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700 font-medium placeholder:text-slate-400"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-100">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transform transition active:scale-[0.98] disabled:opacity-70 disabled:scale-100 text-lg flex items-center justify-center gap-2"
            >
              {loading ? 'Validating...' : (
                <>
                  <span>Login</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-slate-400 text-sm">
          &copy; 2026 Bankify Corp. Secure System.
        </p>
      </div>
    </div>
  );
}
