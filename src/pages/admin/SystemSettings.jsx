import React, { useState } from 'react';
import { Settings, Save, Globe, Lock, Shield, CreditCard, Bell, RefreshCw, CheckCircle } from 'lucide-react';

export default function SystemSettings() {
    const [saved, setSaved] = useState(false);

    // Mock Settings State
    const [settings, setSettings] = useState({
        systemName: "Bankify Core",
        maintenanceMode: false,
        supportEmail: "support@bankify.inc",
        defaultCurrency: "USD",
        maxTransactionLimit: "50000",
        kycLevel: "Level 2 (Strict)",
        otpEnabled: true,
        sessionTimeout: "15"
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
                    <p className="text-primary-300 mt-1">Configure global application parameters.</p>
                </div>
                {saved && (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 animate-fade-in">
                        <CheckCircle size={18} />
                        <span className="font-bold text-sm">Settings Saved</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* General Settings */}
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Globe size={20} className="text-cyan-400" />
                        General Configuration
                    </h3>

                    <div className="space-y-5 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-primary-200 tracking-wider">System Name</label>
                                <input
                                    name="systemName"
                                    value={settings.systemName}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all placeholder:text-primary-500/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-primary-200 tracking-wider">Support Email</label>
                                <input
                                    name="supportEmail"
                                    value={settings.supportEmail}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all placeholder:text-primary-500/50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                            <div>
                                <h4 className="text-white font-bold text-sm">Maintenance Mode</h4>
                                <p className="text-xs text-primary-300 mt-0.5">Suspend all user access immediately.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-primary-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Financial & Security */}
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-emerald-400" />
                        Security & Limits
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-primary-200 tracking-wider">Default Currency</label>
                            <select
                                name="defaultCurrency"
                                value={settings.defaultCurrency}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                            >
                                <option>USD</option>
                                <option>EUR</option>
                                <option>GBP</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-primary-200 tracking-wider">Max Transaction Limit</label>
                            <input
                                name="maxTransactionLimit"
                                value={settings.maxTransactionLimit}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-primary-200 tracking-wider">Session Timeout (Minutes)</label>
                            <input
                                type="number"
                                name="sessionTimeout"
                                value={settings.sessionTimeout}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-primary-200 tracking-wider">KYC Requirement</label>
                            <select
                                name="kycLevel"
                                value={settings.kycLevel}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                            >
                                <option>Level 1 (Basic)</option>
                                <option>Level 2 (Strict)</option>
                                <option>Level 3 (Corporate)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-lg"
                    >
                        <Save size={20} />
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
