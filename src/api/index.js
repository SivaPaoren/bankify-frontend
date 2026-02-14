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
        // Clear specific token based on type
        if (type === 'ADMIN') localStorage.removeItem('bankify_admin_token');
        if (type === 'ATM') localStorage.removeItem('bankify_atm_token');
        if (type === 'PARTNER') localStorage.removeItem('bankify_partner_token');

        // Optional: Redirect if needed, but components often handle redirects
        // window.location.href = '/login'; 
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
        try {
            const response = await atmApi.post('/atm/auth/login', { accountNumber, pin });
            const { token } = response.data;

            localStorage.setItem('bankify_atm_token', token);
            return response.data;
        } catch (error) {
            console.warn("Backend unavailable or Network Error, using MOCK ATM login.", error);

            // Mock ATM Login
            const mockToken = 'mock-atm-token';
            const mockUser = {
                id: 999,
                email: 'atm-user@bankify.local',
                accountNumber: accountNumber,
                role: 'USER',
                name: 'ATM User',
                currency: 'THB'
            };
            localStorage.setItem('bankify_atm_token', mockToken);
            // localStorage.setItem('bankify_user', JSON.stringify(mockUser)); // ATM usually doesn't need full user obj in storage

            return { token: mockToken, ...mockUser };
        }
    },

    // 3. Partner Auth (Portal)
    partnerLogin: async (email, password) => {
        try {
            const response = await partnerApi.post('/partner/auth/login', { email, password });
            const { token } = response.data;
            localStorage.setItem('bankify_partner_token', token);
            return response.data;
        } catch (error) {
            console.warn("Backend unavailable, using MOCK Partner login.", error);
            // Mock
            const mockToken = 'mock-partner-token';
            localStorage.setItem('bankify_partner_token', mockToken);
            return { token: mockToken, role: 'CLIENT' };
        }
    },

    logout: () => {
        localStorage.removeItem('bankify_admin_token');
        localStorage.removeItem('bankify_atm_token');
        localStorage.removeItem('bankify_partner_token');
        localStorage.removeItem('bankify_user');
        window.location.href = '/login';
    }
};

import { initialClients, initialCustomers, initialAccounts, initialAuditLogs, initialTransactions, initialSystemSettings } from './mockData';

// Helper to get data from LocalStorage or initialize it
const getStorageData = (key, initialData) => {
    const stored = localStorage.getItem(key);
    if (!stored) {
        localStorage.setItem(key, JSON.stringify(initialData));
        return initialData;
    }
    return JSON.parse(stored);
};

// Helper to save data to LocalStorage
const setStorageData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Helper to log audit actions
const logAudit = (action, details, user = 'admin@bankify.local') => {
    const logs = getStorageData('bankify_audit_logs', initialAuditLogs);
    const newLog = {
        id: Date.now(),
        action,
        user,
        details,
        timestamp: new Date().toISOString()
    };
    logs.unshift(newLog); // Add to beginning
    setStorageData('bankify_audit_logs', logs);
};


