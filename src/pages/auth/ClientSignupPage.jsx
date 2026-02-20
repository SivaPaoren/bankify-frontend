import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/BankifyLogo.png";
import { User, Lock, ArrowRight, ShieldCheck, Globe, Code } from "lucide-react";

export default function ClientSignupPage() {
    const navigate = useNavigate();
    const { partnerSignup, isAuthenticated, role } = useAuth();

    const [appName, setAppName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // If already authenticated securely redirect
    useEffect(() => {
        if (isAuthenticated && role) {
            if (role === "ADMIN") navigate("/admin");
            else if (role === "CLIENT") navigate("/client");
        }
    }, [isAuthenticated, role, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await partnerSignup(appName, email, password);

            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.message || "Registration failed. Please check your inputs.");
                setLoading(false);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again later.");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful</h2>
                    <p className="text-slate-500 mb-8">
                        Your partner account has been created. Please log in using your new credentials.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-4 text-white font-bold rounded-xl shadow-xl shadow-indigo-200 bg-linear-to-r from-indigo-600 to-blue-600 hover:to-blue-700 transition-all"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans overflow-hidden">
            {/* Left Side: Developers/API Visuals */}
            <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-12 bg-slate-950">
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 text-center space-y-8 animate-page">
                    <div className="w-24 h-24 mx-auto bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                        <Code size={40} className="text-indigo-400" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">
                            Build with Bankify
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                            Integrate enterprise-grade banking infrastructure into your product in minutes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
                <div className="w-full max-w-md animate-page">
                    <div className="mb-10 text-center lg:text-left">
                        <img src={logo} alt="Bankify" className="h-10 mb-8 mx-auto lg:mx-0" />
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Become a Partner</h2>
                        <p className="text-slate-500 mt-2">Create your developer account to access API keys.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Application Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Globe className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/20"
                                        placeholder="My FinTech App"
                                        value={appName}
                                        onChange={(e) => setAppName(e.target.value)}
                                    />
                                </div>
                            </div>

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
                                        placeholder="developer@company.com"
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
                                        minLength={8}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/20"
                                        placeholder="Min. 8 characters"
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
                            {loading ? 'Creating Account...' : (
                                <>
                                    <span>Complete Signup</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                            Already a partner?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
