import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, CreditCard } from 'lucide-react';

export default function ATMLogin() {
    const [bankId, setBankId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { atmLogin, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!bankId || !password) {
            setError('Please enter Bank ID and PIN/Password');
            return;
        }

        const result = await atmLogin(bankId, password);

        if (result.success) {
            navigate('/atm');
        } else {
            setError(result.message || 'ATM Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-primary-600 p-6 text-center">
                    <h1 className="text-2xl font-bold text-white tracking-wide">ATM ACCESS</h1>
                    <p className="text-primary-100 text-sm mt-1">Insert Card or Enter Details</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Bank ID / Account No.</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CreditCard className="h-6 w-6 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={bankId}
                                    onChange={(e) => setBankId(e.target.value)}
                                    className="block w-full pl-12 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 text-lg font-mono transition-colors"
                                    placeholder="0000-0000"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">PIN / Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-6 w-6 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 text-lg font-mono transition-colors"
                                    placeholder="••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 uppercase tracking-widest text-lg"
                        >
                            {loading ? 'Authenticating...' : 'Enter'}
                        </button>
                    </form>
                </div>
                <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
                    <a href="/login" className="text-slate-500 hover:text-primary-600 text-sm font-medium">
                        &larr; Back to Standard Login
                    </a>
                </div>
            </div>
        </div>
    );
}