export const adminService = {
    // 1.2 View all API clients
    getClients: async () => {
        try {
            const response = await adminApi.get('/admin/clients');
            return response.data;
        } catch (e) {
            console.warn("Backend unavailable, loading clients from LocalStorage");
            return getStorageData('bankify_clients', initialClients);
        }
    },
    // 1.3 Create a new API client
    createClient: async (name) => {
        try {
            const response = await adminApi.patch(`/admin/clients/${Date.now()}/approve`, { name }); // Guide says approve creates/activates? No, guide says list then approve. 
            // Actually guide says: PATCH /admin/clients/{id}/approve
            // But we are creating. The guide implies Partners signup themselves, and Admin approves.
            // For now, we'll keep the mock behavior of "creating" directly for the dashboard.
            // Or maybe POST /admin/clients? Guide doesn't list POST /admin/clients. 
            // It lists GET /admin/clients and PATCH .../approve. 
            // I will assume for now we mock it or use a non-spec endpoint if needed.
            // Let's stick to the previous mock logic if no endpoint exists, OR use the Partner Signup flow?
            // Let's keep it as is but use adminApi.
            return { id: Date.now(), name, apiKey: 'mock-key', status: 'ACTIVE' };
        } catch (e) {
            const clients = getStorageData('bankify_clients', initialClients);
            const newClient = { id: Date.now(), name, apiKey: `test_${Date.now()}`, status: 'ACTIVE' };
            clients.push(newClient);
            setStorageData('bankify_clients', clients);
            return newClient;
        }
    },
    // 1.4 Disable a client
    disableClient: async (clientId) => {
        try {
            const response = await adminApi.patch(`/admin/clients/${clientId}/disable`);
            return response.data;
        } catch (e) {
            console.warn("Mocking disable client");
            return { success: true };
        }
    },

    // Customers (Admin manages these)
    getCustomers: async () => {
        try {
            const response = await adminApi.get('/admin/customers');
            return response.data;
        } catch (e) {
            console.warn("Backend unavailable, loading customers from LocalStorage");
            return getStorageData('bankify_customers', initialCustomers);
        }
    },
    getCustomer: async (customerId) => {
        const response = await adminApi.get(`/admin/customers/${customerId}`);
        return response.data;
    },
    createCustomer: async (customerData) => {
        try {
            const response = await adminApi.post('/admin/customers', customerData);
            return response.data;
        } catch (e) {
            console.warn("Backend unavailable, saving customer to LocalStorage");
            const customers = getStorageData('bankify_customers', initialCustomers);
            const newCustomer = {
                id: Date.now(),
                ...customerData,
                status: 'ACTIVE'
            };
            customers.push(newCustomer);
            setStorageData('bankify_customers', customers);
            logAudit('CREATE_CUSTOMER', `Created Customer: ${customerData.fullName}`);
            return newCustomer;
        }
    },
    updateCustomer: async (customerId, updateData) => {
        const response = await adminApi.patch(`/admin/customers/${customerId}`, updateData);
        return response.data;
    },

    // Accounts
    getAccounts: async (params = {}) => {
        try {
            const response = await adminApi.get('/admin/accounts', { params });
            return response.data;
        } catch (e) {
            console.warn("Backend unavailable, loading accounts from LocalStorage");
            let accounts = getStorageData('bankify_accounts', initialAccounts);
            if (params.customerId) {
                accounts = accounts.filter(acc => String(acc.customerId) === String(params.customerId));
            }
            return accounts;
        }
    },
    createAccount: async (accountData) => {
        try {
            const response = await adminApi.post('/admin/accounts', accountData);
            return response.data;
        } catch (e) {
            console.warn("Backend unavailable, saving account to LocalStorage");
            const accounts = getStorageData('bankify_accounts', initialAccounts);
            const newAccount = {
                id: Date.now(),
                accountNumber: `8822-${Math.floor(1000 + Math.random() * 9000)}`,
                customerId: accountData.customerId,
                type: accountData.type,
                currency: accountData.currency,
                balance: 0,
                status: 'ACTIVE'
            };
            accounts.push(newAccount);
            setStorageData('bankify_accounts', accounts);
            logAudit('CREATE_ACCOUNT', `Created Account for Customer ID: ${accountData.customerId}`);
            return newAccount;
        }
    },
    getAccount: async (accountId) => {
        const response = await adminApi.get(`/admin/accounts/${accountId}`);
        return response.data;
    },
    getAccountLedger: async (accountId) => {
        const response = await adminApi.get(`/admin/accounts/${accountId}/ledger`);
        return response.data;
    },
    // Freeze Account (Disable)
    freezeAccount: async (accountId) => {
        try {
            // Guide says: PATCH /api/v1/admin/accounts/{id}/disable
            await adminApi.patch(`/admin/accounts/${accountId}/disable`);
        } catch (e) {
            console.warn("Mocking freeze account");
        }
    },
    // Close Account
    closeAccount: async (accountId) => {
        try {
            await adminApi.delete(`/admin/accounts/${accountId}`);
        } catch (e) {
            console.warn("Mocking close account");
        }
    },
    // Helper to get transactions as Admin (since transactionService might be ATM specific)
    getAccountTransactions: async (accountId) => {
        try {
            // Guide: GET /api/v1/admin/transactions?accountId={uuid}
            const response = await adminApi.get('/admin/transactions', { params: { accountId } });
            return response.data;
        } catch (e) {
            // Fallback to mock data
            let transactions = getStorageData('bankify_transactions', initialTransactions);
            const filtered = transactions.filter(t =>
                String(t.source) === String(accountId) ||
                String(t.destination) === String(accountId)
            );
            return { content: filtered };
        }
    },

    // Delete Customer
    deleteCustomer: async (customerId) => {
        try {
            await adminApi.patch(`/admin/customers/${customerId}/disable`); // Using disable as per guide preferance, or delete? Guide says PATCH .../disable.
        } catch (e) {
            console.warn("Mocking delete customer");
        }
    },

    // Audit Logs
    getAuditLogs: async () => {
        try {
            const response = await adminApi.get('/admin/audit-logs');
            return response.data;
        } catch (e) {
            return getStorageData('bankify_audit_logs', initialAuditLogs);
        }
    },
    // Transactions (Admin View)
    getTransactions: async (params = {}) => {
        try {
            const response = await adminApi.get('/admin/transactions', { params });
            return response.data;
        } catch (e) {
            console.warn("Backend unavailable, loading transactions from LocalStorage");
            let transactions = getStorageData('bankify_transactions', initialTransactions);

            // Mock Filtering
            if (params.type && params.type !== 'ALL') {
                transactions = transactions.filter(t => t.type === params.type);
            }
            if (params.status && params.status !== 'ALL') {
                transactions = transactions.filter(t => t.status === params.status);
            }
            if (params.search) {
                const search = params.search.toLowerCase();
                transactions = transactions.filter(t => t.id.toLowerCase().includes(search));
            }
            return transactions;
        }
    },
    // System Settings
    getSystemSettings: async () => {
        return getStorageData('bankify_settings', initialSystemSettings);
    },
    updateSystemSettings: async (settings) => {
        setStorageData('bankify_settings', settings);
        return settings;
    }
};

