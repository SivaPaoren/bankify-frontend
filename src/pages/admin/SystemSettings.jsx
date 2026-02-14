import React, { useState, useEffect } from 'react';
import { adminService } from '../../api';
import {
    Save,
    Settings,
    Globe,
    DollarSign,
    Shield,
    AlertCircle,
    Check
} from 'lucide-react';

export default function SystemSettings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await adminService.getSystemSettings();
                setSettings(data);
            } catch (err) {
                console.error("Failed to load settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (section, key, value) => {
        setSettings(prev => {
            if (section) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [key]: value
                    }
                };
            }
            return {
                ...prev,
                [key]: value
            };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminService.updateSystemSettings(settings);
            setSaveMessage('Settings saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (err) {
            setSaveMessage('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
                    <p className="text-slate-500">Configure global application parameters.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition shadow-sm hover:shadow-md"
                >
                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {saveMessage && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${saveMessage.includes('Failed') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {saveMessage.includes('Failed') ? <AlertCircle size={20} /> : <Check size={20} />}
                    {saveMessage}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                            <Settings size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">General Information</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank Name</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition"
                                value={settings.bankName}
                                onChange={(e) => handleChange(null, 'bankName', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Support Email</label>
                            <input
                                type="email"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition"
                                value={settings.supportEmail}
                                onChange={(e) => handleChange(null, 'supportEmail', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                                <span className="block font-medium text-slate-900">Maintenance Mode</span>
                                <span className="text-xs text-slate-500">Disable customer access temporarily.</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => handleChange(null, 'maintenanceMode', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Currency Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Globe size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Currency Support</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(settings.supportedCurrencies).map(currency => (
                                <div key={currency} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-700 shadow-sm border border-slate-100">
                                            {currency}
                                        </div>
                                        <span className="font-medium text-slate-700">{currency}</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.supportedCurrencies[currency]}
                                            onChange={(e) => handleChange('supportedCurrencies', currency, e.target.checked)}
                                        />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Default Currency</label>
                            <select
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition"
                                value={settings.defaultCurrency}
                                onChange={(e) => handleChange(null, 'defaultCurrency', e.target.value)}
                            >
                                {Object.keys(settings.supportedCurrencies)
                                    .filter(c => settings.supportedCurrencies[c])
                                    .map(c => <option key={c} value={c}>{c}</option>
                                    )}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Transaction Limits */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                            <Shield size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Security & Limits</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Daily Transfer Limit</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <DollarSign size={16} />
                                </span>
                                <input
                                    type="number"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition font-mono"
                                    value={settings.transactionLimits.dailyTransferLimit}
                                    onChange={(e) => handleChange('transactionLimits', 'dailyTransferLimit', Number(e.target.value))}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Maximum total transfer amount per 24 hours.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Daily Withdrawal Limit</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <DollarSign size={16} />
                                </span>
                                <input
                                    type="number"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition font-mono"
                                    value={settings.transactionLimits.dailyWithdrawLimit}
                                    onChange={(e) => handleChange('transactionLimits', 'dailyWithdrawLimit', Number(e.target.value))}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Maximum withdrawal amount per 24 hours.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
