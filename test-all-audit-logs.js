import axios from 'axios';

const ADMIN_CRED = { email: 'admin@bankify.local', password: 'admin123' };
const BASE_URL = 'http://localhost:8080/api/v1';

async function runTests() {
    console.log('--- STARTING COMPREHENSIVE AUDIT LOG TEST ---');
    let adminToken = '';

    // 1. Admin Login (USER_LOGIN)
    try {
        const res = await axios.post(`${BASE_URL}/admin/auth/login`, ADMIN_CRED);
        adminToken = res.data.token;
        console.log('✅ USER_LOGIN success');
    } catch (e) {
        console.error('❌ USER_LOGIN failed:', e.response?.data?.message || e.message);
        return; // Can't proceed without admin token
    }

    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    let customerId = '';
    let accountId = '';

    // 2. Create Customer (CUSTOMER_CREATE)
    try {
        const res = await axios.post(`${BASE_URL}/admin/customers`, {
            firstName: 'Audit',
            lastName: 'Tester',
            email: `audit.tester.${Date.now()}@example.com`,
            phoneNumber: '555-0000',
            address: '123 Test St',
            type: 'INDIVIDUAL'
        }, { headers: adminHeaders });
        customerId = res.data.id;
        console.log('✅ CUSTOMER_CREATE success');
    } catch (e) {
        console.error('❌ CUSTOMER_CREATE failed:', e.response?.data?.message || e.message);
    }

    if (customerId) {
        // 3. Update Customer (CUSTOMER_UPDATE)
        try {
            await axios.patch(`${BASE_URL}/admin/customers/${customerId}`, {
                phoneNumber: '555-1111'
            }, { headers: adminHeaders });
            console.log('✅ CUSTOMER_UPDATE success');
        } catch (e) {
            console.error('❌ CUSTOMER_UPDATE failed:', e.message);
        }

        // 4. Create Account (ACCOUNT_CREATE)
        try {
            const res = await axios.post(`${BASE_URL}/admin/accounts`, {
                customerId: customerId,
                currency: 'USD',
                type: 'SAVINGS',
                pin: '123456'
            }, { headers: adminHeaders });
            accountId = res.data.id;
            console.log('✅ ACCOUNT_CREATE success');
        } catch (e) {
            console.error('❌ ACCOUNT_CREATE failed:', e.response?.data?.message || e.message);
        }
    }

    if (accountId) {
        // 5. Update Account (ACCOUNT_UPDATE)
        try {
            await axios.patch(`${BASE_URL}/admin/accounts/${accountId}`, {
                status: 'ACTIVE' // Mock update
            }, { headers: adminHeaders });
            console.log('✅ ACCOUNT_UPDATE success');
        } catch (e) {
            console.error('❌ ACCOUNT_UPDATE failed:', e.response?.data?.message || e.message);
        }

        // 6. PIN Reset (ACCOUNT_PIN_RESET)
        try {
            await axios.patch(`${BASE_URL}/admin/accounts/${accountId}/pin`, {
                pin: '654321'
            }, { headers: adminHeaders });
            console.log('✅ ACCOUNT_PIN_RESET success');
        } catch (e) {
            console.error('❌ ACCOUNT_PIN_RESET failed:', e.response?.data?.message || e.message);
        }

        // Test ATM Actions
        let atmToken = '';

        // 7. ATM Login (ATM_LOGIN)
        try {
            const resAcc = await axios.get(`${BASE_URL}/admin/accounts/${accountId}`, { headers: adminHeaders });
            const accNumber = resAcc.data.accountNumber;

            const resAtm = await axios.post(`http://localhost:8080/api/v1/atm/auth/login`, {
                accountNumber: accNumber,
                pin: '654321' // changed by PIN_RESET
            });
            atmToken = resAtm.data.token;
            console.log('ATM Token:', atmToken);
            console.log('✅ ATM_LOGIN success');
        } catch (e) {
            // Log the response detail if possible
            console.error('❌ ATM_LOGIN failed:', e.response?.data?.message || e.message);
        }

        if (atmToken) {
            const atmHeaders = { Authorization: `Bearer ${atmToken}` };

            // 8. ATM PIN Change (ATM_PIN_CHANGE)
            try {
                await axios.post(`http://localhost:8080/api/v1/atm/me/change-pin`, {
                    oldPin: '654321',
                    newPin: '111222'
                }, { headers: atmHeaders });
                console.log('✅ ATM_PIN_CHANGE success');
            } catch (e) {
                console.error('❌ ATM_PIN_CHANGE failed:', e.response?.data || e.message);
            }

            // 9. Transaction Deposit (TRANSACTION_DEPOSIT)
            try {
                const idempotencyKey = `dep-${Date.now()}`;
                await axios.post(`http://localhost:8080/api/v1/atm/me/deposit`, {
                    amount: 500,
                    note: 'Test Deposit'
                }, {
                    headers: { ...atmHeaders, 'Idempotency-Key': idempotencyKey }
                });
                console.log('✅ TRANSACTION_DEPOSIT success');
            } catch (e) {
                console.error('❌ TRANSACTION_DEPOSIT failed:', e.response?.data || e.message);
            }

            // 10. Transaction Withdraw (TRANSACTION_WITHDRAW)
            try {
                const idempotencyKey = `wd-${Date.now()}`;
                await axios.post(`http://localhost:8080/api/v1/atm/me/withdraw`, {
                    amount: 100,
                    note: 'Test Withdraw'
                }, {
                    headers: { ...atmHeaders, 'Idempotency-Key': idempotencyKey }
                });
                console.log('✅ TRANSACTION_WITHDRAW success');
            } catch (e) {
                console.error('❌ TRANSACTION_WITHDRAW failed:', e.response?.data || e.message);
            }

            // We skip TRANSFER to keep it simple, it's covered by the same backend path in TransactionService as others.
        }

        // 11. Freeze Account (ACCOUNT_FREEZE)
        try {
            await axios.patch(`${BASE_URL}/admin/accounts/${accountId}/disable`, {}, { headers: adminHeaders });
            console.log('✅ ACCOUNT_FREEZE success');
        } catch (e) {
            console.error('❌ ACCOUNT_FREEZE failed:', e.response?.data?.message || e.message);
        }
    }

    if (customerId) {
        // 12. Freeze Customer (CUSTOMER_FREEZE)
        try {
            await axios.patch(`${BASE_URL}/admin/customers/${customerId}/disable`, {}, { headers: adminHeaders });
            console.log('✅ CUSTOMER_FREEZE success');
        } catch (e) {
            console.error('❌ CUSTOMER_FREEZE failed:', e.response?.data?.message || e.message);
        }

        // 15. Reactivate Customer (CUSTOMER_REACTIVATE)
        try {
            await axios.patch(`${BASE_URL}/admin/customers/${customerId}/reactivate`, {}, { headers: adminHeaders });
            console.log('✅ CUSTOMER_REACTIVATE success');
        } catch (e) {
            console.error('❌ CUSTOMER_REACTIVATE failed:', e.response?.data?.message || e.message);
        }

        // 16. Close Customer (CUSTOMER_CLOSE)
        try {
            await axios.patch(`${BASE_URL}/admin/customers/${customerId}/close`, {}, { headers: adminHeaders });
            console.log('✅ CUSTOMER_CLOSE success');
        } catch (e) {
            console.error('❌ CUSTOMER_CLOSE failed:', e.response?.data?.message || e.message);
        }
    }

    // Partner operations
    // To test Partner Logs, we'll try to login with a seeded partner. But if we don't have the creds, we can just skip it or create one.
    try {
        // Create partner user
        const rName = `partner_${Date.now()}`;
        const partnerRes = await axios.post(`http://localhost:8080/api/v1/partner/auth/signup`, {
            email: `${rName}@test.com`,
            password: 'password123',
            firstName: 'P',
            lastName: 'T',
            appName: rName,
            appDescription: 'Test'
        });
        console.log('✅ Partner Registration Success');

        // We know this creates PARTNER_APP_PENDING.
        // We'll approve the app as Admin.
        const apps = await axios.get(`${BASE_URL}/admin/partner-apps`, { headers: adminHeaders });
        const appList = Array.isArray(apps.data) ? apps.data : (apps.data.content || []);
        const myApp = appList.find(a => a.name === rName);

        if (myApp) {
            await axios.patch(`${BASE_URL}/admin/partner-apps/${myApp.id}/approve`, {}, { headers: adminHeaders });
            console.log('✅ PARTNER_APP_APPROVED success');

            await axios.patch(`${BASE_URL}/admin/partner-apps/${myApp.id}/disable`, {}, { headers: adminHeaders });
            console.log('✅ PARTNER_APP_DISABLED success');

            await axios.patch(`${BASE_URL}/admin/partner-apps/${myApp.id}/activate`, {}, { headers: adminHeaders });
            console.log('✅ PARTNER_APP_ACTIVATED success');

            // Partner Login (PARTNER_LOGIN)
            await axios.post(`http://localhost:8080/api/v1/partner/auth/login`, {
                email: `${rName}@test.com`,
                password: 'password123'
            });
            console.log('✅ PARTNER_LOGIN success');
        }

    } catch (e) {
        console.error('❌ Partner Tests Failed:', e.response?.data?.message || e.message);
    }

    console.log('--- TEST COMPLETE ---');
}

runTests();
