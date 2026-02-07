import React from 'react';

export default function AdminOverview() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-slate-500 text-sm font-medium uppercase">Total Customers</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">--</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-slate-500 text-sm font-medium uppercase">Active Accounts</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">--</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-slate-500 text-sm font-medium uppercase">API Clients</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">--</p>
                </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-blue-900 font-bold mb-2">Welcome to Bankify Admin</h3>
                <p className="text-blue-800">Use the sidebar to manage Clients, Customers, and Accounts.</p>
            </div>
        </div>
    );
}
