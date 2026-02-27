import axios from 'axios';

// ----------------------------------------------------------------------
// CONFIGURATION FOR AU SERVER DEPLOYMENT
// ----------------------------------------------------------------------
export const API = "/finance"; // Critical for AU Server sub-path
const API_PREFIX = "/api/v1";
const BASE_URL = `${API}${API_PREFIX}`;

const commonHeaders = { 'Content-Type': 'application/json' };

// --- AXIOS INSTANCES ---
export const adminApi = axios.create({ baseURL: BASE_URL, headers: commonHeaders });
export const atmApi = axios.create({ baseURL: BASE_URL, headers: commonHeaders });
export const partnerApi = axios.create({ baseURL: BASE_URL, headers: commonHeaders });

// --- AUTH INTERCEPTORS ---
const addAuthInterceptor = (instance, tokenKey) => {
    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem(tokenKey);
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    });
};

addAuthInterceptor(adminApi, 'bankify_admin_token');
addAuthInterceptor(atmApi, 'bankify_atm_token');
addAuthInterceptor(partnerApi, 'bankify_partner_token');

// --- ERROR HANDLING (Sub-path Aware) ---
const handleResponseError = (error, type) => {
    if (error.response && error.response.status === 401) {
        if (type === 'ADMIN') localStorage.removeItem('bankify_admin_token');
        if (type === 'PARTNER') localStorage.removeItem('bankify_partner_token');
        if (type === 'ATM') {
            localStorage.removeItem('bankify_atm_token');
            const isLogin = window.location.pathname.includes('/atm-login');
            if (!isLogin) {
                // FIXED: Added /finance prefix for redirect
                window.location.href = '/finance/atm-login?expired=1';
            }
        }
    }
    return Promise.reject(error);
};

adminApi.interceptors.response.use(r => r, e => handleResponseError(e, 'ADMIN'));
atmApi.interceptors.response.use(r => r, e => handleResponseError(e, 'ATM'));
partnerApi.interceptors.response.use(r => r, e => handleResponseError(e, 'PARTNER'));

export const generateIdempotencyKey = (prefix = 'TX') => {
    return `${prefix}-${crypto.randomUUID()}`;
};

// --- AUTH SERVICE ---
export const authService = {
    login: async (email, password) => {
        const response = await adminApi.post('/admin/auth/login', { email, password });
        localStorage.setItem('bankify_admin_token', response.data.token);
        localStorage.setItem('bankify_user', JSON.stringify(response.data));
        return response.data;
    },
    atmLogin: async (accountNumber, pin) => {
        const response = await atmApi.post('/atm/auth/login', { accountNumber, pin });
        localStorage.setItem('bankify_atm_token', response.data.token);
        return response.data;
    },
    partnerLogin: async (email, password) => {
        const response = await partnerApi.post('/partner/auth/login', { email, password });
        localStorage.setItem('bankify_partner_token', response.data.token);
        return response.data;
    },
    partnerSignup: async (appName, email, password) => {
        const response = await partnerApi.post('/partner/auth/signup', { appName, email, password });
        return response.data;
    },
    logout: () => {
        localStorage.clear();
        // FIXED: Added /finance prefix for redirect
        window.location.href = '/finance/login';
    }
};

// --- ADMIN SERVICE ---
export const adminService = {
    getClients: () => adminApi.get('/admin/partner-apps').then(r => r.data),
    approveClient: (id) => adminApi.patch(`/admin/partner-apps/${id}/approve`).then(r => r.data),
    activateClient: (id) => adminApi.patch(`/admin/partner-apps/${id}/activate`).then(r => r.data),
    disableClient: (id) => adminApi.patch(`/admin/partner-apps/${id}/disable`).then(r => r.data),
    listRotationRequests: () => adminApi.get('/admin/partner-apps/rotation-requests').then(r => r.data),
    approveKeyRotation: (id) => adminApi.patch(`/admin/partner-apps/rotation-requests/${id}/approve`).then(r => r.data),
    rejectKeyRotation: (id) => adminApi.patch(`/admin/partner-apps/rotation-requests/${id}/reject`).then(r => r.data),
    getCustomers: () => adminApi.get('/admin/customers').then(r => r.data),
    getAccounts: (params) => adminApi.get('/admin/accounts', { params }).then(r => r.data),
    getTransactions: (params) => adminApi.get('/admin/transactions', { params }).then(r => r.data),
    getAuditLogs: (params) => adminApi.get('/admin/audit-logs', { params }).then(r => r.data),
};

// --- ATM SERVICE ---
export const atmService = {
    getBalance: () => atmApi.get('/atm/me/balance').then(r => r.data),
    getTransactions: () => atmApi.get('/atm/me/transactions').then(r => r.data),
    deposit: (amount, note) => {
        const key = generateIdempotencyKey('DEP');
        return atmApi.post('/atm/me/deposit', { amount: Number(amount), note }, { headers: { 'Idempotency-Key': key } }).then(r => r.data);
    },
    withdraw: (amount, note) => {
        const key = generateIdempotencyKey('WDR');
        return atmApi.post('/atm/me/withdraw', { amount: Number(amount), note }, { headers: { 'Idempotency-Key': key } }).then(r => r.data);
    },
    transfer: (accountNumber, amount, note) => {
        const key = generateIdempotencyKey('TRF');
        return atmApi.post('/atm/me/transfer', { toAccountNumber: accountNumber, amount: Number(amount), note }, { headers: { 'Idempotency-Key': key } }).then(r => r.data);
    }
};

// --- PARTNER SERVICE ---
export const partnerService = {
    getPartnerInfo: () => partnerApi.get('/partner/portal/me').then(r => r.data),
    getBalance: () => partnerApi.get('/partner/me/balance').then(r => r.data),
    getTransactions: () => partnerApi.get('/partner/me/transactions').then(r => r.data),

    // ADDED: For security "One-Time Retrieve" logic
    retrieveKey: () => partnerApi.get('/partner/portal/key/retrieve').then(r => r.data),

    requestRotation: (reason) => partnerApi.post('/partner/portal/keys/rotate-request', { reason }).then(r => r.data),
    getRotationHistory: () => partnerApi.get('/partner/portal/keys/rotation-requests').then(r => r.data),

    transfer: (toAccountNumber, amount, note) => {
        const key = generateIdempotencyKey('TRF');
        return partnerApi.post('/partner/me/transfer', { toAccountNumber, amount: Number(amount), note }, { headers: { 'Idempotency-Key': key } }).then(r => r.data);
    }
};

export const transactionService = atmService;
export default adminApi;