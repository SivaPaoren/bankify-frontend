import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('bankify_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('bankify_token');
            localStorage.removeItem('bankify_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

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

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // ATM Login typically uses the same endpoint but might vary in UI param names
    // Backend expects email/username & password.
    atmLogin: async (bankId, password) => {
        // Assuming bankId maps to 'email' or 'username' field on backend
        const response = await api.post('/auth/login', { email: bankId, password });
        return response.data;
    }
};

export const adminService = {
    // 1.2 View all API clients
    getClients: async () => {
        const response = await api.get('/admin/clients');
        return response.data;
    },
    // 1.3 Create a new API client
    createClient: async (name) => {
        const response = await api.post('/admin/clients', { name });
        return response.data;
    },
    // 1.4 Disable a client
    disableClient: async (clientId) => {
        const response = await api.patch(`/admin/clients/${clientId}/disable`);
        return response.data;
    },

    // Customers (Admin manages these)
    getCustomers: async () => {
        const response = await api.get('/customers');
        return response.data;
    },
    getCustomer: async (customerId) => {
        const response = await api.get(`/customers/${customerId}`);
        return response.data;
    },
    createCustomer: async (customerData) => {
        // { fullName, email, phone, type: "INDIVIDUAL" }
        const response = await api.post('/customers', customerData);
        return response.data;
    },
    updateCustomer: async (customerId, updateData) => {
        const response = await api.patch(`/customers/${customerId}`, updateData);
        return response.data;
    },

    // Accounts
    getAccounts: async () => { // List all accounts (maybe filtered by customer in backend)
        const response = await api.get('/accounts');
        return response.data;
    },
    createAccount: async (accountData) => {
        // { customerId, type: "CURRENT"|"SAVINGS", currency: "THB" }
        const response = await api.post('/accounts', accountData);
        return response.data;
    },
    getAccount: async (accountId) => {
        const response = await api.get(`/accounts/${accountId}`);
        return response.data;
    },
    getAccountLedger: async (accountId) => {
        const response = await api.get(`/accounts/${accountId}/ledger`);
        return response.data;
    }
};

export const transactionService = {
    // 2.2 Deposit
    deposit: async (accountId, amount, note, reference) => {
        const idempotencyKey = reference || generateIdempotencyKey('DEP');
        const response = await api.post('/transactions/deposit', {
            accountId,
            amount: Number(amount),
            note
        }, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
        return response.data;
    },

    // 2.3 Withdraw
    withdraw: async (accountId, amount, note, reference) => {
        const idempotencyKey = reference || generateIdempotencyKey('WDR');
        const response = await api.post('/transactions/withdraw', {
            accountId,
            amount: Number(amount),
            note
        }, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
        return response.data;
    },

    // 2.4 Transfer
    transfer: async (fromAccountId, toAccountId, amount, note, reference) => {
        const idempotencyKey = reference || generateIdempotencyKey('TRF');
        const response = await api.post('/transactions/transfer', {
            fromAccountId,
            toAccountId,
            amount: Number(amount),
            note
        }, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
        return response.data;
    },

    // 2.5 Transaction history
    // List transactions by account
    getTransactionsByAccount: async (accountId) => {
        const response = await api.get(`/transactions`, { params: { accountId } });
        return response.data;
    },

    // Get single transaction
    getTransaction: async (transactionId) => {
        const response = await api.get(`/transactions/${transactionId}`);
        return response.data;
    }
};

export default api;
