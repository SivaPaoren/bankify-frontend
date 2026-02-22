import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/BankifyLogo.png";
import { User, Lock, ArrowRight, Activity, Zap } from "lucide-react";

export default function PartnerLoginPage() {
    const navigate = useNavigate();
    const { partnerLogin, isAuthenticated, role } = useAuth();

    const [email, setEmail] = useState("partner@app.com");
    const [password, setPassword] = useState("partner123");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Monitor Auth State for Safe Redirect
    useEffect(() => {
        if (isAuthenticated && role) {
            if (role === "CLIENT") {
                navigate("/client");
            }
        }
    }, [isAuthenticated, role, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await partnerLogin(email, password);

            if (!result.success) {
                setError(result.message || "Invalid Partner credentials");
                setLoading(false);
            }
        } catch (err) {
            setError("Login failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-orange-50 font-sans overflow-hidden">
            {/* Left Side: Branding & Visuals (Partner Theme - Orange) */}
            <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-12 bg-linear-to-br from-orange-950 via-orange-900 to-red-950">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    {/* Decorative circles */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 text-center space-y-8 animate-page">
                    <div className="w-32 h-32 mx-auto bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                        <img src={logo} alt="Bankify Partner Portal" className="w-20 h-20 object-contain invert brightness-0 filter drop-shadow-xl" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
                            Empower Your <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-300 to-red-300">
                                Integration
                            </span>
                        </h1>
                        <p className="text-orange-200 text-lg max-w-xl mx-auto leading-relaxed">
                            Connect your applications. Move money instantly.
                        </p>
                    </div>

                    <div className="flex gap-4 justify-center text-xs font-semibold tracking-widest text-orange-400/80 uppercase pt-8">
                        <div className="flex items-center gap-2">
                            <Activity size={16} className="text-orange-400" />
                            <span>Real-Time Events</span>
                        </div>
                        <div className="w-px h-4 bg-orange-700"></div>
                        <div className="flex items-center gap-2">
                            <Zap size={16} className="text-red-400" />
                            <span>Low Latency</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Card */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
                <div className="w-full max-w-md animate-page">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Partner Portal</h2>
                        <p className="text-slate-500 mt-2">Sign in to manage your API keys and webhooks.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Input Fields */}
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Developer Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 focus:border-orange-500 focus:ring-orange-500/20"
                                        placeholder="dev@partnerapp.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 focus:border-orange-500 focus:ring-orange-500/20"
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
                            className="w-full py-4 text-white font-bold rounded-xl shadow-xl shadow-orange-200 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-red-500 hover:to-red-600"
                        >
                            {loading ? 'Authenticating...' : (
                                <>
                                    <span>Log In to Portal</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 text-sm mt-8">
                        &copy; 2026 Bankify Developer Network.
                    </p>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center flex flex-col gap-2">
                        <p className="text-sm text-slate-500">
                            New to the platform?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/partner/signup')}
                                className="font-bold text-orange-600 hover:text-orange-500 transition-colors"
                            >
                                Sign Up as a Partner
                            </button>
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/login')}
                                className="hover:text-slate-600 transition-colors underline"
                            >
                                Return to Admin Login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
