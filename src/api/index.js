import axios from 'axios';

// ----------------------------------------------------------------------
// API CONFIGURATION
// ----------------------------------------------------------------------

// Base URL for the entire application
// Base URL for the entire application
export const API = "";
const API_PREFIX = "/api/v1";

const BASE_URL = `${API}${API_PREFIX}`;

// Common Headers
const commonHeaders = {
    'Content-Type': 'application/json',
};

// ----------------------------------------------------------------------
// AXIOS INSTANCES
// ----------------------------------------------------------------------

// 1. Admin API (Staff) - Uses Bearer <ADMIN_JWT>
export const adminApi = axios.create({ baseURL: BASE_URL, headers: commonHeaders });

adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('bankify_admin_token');
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. ATM API (Customer) - Uses Bearer <ATM_JWT>
export const atmApi = axios.create({ baseURL: BASE_URL, headers: commonHeaders });

atmApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('bankify_atm_token');
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Partner Portal API - Uses Bearer <PORTAL_JWT>
export const partnerApi = axios.create({ baseURL: BASE_URL, headers: commonHeaders });

partnerApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('bankify_partner_token');
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Generic Response Interceptor (Applied to all)
const handleResponseError = (error, type) => {
    if (error.response && error.response.status === 401) {
        if (type === 'ADMIN') localStorage.removeItem('bankify_admin_token');
        if (type === 'PARTNER') localStorage.removeItem('bankify_partner_token');
        if (type === 'ATM') {
            localStorage.removeItem('bankify_atm_token');
            // Auto-redirect to ATM login on token expiry (3-minute backend limit)
            // Skip redirect for /atm/change-pin so it can attempt a silent re-auth
            const isLogin = window.location.pathname.includes('/atm-login');
            const isChangePin = window.location.pathname.includes('/atm/change-pin');
            if (!isLogin && !isChangePin) {
                window.location.href = '/atm-login?expired=1';
            }
        }
    }
    return Promise.reject(error);
};

adminApi.interceptors.response.use(r => r, e => handleResponseError(e, 'ADMIN'));
atmApi.interceptors.response.use(r => r, e => handleResponseError(e, 'ATM'));
partnerApi.interceptors.response.use(r => r, e => handleResponseError(e, 'PARTNER'));

// ----------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------

// Helper to generate UUID for idempotency
export const generateIdempotencyKey = (prefix = 'TX') => {
    const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    return `${prefix}-${uuid}`;
};

// ----------------------------------------------------------------------
// AUTH SERVICE
// ----------------------------------------------------------------------

export const authService = {
    // 1.1 Admin Auth
    login: async (email, password) => {
        // baseURL includes /api/v1, so we just need /admin/auth/login
        const response = await adminApi.post('/admin/auth/login', { email, password });
        const { token, role, ...userData } = response.data;

        // Store Admin Token
        localStorage.setItem('bankify_admin_token', token);
        localStorage.setItem('bankify_user', JSON.stringify({ ...userData, role }));

        return response.data;
    },

    // 2. ATM Auth
    atmLogin: async (accountNumber, pin) => {
        const response = await atmApi.post('/atm/auth/login', { accountNumber, pin });
        const { token } = response.data;
        localStorage.setItem('bankify_atm_token', token);
        return response.data;
    },

    // 3. Partner Auth (Portal)
    partnerLogin: async (email, password) => {
        const response = await partnerApi.post('/partner/auth/login', { email, password });
        const { token } = response.data;
        localStorage.setItem('bankify_partner_token', token);
        return response.data;
    },

    // Partner Signup
    partnerSignup: async (appName, email, password) => {
        const response = await partnerApi.post('/partner/auth/signup', { appName, email, password });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('bankify_admin_token');
        localStorage.removeItem('bankify_atm_token');
        localStorage.removeItem('bankify_partner_token');
        localStorage.removeItem('bankify_user');
        window.location.href = '/login';
    }
};