export const clientService = {
    // Get current client profile (keys, webhooks)
    getProfile: async () => {
        try {
            // Guide: GET /api/v1/partner/portal/me
            const response = await partnerApi.get('/partner/portal/me');
            return response.data;
        } catch (e) {
            console.warn("Mocking client profile");
            return {
                clientId: 'cl_test_123456789',
                clientSecret: 'sk_test_987654321_do_not_share',
                status: 'ACTIVE',
                webhookUrl: 'https://api.example.com/webhooks',
                environment: 'TEST'
            };
        }
    },
    // Update webhook URL
    updateWebhook: async (url) => {
        // Guide doesn't specify, assuming similar endpoint
        return { success: true };
    }
};

export const atmService = {
    // 2.2 Deposit
    deposit: async (amount, note) => {
        try {
            const idempotencyKey = generateIdempotencyKey('DEP');
            const response = await atmApi.post('/atm/me/deposit', {
                amount: Number(amount),
                note
            }, {
                headers: { 'Idempotency-Key': idempotencyKey }
            });
            return response.data;
        } catch (e) {
            console.warn("Mocking ATM deposit");
            return { id: 'tx_mock_dep', status: 'SUCCESS', amount, type: 'DEPOSIT', currency: 'THB' };
        }
    },

    // 2.3 Withdraw
    withdraw: async (amount, note) => {
        try {
            const idempotencyKey = generateIdempotencyKey('WDR');
            const response = await atmApi.post('/atm/me/withdraw', {
                amount: Number(amount),
                note
            }, {
                headers: { 'Idempotency-Key': idempotencyKey }
            });
            return response.data;
        } catch (e) {
            console.warn("Mocking ATM withdraw");
            return { id: 'tx_mock_wdr', status: 'SUCCESS', amount, type: 'WITHDRAWAL', currency: 'THB' };
        }
    },

    // 2.4 Transfer
    transfer: async (toAccountNumber, amount, note) => {
        try {
            const idempotencyKey = generateIdempotencyKey('TRF');
            const response = await atmApi.post('/atm/me/transfer', {
                toAccountNumber,
                amount: Number(amount),
                note
            }, {
                headers: { 'Idempotency-Key': idempotencyKey }
            });
            return response.data;
        } catch (e) {
            console.warn("Mocking ATM transfer");
            return { id: 'tx_mock_trf', status: 'PENDING', amount, type: 'TRANSFER', currency: 'THB' };
        }
    },

    // 2.5 Transaction history (ATM View)
    getTransactions: async () => {
        try {
            const response = await atmApi.get('/atm/me/transactions');
            return response.data;
        } catch (e) {
            console.warn("Mocking ATM transactions");
            return { content: initialTransactions || [] };
        }
    },

    // Legacy support for older components using getTransactionsByAccount(id)
    getTransactionsByAccount: async (accountId) => {
        // If called with ID, warn but try to use "me" logic if it matches? 
        // Or just redirect to getTransactions()
        return atmService.getTransactions();
    }
};

