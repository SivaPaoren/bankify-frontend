import React from 'react';
import { useAuth } from '../../context/AuthContext';
import FinancialActions from '../../components/shared/FinancialActions';

export default function ClientDashboard() {
    const { user } = useAuth();

    // Clients (Business) also have an accountId usually.
    const accountId = user?.accountId || user?.id;

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Client Portal</h1>
                <p className="text-slate-500">Manage your business finances and API keys.</p>
            </header>

            {/* Quick Stats or Info can go here */}

            <FinancialActions
                title="Business Operations"
                subtitle="Manage deposits, withdrawals, and transfers."
                accountId={accountId}
            />
        </div>
    );
}
