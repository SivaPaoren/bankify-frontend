import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/BankifyLogo.png";
import { User, Lock, ArrowRight, ShieldCheck, Globe } from "lucide-react";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin, isAuthenticated, role } = useAuth();

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
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await adminLogin(email, password);

      if (!result.success) {
        setError(result.message || "Invalid Admin credentials");
        setLoading(false);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans overflow-hidden">
      {/* Left Side: Branding & Visuals (Futuristic) */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-12 bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          {/* Decorative circles */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center space-y-8 animate-page">
          <div className="w-32 h-32 mx-auto bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
            <img src={logo} alt="Bankify" className="w-20 h-20 object-contain invert brightness-0 filter drop-shadow-xl" />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-blue-300">
                Digital Banking
              </span>
            </h1>
            <p className="text-slate-300 text-lg max-w-xl mx-auto leading-relaxed">
              Secure. Scalable. Seamless API Solutions.
            </p>
          </div>

          <div className="flex gap-4 justify-center text-xs font-semibold tracking-widest text-slate-400 uppercase pt-8">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-400" />
              <span>Enterprise Grade</span>
            </div>
            <div className="w-px h-4 bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-blue-400" />
              <span>Global Reach</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-md animate-page">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Enter your credentials to access the console.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Input Fields */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/20"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/20"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white font-bold rounded-xl shadow-xl shadow-indigo-200 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:to-blue-700"
            >
              {loading ? 'Authenticating...' : (
                <>
                  <span>Access Dashboard</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-8">
            &copy; 2026 Bankify Corp. Secure System.
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Partner Integration Portal?{' '}
              <button
                type="button"
                onClick={() => navigate('/partner/login')}
                className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Access Partner Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
