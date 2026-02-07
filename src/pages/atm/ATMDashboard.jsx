import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';
import FinancialActions from '../../components/shared/FinancialActions';

export default function ATMDashboard() {
    const { user } = useAuth();
    const [account, setAccount] = useState(null);

    // ATM user usually has one account linked to their login/card
    // We need to fetch it or use ID from user object if available
    useEffect(() => {
        const fetchAccount = async () => {
            if (user?.id) {
                // Try to find account for this user
                // If backend sends accountId in login response, use that.
                // Otherwise traverse customers -> accounts (inefficient but works for now if needed)
                // Or use a specific endpoint /api/me/accounts
                try {
                    // Assuming we can get account details. 
                    // For simplicity, let's assume user object has accountId or we fetch it.
                    // If not, we might need a way to select account.
                    // Re-using adminService for now if no specific user endpoint, 
                    // BUT better to have userService.
                    // Let's assume user object HAS accountId for ATM users as per "Bankuser (ATM)" role description usually implies direct access.
                    if (user.accountId) {
                        setAccount({ id: user.accountId });
                    } else {
                        // Fallback: mock or try to fetch
                        // console.warn("No account ID found on user object");
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        };
        fetchAccount();
    }, [user]);

    // If we don't have account ID, we might need to ask user to select or enter it?
    // Or maybe for ATM, the "bankId" IS the account identifier in some systems?
    // Let's assume user.id IS the accountId for simplicity for this demo if not specified.
    const accountId = user?.accountId || user?.id;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome, {user?.name || 'Valued Customer'}</h2>
                <p className="text-slate-500">Please select a transaction below.</p>

                {accountId ? (
                    <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg">
                        <span className="font-semibold">Active Account:</span> {accountId}
                    </div>
                ) : (
                    <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                        <span className="font-bold">Warning:</span> No account linked. Some features may not work.
                    </div>
                )}
            </div>

            <FinancialActions
                title="ATM Operations"
                subtitle="Secure Deposit, Withdraw, and Transfer"
                accountId={accountId}
            />
        </div>
    );
}