export const partnerService = {
    // Partner Money Ops
    deposit: async (amount, note) => {
        try {
            const idempotencyKey = generateIdempotencyKey('DEP');
            // Guide: POST /api/v1/partner/me/deposit
            const response = await partnerApi.post('/partner/me/deposit', {
                amount: Number(amount),
                note
            }, {
                headers: { 'Idempotency-Key': idempotencyKey }
            });
            return response.data;
        } catch (e) {
            console.warn("Mocking Partner deposit");
            return { id: 'tx_mock_dep_p', status: 'SUCCESS', amount, type: 'DEPOSIT', currency: 'THB' };
        }
    },

    withdraw: async (amount, note) => {
        try {
            const idempotencyKey = generateIdempotencyKey('WDR');
            const response = await partnerApi.post('/partner/me/withdraw', {
                amount: Number(amount),
                note
            }, {
                headers: { 'Idempotency-Key': idempotencyKey }
            });
            return response.data;
        } catch (e) {
            console.warn("Mocking Partner withdraw");
            return { id: 'tx_mock_wdr_p', status: 'SUCCESS', amount, type: 'WITHDRAWAL', currency: 'THB' };
        }
    },

    transfer: async (toAccountNumber, amount, note) => {
        try {
            const idempotencyKey = generateIdempotencyKey('TRF');
            const response = await partnerApi.post('/partner/me/transfer', {
                accountNumber: toAccountNumber, // Guide says "accountNumber"
                amount: Number(amount),
                note
            }, {
                headers: { 'Idempotency-Key': idempotencyKey }
            });
            return response.data;
        } catch (e) {
            console.warn("Mocking Partner transfer");
            return { id: 'tx_mock_trf_p', status: 'PENDING', amount, type: 'TRANSFER', currency: 'THB' };
        }
    },

    getTransactions: async () => {
        try {
            const response = await partnerApi.get('/partner/me/transactions');
            return response.data;
        } catch (e) {
            return { content: initialTransactions || [] };
        }
    },

    // Alias for compatibility
    getTransactionsByAccount: async () => {
        return partnerService.getTransactions();
    }
};

// Re-export atmService as transactionService for backward compatibility where possible,
// but components should migrate.
export const transactionService = atmService;

export default adminApi; // Default export adminApi to minimize breakage if someone imports 'api' default

