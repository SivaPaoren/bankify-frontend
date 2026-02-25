import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { atmService } from '../../api';
import bankifyLogo from '../../assets/BankifyWhiteLogo.png';
import { Lock, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function ATMChangePin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ currentPin: '', newPin: '', confirmPin: '' });
    const [showPins, setShowPins] = useState({ current: false, new: false, confirm: false });
    const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPin !== form.confirmPin) {
            setStatus('error');
            setErrorMsg('New PINs do not match.');
            return;
        }
        if (form.newPin.length < 4) {
            setStatus('error');
            setErrorMsg('New PIN must be at least 4 digits.');
            return;
        }
        setStatus('loading');
        setErrorMsg('');
        try {
            await atmService.changePin({
                currentPin: form.currentPin,
                newPin: form.newPin,
            });
            setStatus('success');
        } catch (err) {
            setStatus('error');
            setErrorMsg(err.response?.data?.message || 'PIN change failed. Check your current PIN and try again.');
        }
    };

    const toggle = (field) => setShowPins((s) => ({ ...s, [field]: !s[field] }));

    return (
        <div className="min-h-screen w-full bg-slate-200 flex flex-col items-center justify-center p-4">
            {/* ATM HEADER */}
            <div className="bg-slate-800 w-full max-w-lg rounded-t-2xl p-4 shadow-2xl border-b-8 border-slate-900 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img src={bankifyLogo} alt="Bankify" className="w-8 h-8" />
                    <h1 className="text-2xl text-white font-bold">Bankify</h1>
                </div>
            </div>

            {/* ATM BODY */}
            <div className="bg-gradient-to-b from-gray-300 to-gray-400 w-full max-w-lg p-8 rounded-b-2xl shadow-2xl border-x-8 border-b-8 border-gray-500">
                <div className="bg-slate-900 rounded-xl border-4 border-black p-8 shadow-inner">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center gap-5 py-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                <CheckCircle size={36} className="text-green-400" />
                            </div>
                            <p className="text-white font-bold text-lg text-center">PIN Changed Successfully</p>
                            <p className="text-cyan-400/70 text-sm text-center font-mono">Your new PIN is active.</p>
                            <button
                                onClick={() => navigate('/atm')}
                                className="mt-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all w-full"
                            >
                                Back to Main Menu
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                                    <Lock size={22} className="text-cyan-400" />
                                </div>
                                <h2 className="text-white text-xl font-bold tracking-wider">CHANGE PIN</h2>
                                <p className="text-cyan-400/60 text-xs font-mono mt-1">Enter your current PIN and choose a new one</p>
                            </div>

                            {[
                                { label: 'CURRENT PIN', name: 'currentPin', field: 'current' },
                                { label: 'NEW PIN', name: 'newPin', field: 'new' },
                                { label: 'CONFIRM NEW PIN', name: 'confirmPin', field: 'confirm' },
                            ].map(({ label, name, field }) => (
                                <div key={name} className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-cyan-400/70 tracking-widest">{label}</label>
                                    <div className="flex items-center bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 focus-within:border-cyan-500 transition-colors">
                                        <input
                                            type={showPins[field] ? 'text' : 'password'}
                                            name={name}
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={8}
                                            value={form[name]}
                                            onChange={handleChange}
                                            required
                                            className="flex-1 bg-transparent text-white font-mono text-xl tracking-widest outline-none placeholder:text-slate-600"
                                            placeholder="••••"
                                        />
                                        <button type="button" onClick={() => toggle(field)} className="text-slate-500 hover:text-cyan-400 transition-colors p-1">
                                            {showPins[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {status === 'error' && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <AlertTriangle size={15} className="text-red-400 shrink-0" />
                                    <p className="text-red-300 text-sm">{errorMsg}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => navigate('/atm')}
                                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all disabled:opacity-60"
                                >
                                    {status === 'loading' ? 'Changing…' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