// Mock data helpers removed to enforce true backend sync
export const adminService = {
    // 1.2 View all API clients
    getClients: async () => {
        const response = await adminApi.get('/admin/partner-apps');
        return response.data;
    },
    // 1.3 Approve a client
    approveClient: async (clientId) => {
        const response = await adminApi.patch(`/admin/partner-apps/${clientId}/approve`);
        return response.data;
    },
    // 1.3.1 Activate a client
    activateClient: async (clientId) => {
        const response = await adminApi.patch(`/admin/partner-apps/${clientId}/activate`);
        return response.data;
    },
    // 1.4 Disable a client
    disableClient: async (clientId) => {
        const response = await adminApi.patch(`/admin/partner-apps/${clientId}/disable`);
        return response.data;
    },
    // 1.5 Key Rotation Approvals
    listRotationRequests: async () => {
        const response = await adminApi.get('/admin/partner-apps/rotation-requests');
        return response.data;
    },
    approveKeyRotation: async (requestId) => {
        const response = await adminApi.patch(`/admin/partner-apps/rotation-requests/${requestId}/approve`);
        return response.data;
    },
    rejectKeyRotation: async (requestId) => {
        const response = await adminApi.patch(`/admin/partner-apps/rotation-requests/${requestId}/reject`);
        return response.data;
    },

    // Customers (Admin manages these)
    getCustomers: async () => {
        const response = await adminApi.get('/admin/customers');
        return response.data;
    },
    getCustomer: async (customerId) => {
        const response = await adminApi.get(`/admin/customers/${customerId}`);
        return response.data;
    },
    createCustomer: async (customerData) => {
        const response = await adminApi.post('/admin/customers', customerData);
        return response.data;
    },
    updateCustomer: async (customerId, updateData) => {
        const response = await adminApi.patch(`/admin/customers/${customerId}`, updateData);
        return response.data;
    },
    // Freeze (disable) a customer
    freezeCustomer: async (customerId) => {
        const response = await adminApi.patch(`/admin/customers/${customerId}/disable`);
        return response.data;
    },
    // Re-activate a previously frozen customer
    reactivateCustomer: async (customerId) => {
        const response = await adminApi.patch(`/admin/customers/${customerId}/reactivate`);
        return response.data;
    },
    // Permanently close a customer and all their accounts
    closeCustomer: async (customerId) => {
        const response = await adminApi.patch(`/admin/customers/${customerId}/close`);
        return response.data;
    },
    getAccounts: async (params = {}) => {
        const response = await adminApi.get('/admin/accounts', { params });
        return response.data;
    },
    createAccount: async (accountData) => {
        // Spec: { customerId, type, currency }
        // Note: Initial deposit is NOT part of this endpoint.
        const response = await adminApi.post('/admin/accounts', accountData);
        return response.data;
    },
    getAccount: async (accountId) => {
        const response = await adminApi.get(`/admin/accounts/${accountId}`);
        return response.data;
    },
    getAccountLedger: async (accountId) => {
        const response = await adminApi.get(`/admin/accounts/${accountId}/ledger`);
        return response.data;
    },
    freezeAccount: async (accountId) => {
        await adminApi.patch(`/admin/accounts/${accountId}/disable`);
    },
    // Close Account — uses PATCH with status=CLOSED (no DELETE endpoint in backend)
    closeAccount: async (accountId) => {
        const response = await adminApi.patch(`/admin/accounts/${accountId}`, { status: 'CLOSED' });
        return response.data;
    },
    updateAccountStatus: async (accountId, status) => {
        const response = await adminApi.patch(`/admin/accounts/${accountId}`, { status });
        return response.data;
    },
    getAccountTransactions: async (accountId) => {
        const response = await adminApi.get('/admin/transactions', { params: { accountId } });
        return response.data;
    },
    // List ALL transactions (admin view)
    getTransactions: async (params = {}) => {
        const response = await adminApi.get('/admin/transactions', { params });
        return response.data;
    },
    // Single transaction
    getTransaction: async (transactionId) => {
        const response = await adminApi.get(`/admin/transactions/${transactionId}`);
        return response.data;
    },
    // Global Ledger — every transfer creates DEBIT + CREDIT entries
    // Filter by reference: getLedger({ reference: 'unique-id-123' })
    getLedger: async (params = {}) => {
        const response = await adminApi.get('/admin/transactions/ledger', { params });
        return response.data;
    },

    // 1.4 Admin Operations
    resetAtmPin: async (accountId, newPin) => {
        await adminApi.patch(`/admin/accounts/${accountId}/pin`, { pin: newPin });
    },

    // 4. Admin Transactions (Internal/Optional but recommended)
    deposit: async (accountId, amount, note = "Admin Deposit") => {
        const idempotencyKey = generateIdempotencyKey('DEP');
        const response = await adminApi.post('/admin/transactions/deposit', { accountId, amount, note }, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
        return response.data;
    },
    withdraw: async (accountId, amount, note = "Admin Withdraw") => {
        const idempotencyKey = generateIdempotencyKey('WDR');
        const response = await adminApi.post('/admin/transactions/withdraw', { accountId, amount, note }, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
        return response.data;
    },
    transfer: async (fromAccountId, toAccountId, amount, note = "Admin Transfer") => {
        const idempotencyKey = generateIdempotencyKey('TRF');
        const response = await adminApi.post('/admin/transactions/transfer', { fromAccountId, toAccountId, amount, note }, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
        return response.data;
    },

    // Customer status actions
    /** Temporarily freeze customer + cascade freeze their ACTIVE accounts */
    freezeCustomer: async (customerId) => {
        const response = await adminApi.patch(`/admin/customers/${customerId}/disable`);
        return response.data;
    },
    /** Re-activate a FROZEN customer + cascade restore their FROZEN accounts */
    reactivateCustomer: async (customerId) => {
        const response = await adminApi.patch(`/admin/customers/${customerId}/reactivate`);
        return response.data;
    },
    /** Permanently close customer + close ALL their accounts */
    closeCustomer: async (customerId) => {
        const response = await adminApi.patch(`/admin/customers/${customerId}/close`);
        return response.data;
    },
    /** @deprecated use freezeCustomer instead */
    deleteCustomer: async (customerId) => {
        const response = await adminApi.patch(`/admin/customers/${customerId}/disable`);
        return response.data;
    },

    // Audit Logs
    getAuditLogs: async (params = {}) => {
        const response = await adminApi.get('/admin/audit-logs', { params });
        return response.data;
    },
    // Transactions (Admin View)
    getTransactions: async (params = {}) => {
        const response = await adminApi.get('/admin/transactions', { params });
        return response.data;
    },
    // Global Ledger (Admin View)
    getGlobalLedger: async (params = {}) => {
        const response = await adminApi.get('/admin/transactions/ledger', { params });
        return response.data;
    },

};

export const clientService = {
    // Get current client profile (keys, webhooks)
    getProfile: async () => {
        // Guide: GET /api/v1/partner/portal/me
        const response = await partnerApi.get('/partner/portal/me');
        return response.data;
    },
    // Update webhook URL
    updateWebhook: async () => {
        // Guide doesn't specify, assuming similar endpoint
        return { success: true };
    }
};

export const atmService = {
    // 2.1 Balance
    getBalance: async () => {
        const response = await atmApi.get('/atm/me/balance');
        return response.data;
    },

    // 2.2 Deposit
    deposit: async (amount, note) => {
        const idempotencyKey = generateIdempotencyKey('DEP');
        const response = await atmApi.post('/atm/me/deposit', {
            amount: Number(amount),
            note
        }, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
        return response.data;
    },

    // 2.3 Withdraw
    withdraw: async (amount, note) => {
        const idempotencyKey = generateIdempotencyKey('WDR');
        const response = await atmApi.post('/atm/me/withdraw', {
            amount: Number(amount),
            note
        }, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
        return response.data;
    },

    // 2.4 Transfer
    transfer: async (accountNumber, amount, note) => {
    const idempotencyKey = generateIdempotencyKey('TRF');
    const response = await atmApi.post('/atm/me/transfer', {
        toAccountNumber: accountNumber, 
        amount: Number(amount),
        note
    }, {
        headers: { 'Idempotency-Key': idempotencyKey }
    });
    return response.data;
},

    // 2.5 Transaction history (ATM View)
    getTransactions: async () => {
        const response = await atmApi.get('/atm/me/transactions');
        return response.data;
    },

    // 2.6 Change PIN — backend expects { oldPin, newPin }
    changePin: async ({ oldPin, newPin }) => {
        const response = await atmApi.post('/atm/me/change-pin', { oldPin, newPin });
        return response.data;
    },

    // Legacy support for older components using getTransactionsByAccount(id)
    getTransactionsByAccount: async () => {
        return atmService.getTransactions();
    },
};

export const partnerService = {
    // Partner Balance
    getBalance: async () => {
        const response = await partnerApi.get('/partner/me/balance');
        return response.data;
    },

    // Partner Portal Info
    getPartnerInfo: async () => {
        const response = await partnerApi.get('/partner/portal/me');
        return response.data;
    },

    // Partner Money Ops
    deposit: async (amount, note) => {
        const idempotencyKey = generateIdempotencyKey('DEP');
        // Guide: POST /api/v1/partner/me/deposit
        const response = await partnerApi.post('/partner/me/deposit', {
            amount: Number(amount),
            note
        }, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
        return response.data;
    },

    withdraw: async (amount, note) => {
        const idempotencyKey = generateIdempotencyKey('WDR');
        const response = await partnerApi.post('/partner/me/withdraw', {
            amount: Number(amount),
            note
        }, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
        return response.data;
    },

    transfer: async (toAccountNumber, amount, note) => {
        const idempotencyKey = generateIdempotencyKey('TRF');
        const response = await partnerApi.post('/partner/me/transfer', {
            amount: Number(amount),
            note
        }, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
        return response.data;
    },

    getTransactions: async () => {
        const response = await partnerApi.get('/partner/me/transactions');
        return response.data;
    },

    getTransactionsByAccount: async () => {
        return partnerService.getTransactions();
    },

    // Request API key rotation (partner submits reason, admin reviews and approves)
    requestRotation: async (reason = '') => {
        const response = await partnerApi.post('/partner/portal/keys/rotate-request', { reason });
        return response.data;
    },

    // View own rotation request history
    getRotationHistory: async () => {
        const response = await partnerApi.get('/partner/portal/keys/rotation-requests');
        return response.data;
    },

};

// Re-export atmService as transactionService for backward compatibility where possible,
// but components should migrate.
export const transactionService = atmService;

export default adminApi; // Default export adminApi to minimize breakage if someone imports 'api' default

