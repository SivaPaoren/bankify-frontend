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
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data;
        } catch (error) {
            console.warn("Backend unavailable, using MOCK login for testing.", error);

            // Allow admin login
            if (email.includes('admin') || email === 'admin@bankify.local') {
                return {
                    token: 'mock-admin-token',
                    user: { id: 1, email: email, role: 'ADMIN', name: 'Admin User', currency: 'THB' }
                };
            }

            // Allow client login
            if (email.includes('client') || email === 'client@bankify.local') {
                return {
                    token: 'mock-client-token',
                    user: { id: 2, email: email, role: 'CLIENT', name: 'Client User', currency: 'THB' }
                };
            }

            // Fallback for unknown users
            return {
                token: 'mock-user-token',
                user: { id: 3, email: email, role: 'USER', name: 'Demo User', currency: 'THB' }
            };
        }
    },

    // ATM Login typically uses the same endpoint but might vary in UI param names
    // Backend expects email/username & password.
    atmLogin: async (bankId, password) => {
        try {
            // Assuming bankId maps to 'email' or 'username' field on backend
            const response = await api.post('/auth/login', { email: bankId, password });
            return response.data;
        } catch (error) {
            console.warn("Backend unavailable or Network Error, using MOCK ATM login.", error);
            return {
                token: 'mock-atm-token',
                user: {
                    id: 999,
                    email: 'atm-user@bankify.local',
                    bankId: bankId,
                    role: 'USER',
                    name: 'ATM User',
                    currency: 'THB' // Default currency
                }
            };
        }
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
            const response = await api.get('/admin/clients');
            return response.data;
        } catch (e) {
            console.warn("Backend unavailable, loading clients from LocalStorage");
            return getStorageData('bankify_clients', initialClients);
        }
    },
    // 1.3 Create a new API client
    createClient: async (name) => {
        try {
            const response = await api.post('/admin/clients', { name });
            return response.data;
        } catch (e) {
            console.warn("Backend unavailable, saving client to LocalStorage");
            const clients = getStorageData('bankify_clients', initialClients);
            const newClient = {
                id: Date.now(),
                name,
                apiKey: `test_key_${Math.random().toString(36).substr(2, 9)}`,
                status: 'ACTIVE'
            };
            clients.push(newClient);
            setStorageData('bankify_clients', clients);
            logAudit('CREATE_CLIENT', `Created API Client: ${name}`);
            return newClient;
        }
    },
    // 1.4 Disable a client
    disableClient: async (clientId) => {
        try {
            const response = await api.patch(`/admin/clients/${clientId}/disable`);
            return response.data;
        } catch (e) {
            console.warn("Backend unavailable, updating client in LocalStorage");
            const clients = getStorageData('bankify_clients', initialClients);
            const updatedClients = clients.map(c =>
                c.id === clientId ? { ...c, status: c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : c
            );
            setStorageData('bankify_clients', updatedClients);
            logAudit('TOGGLE_CLIENT_STATUS', `Toggled status for client ID: ${clientId}`);
            return { success: true };
        }
    },

    // Customers (Admin manages these)
    getCustomers: async () => {
        try {
            const response = await api.get('/customers');
            return response.data;
        } catch (e) {
            console.warn("Backend unavailable, loading customers from LocalStorage");
            return getStorageData('bankify_customers', initialCustomers);
        }
    },
    getCustomer: async (customerId) => {
        const response = await api.get(`/customers/${customerId}`);
        return response.data;
    },
    createCustomer: async (customerData) => {
        try {
            const response = await api.post('/customers', customerData);
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
        const response = await api.patch(`/customers/${customerId}`, updateData);
        return response.data;
    },

    // Accounts
    getAccounts: async (params = {}) => {
        try {
            const response = await api.get('/accounts', { params });
            return response.data;
        } catch (e) {
            console.warn("Backend unavailable, loading accounts from LocalStorage");
            let accounts = getStorageData('bankify_accounts', initialAccounts);

            // Filter by customerId if provided
            if (params.customerId) {
                accounts = accounts.filter(acc => String(acc.customerId) === String(params.customerId));
            }

            return accounts;
        }
    },
    createAccount: async (accountData) => {
        try {
            const response = await api.post('/accounts', accountData);
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
        const response = await api.get(`/accounts/${accountId}`);
        return response.data;
    },
    getAccountLedger: async (accountId) => {
        const response = await api.get(`/accounts/${accountId}/ledger`);
        return response.data;
    },
    // Freeze Account
    freezeAccount: async (accountId) => {
        try {
            await api.patch(`/accounts/${accountId}/freeze`);
        } catch (e) {
            console.warn("Mocking freeze account");
            const accounts = getStorageData('bankify_accounts', initialAccounts);
            const updated = accounts.map(acc => {
                if (String(acc.id) === String(accountId) || acc.accountNumber === accountId) {
                    // Check if already frozen to toggle? Or just set to FROZEN? 
                    // Usually freeze is a specific state. Let's toggle or set. 
                    // Req says "freeze". Let's assume SET TO FROZEN/ACTIVE toggle.
                    const newStatus = acc.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN';
                    return { ...acc, status: newStatus };
                }
                return acc;
            });
            setStorageData('bankify_accounts', updated);
            logAudit('FREEZE_ACCOUNT', `Toggled freeze status for Account: ${accountId}`);
        }
    },
    // Close Account (Permanently Delete)
    closeAccount: async (accountId) => {
        try {
            await api.delete(`/accounts/${accountId}`);
        } catch (e) {
            console.warn("Mocking close (delete) account");
            let accounts = getStorageData('bankify_accounts', initialAccounts);
            // Hard delete: remove from array
            const initialLength = accounts.length;
            accounts = accounts.filter(acc => String(acc.id) !== String(accountId) && acc.accountNumber !== accountId);

            if (accounts.length < initialLength) {
                setStorageData('bankify_accounts', accounts);
                logAudit('DELETE_ACCOUNT', `Permanently deleted Account: ${accountId}`);
            }
        }
    },

    // Delete Customer (Cascading Delete)
    deleteCustomer: async (customerId) => {
        try {
            await api.delete(`/customers/${customerId}`);
        } catch (e) {
            console.warn("Mocking delete customer with cascading account deletion");
            // 1. Delete Customer
            let customers = getStorageData('bankify_customers', initialCustomers);
            customers = customers.filter(c => String(c.id) !== String(customerId));
            setStorageData('bankify_customers', customers);

            // 2. Cascade Delete Accounts
            let accounts = getStorageData('bankify_accounts', initialAccounts);
            const accountsBefore = accounts.length;
            accounts = accounts.filter(acc => String(acc.customerId) !== String(customerId));
            setStorageData('bankify_accounts', accounts);

            const deletedAccountsCount = accountsBefore - accounts.length;
            logAudit('DELETE_CUSTOMER', `Deleted Customer: ${customerId} and ${deletedAccountsCount} associated accounts.`);
        }
    },

    // Audit Logs
    getAuditLogs: async () => {
        try {
            const response = await api.get('/admin/audit-logs');
            return response.data;
        } catch (e) {
            return getStorageData('bankify_audit_logs', initialAuditLogs);
        }
    },
    // Transactions
    getTransactions: async (params = {}) => {
        try {
            const response = await api.get('/admin/transactions', { params });
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
            if (params.startDate && params.endDate) {
                const start = new Date(params.startDate).getTime();
                const end = new Date(params.endDate).getTime();
                transactions = transactions.filter(t => {
                    const date = new Date(t.date).getTime();
                    return date >= start && date <= end;
                });
            }

            return transactions;
        }
    },
    // System Settings
    getSystemSettings: async () => {
        try {
            const response = await api.get('/admin/settings');
            return response.data;
        } catch (e) {
            return getStorageData('bankify_settings', initialSystemSettings);
        }
    },
    updateSystemSettings: async (settings) => {
        try {
            const response = await api.put('/admin/settings', settings);
            return response.data;
        } catch (e) {
            setStorageData('bankify_settings', settings);
            logAudit('UPDATE_SETTINGS', 'Updated system settings');
            return settings;
        }
    }
};

export const clientService = {
    // Get current client profile (keys, webhooks)
    getProfile: async () => {
        try {
            const response = await api.get('/clients/me');
            return response.data;
        } catch (e) {
            console.warn("Mocking client profile due to error:", e);
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
        const response = await api.patch('/clients/me/webhook', { url });
        return response.data;
    }
};

export const transactionService = {
    // 2.2 Deposit
    deposit: async (accountId, amount, note, reference) => {
        try {
            const idempotencyKey = reference || generateIdempotencyKey('DEP');
            const response = await api.post('/transactions/deposit', {
                accountId,
                amount: Number(amount),
                note
            }, {
                headers: { 'Idempotency-Key': idempotencyKey }
            });
            return response.data;
        } catch (e) {
            console.warn("Mocking deposit");
            return { id: 'tx_mock_dep', status: 'SUCCESS', amount, type: 'DEPOSIT', currency: 'THB' };
        }
    },

    // 2.3 Withdraw
    withdraw: async (accountId, amount, note, reference) => {
        try {
            const idempotencyKey = reference || generateIdempotencyKey('WDR');
            const response = await api.post('/transactions/withdraw', {
                accountId,
                amount: Number(amount),
                note
            }, {
                headers: { 'Idempotency-Key': idempotencyKey }
            });
            return response.data;
        } catch (e) {
            console.warn("Mocking withdraw");
            return { id: 'tx_mock_wdr', status: 'SUCCESS', amount, type: 'WITHDRAWAL', currency: 'THB' };
        }
    },

    // 2.4 Transfer
    transfer: async (fromAccountId, toAccountId, amount, note, reference) => {
        try {
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
        } catch (e) {
            console.warn("Mocking transfer");
            return { id: 'tx_mock_trf', status: 'PENDING', amount, type: 'TRANSFER', currency: 'THB' };
        }
    },

    // 2.5 Transaction history
    // List transactions by account
    getTransactionsByAccount: async (accountId) => {
        try {
            const response = await api.get(`/transactions`, { params: { accountId } });
            return response.data;
        } catch (e) {
            console.warn("Backend unavailable, loading account transactions from LocalStorage");
            let transactions = getStorageData('bankify_transactions', initialTransactions);
            const filtered = transactions.filter(t =>
                String(t.source) === String(accountId) ||
                String(t.destination) === String(accountId) ||
                String(t.customerId) === String(accountId) // Fallback for testing
            );
            return { content: filtered };
        }
    },


    // Get single transaction
    getTransaction: async (transactionId) => {
        try {
            const response = await api.get(`/transactions/${transactionId}`);
            return response.data;
        } catch (e) {
            return { id: transactionId, type: 'DEPOSIT', amount: 1000, status: 'SUCCESS', currency: 'THB' };
        }

    }
};

export default api;
