import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/BankifyLogo.png";
import { User, Lock, ArrowRight, Shield, Terminal, Settings } from "lucide-react";

export default function PartnerSignupPage() {
    const navigate = useNavigate();
    const { partnerSignup } = useAuth();

    const [appName, setAppName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await partnerSignup(appName, email, password);

            if (!result.success) {
                setError(result.message || "Failed to register Partner Account.");
            } else {
                setSuccess(true);
                // Automatically route them to the login page after a brief delay
                setTimeout(() => navigate('/partner/login'), 2000);
            }
        } catch (err) {
            setError("Registration encountered a fatal error. Please try again.");
        } finally {
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
                        <img src={logo} alt="Bankify Partner API" className="w-20 h-20 object-contain invert brightness-0 filter drop-shadow-xl" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
                            Build Next-Gen <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-300 to-red-300">
                                Financial Apps
                            </span>
                        </h1>
                        <p className="text-orange-200 text-lg max-w-xl mx-auto leading-relaxed">
                            Register your platform and get instant access to the Bankify robust API sandbox.
                        </p>
                    </div>

                    <div className="flex justify-center gap-6 text-sm font-semibold tracking-wide text-orange-300 pt-8">
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-orange-800/50 p-3 rounded-full"><Terminal size={20} /></div>
                            <span>API Gateway</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-orange-800/50 p-3 rounded-full"><Shield size={20} /></div>
                            <span>Secured Auth</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-orange-800/50 p-3 rounded-full"><Settings size={20} /></div>
                            <span>Live Webhooks</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Registration Card */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
                <div className="w-full max-w-md animate-page">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create an Account</h2>
                        <p className="text-slate-500 mt-2">Join the Bankify Partner Network today.</p>
                    </div>

                    {success ? (
                        <div className="p-8 bg-green-50 rounded-2xl border border-green-200 text-center animate-page">
                            <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-green-800 mb-2">Registration Complete!</h3>
                            <p className="text-green-600 mb-4">You have successfully generated your developer credentials. Redirecting to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-5">

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Application Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Terminal className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 focus:border-orange-500 focus:ring-orange-500/20"
                                            placeholder="My FinTech App"
                                            value={appName}
                                            onChange={(e) => setAppName(e.target.value)}
                                        />
                                    </div>
                                </div>

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
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Secure Password</label>
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
                                {loading ? 'Registering...' : (
                                    <>
                                        <span>Create Application</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                            Already have an integration?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/partner/login')}
                                className="font-bold text-orange-600 hover:text-orange-500 transition-colors"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
