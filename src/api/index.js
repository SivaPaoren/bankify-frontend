import axios from 'axios';

// ─────────────────────────────────────────────────────────────────
// API CONFIGURATION
// Backend context-path: /finance  (application-dev.yml)
// Vite proxy: /finance/api  →  http://localhost:8080
// All endpoints are under /finance/api/v1/...
// ─────────────────────────────────────────────────────────────────

export const APP_BASE   = '/finance';            // used by router & href redirects
const BASE_URL          = `${APP_BASE}/api/v1`;  // base for all axios instances

// Shared default headers
const defaultHeaders = { 'Content-Type': 'application/json' };

// ─────────────────────────────────────────────────────────────────
// AXIOS INSTANCES  (one per actor / JWT namespace)
// ─────────────────────────────────────────────────────────────────

function createInstance(tokenKey) {
    const instance = axios.create({ baseURL: BASE_URL, headers: defaultHeaders });

    // Attach token from localStorage before every request
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem(tokenKey);
            if (token) config.headers['Authorization'] = `Bearer ${token}`;
            return config;
        },
        (error) => Promise.reject(error)
    );

    return instance;
}

export const adminApi   = createInstance('bankify_admin_token');
export const atmApi     = createInstance('bankify_atm_token');
export const partnerApi = createInstance('bankify_partner_token');

// ─────────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTORS  — handle 401 per actor type
// ─────────────────────────────────────────────────────────────────

function onResponseError(error, actorType) {
    if (error.response?.status === 401) {
        if (actorType === 'ADMIN')   localStorage.removeItem('bankify_admin_token');
        if (actorType === 'PARTNER') localStorage.removeItem('bankify_partner_token');
        if (actorType === 'ATM') {
            localStorage.removeItem('bankify_atm_token');
            if (!window.location.pathname.includes('/atm-login')) {
                window.location.href = `${APP_BASE}/atm-login?expired=1`;
            }
        }
    }
    return Promise.reject(error);
}

adminApi.interceptors.response.use(  (r) => r, (e) => onResponseError(e, 'ADMIN'));
atmApi.interceptors.response.use(    (r) => r, (e) => onResponseError(e, 'ATM'));
partnerApi.interceptors.response.use((r) => r, (e) => onResponseError(e, 'PARTNER'));

// ─────────────────────────────────────────────────────────────────
// HELPER — Idempotency key generator
// Used on deposit / withdraw / transfer to prevent double-posting
// ─────────────────────────────────────────────────────────────────

export function generateIdempotencyKey(prefix = 'TX') {
    const id = crypto?.randomUUID?.() ??
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    return `${prefix}-${id}`;
}

// ─────────────────────────────────────────────────────────────────
// AUTH SERVICE
// ─────────────────────────────────────────────────────────────────

export const authService = {
    // Admin login  →  POST /api/v1/admin/auth/login
    login: async (email, password) => {
        const { data } = await adminApi.post('/admin/auth/login', { email, password });
        const { token, role, ...userData } = data;
        localStorage.setItem('bankify_admin_token', token);
        localStorage.setItem('bankify_user', JSON.stringify({ ...userData, role }));
        return data;
    },

    // ATM (customer) login  →  POST /api/v1/atm/auth/login
    atmLogin: async (accountNumber, pin) => {
        const { data } = await atmApi.post('/atm/auth/login', { accountNumber, pin });
        localStorage.setItem('bankify_atm_token', data.token);
        return data;
    },

    // Partner portal login  →  POST /api/v1/partner/auth/login
    partnerLogin: async (email, password) => {
        const { data } = await partnerApi.post('/partner/auth/login', { email, password });
        localStorage.setItem('bankify_partner_token', data.token);
        return data;
    },

    // Partner portal signup  →  POST /api/v1/partner/auth/signup
    partnerSignup: async (appName, email, password) => {
        const { data } = await partnerApi.post('/partner/auth/signup', { appName, email, password });
        return data;
    },

    // Clear all sessions and return to login page
    logout: () => {
        localStorage.removeItem('bankify_admin_token');
        localStorage.removeItem('bankify_atm_token');
        localStorage.removeItem('bankify_partner_token');
        localStorage.removeItem('bankify_user');
        window.location.href = `${APP_BASE}/login`;
    },
};

// ─────────────────────────────────────────────────────────────────
// ADMIN SERVICE  (requires ADMIN or OPERATOR role)
// ─────────────────────────────────────────────────────────────────

export const adminService = {
    // ── Partner Apps ──────────────────────────────────────────────
    getClients:           async ()          => (await adminApi.get('/admin/partner-apps')).data,
    approveClient:        async (id)        => (await adminApi.patch(`/admin/partner-apps/${id}/approve`)).data,
    activateClient:       async (id)        => (await adminApi.patch(`/admin/partner-apps/${id}/activate`)).data,
    disableClient:        async (id)        => (await adminApi.patch(`/admin/partner-apps/${id}/disable`)).data,

    // ── Key Rotation Requests ─────────────────────────────────────
    listRotationRequests: async ()          => (await adminApi.get('/admin/partner-apps/rotation-requests')).data,
    approveKeyRotation:   async (requestId) => (await adminApi.patch(`/admin/partner-apps/rotation-requests/${requestId}/approve`)).data,
    rejectKeyRotation:    async (requestId) => (await adminApi.patch(`/admin/partner-apps/rotation-requests/${requestId}/reject`)).data,

    // ── Customers ─────────────────────────────────────────────────
    getCustomers:     async ()                     => (await adminApi.get('/admin/customers')).data,
    getCustomer:      async (id)                   => (await adminApi.get(`/admin/customers/${id}`)).data,
    createCustomer:   async (data)                 => (await adminApi.post('/admin/customers', data)).data,
    updateCustomer:   async (id, data)             => (await adminApi.patch(`/admin/customers/${id}`, data)).data,
    freezeCustomer:   async (id)                   => (await adminApi.patch(`/admin/customers/${id}/disable`)).data,
    reactivateCustomer: async (id)                 => (await adminApi.patch(`/admin/customers/${id}/reactivate`)).data,
    closeCustomer:    async (id)                   => (await adminApi.patch(`/admin/customers/${id}/close`)).data,

    // ── Accounts ──────────────────────────────────────────────────
    getAccounts:      async (params = {})          => (await adminApi.get('/admin/accounts', { params })).data,
    getAccount:       async (id)                   => (await adminApi.get(`/admin/accounts/${id}`)).data,
    createAccount:    async (data)                 => (await adminApi.post('/admin/accounts', data)).data,
    updateAccountStatus: async (id, status)        => (await adminApi.patch(`/admin/accounts/${id}`, { status })).data,
    freezeAccount:    async (id)                   => (await adminApi.patch(`/admin/accounts/${id}/disable`)).data,
    getAccountLedger: async (id)                   => (await adminApi.get(`/admin/accounts/${id}/ledger`)).data,
    resetAtmPin:      async (accountId, newPin)    => (await adminApi.patch(`/admin/accounts/${accountId}/pin`, { pin: newPin })).data,

    // ── Transactions (Admin view) ─────────────────────────────────
    getTransactions:  async (params = {})          => (await adminApi.get('/admin/transactions', { params })).data,
    getTransaction:   async (id)                   => (await adminApi.get(`/admin/transactions/${id}`)).data,
    getAccountTransactions: async (accountId)      => (await adminApi.get('/admin/transactions', { params: { accountId } })).data,
    getLedger:        async (params = {})          => (await adminApi.get('/admin/transactions/ledger', { params })).data,

    // ── Admin-initiated Money Ops (requires ADMIN role, not OPERATOR) ──
    deposit: async (accountId, amount, note = 'Admin Deposit') => {
        const { data } = await adminApi.post('/admin/transactions/deposit',
            { accountId, amount, note },
            { headers: { 'Idempotency-Key': generateIdempotencyKey('DEP') } }
        );
        return data;
    },
    withdraw: async (accountId, amount, note = 'Admin Withdraw') => {
        const { data } = await adminApi.post('/admin/transactions/withdraw',
            { accountId, amount, note },
            { headers: { 'Idempotency-Key': generateIdempotencyKey('WDR') } }
        );
        return data;
    },
    transfer: async (fromAccountId, toAccountId, amount, note = 'Admin Transfer') => {
        const { data } = await adminApi.post('/admin/transactions/transfer',
            { fromAccountId, toAccountId, amount, note },
            { headers: { 'Idempotency-Key': generateIdempotencyKey('TRF') } }
        );
        return data;
    },

    // ── Audit Logs ────────────────────────────────────────────────
    // Filterable by ?actorType=ADMIN|ATM|PARTNER & ?action=...
    getAuditLogs: async (params = {}) => (await adminApi.get('/admin/audit-logs', { params })).data,

    // ── Aliases kept for backward compatibility ───────────────────
    /** @deprecated use freezeCustomer() */
    deleteCustomer: async (id) => (await adminApi.patch(`/admin/customers/${id}/disable`)).data,
    /** @deprecated use getLedger() */
    getGlobalLedger: async (params = {}) => (await adminApi.get('/admin/transactions/ledger', { params })).data,
    /** @deprecated use updateAccountStatus() with status='CLOSED' */
    closeAccount: async (id) => (await adminApi.patch(`/admin/accounts/${id}`, { status: 'CLOSED' })).data,
};

// ─────────────────────────────────────────────────────────────────
// ATM SERVICE  (requires ATM role — customer-facing)
// ─────────────────────────────────────────────────────────────────

export const atmService = {
    getBalance:    async ()                      => (await atmApi.get('/atm/me/balance')).data,
    getTransactions: async ()                    => (await atmApi.get('/atm/me/transactions')).data,
    changePin:     async ({ oldPin, newPin })    => (await atmApi.post('/atm/me/change-pin', { oldPin, newPin })).data,

    deposit: async (amount, note) => {
        const { data } = await atmApi.post('/atm/me/deposit',
            { amount: Number(amount), note },
            { headers: { 'Idempotency-Key': generateIdempotencyKey('DEP') } }
        );
        return data;
    },
    withdraw: async (amount, note) => {
        const { data } = await atmApi.post('/atm/me/withdraw',
            { amount: Number(amount), note },
            { headers: { 'Idempotency-Key': generateIdempotencyKey('WDR') } }
        );
        return data;
    },
    // Note: backend expects { toAccountNumber, amount, note }
    transfer: async (toAccountNumber, amount, note) => {
        const { data } = await atmApi.post('/atm/me/transfer',
            { toAccountNumber, amount: Number(amount), note },
            { headers: { 'Idempotency-Key': generateIdempotencyKey('TRF') } }
        );
        return data;
    },

    /** @deprecated use getTransactions() */
    getTransactionsByAccount: async () => atmService.getTransactions(),
};

// ─────────────────────────────────────────────────────────────────
// PARTNER SERVICE  (requires PARTNER role — partner portal)
// ─────────────────────────────────────────────────────────────────

export const partnerService = {
    // ── Portal info ───────────────────────────────────────────────
    getPartnerInfo:  async () => (await partnerApi.get('/partner/portal/me')).data,

    // ── Money ops ─────────────────────────────────────────────────
    getBalance:      async () => (await partnerApi.get('/partner/me/balance')).data,
    getTransactions: async () => (await partnerApi.get('/partner/me/transactions')).data,

    deposit: async (amount, note) => {
        const { data } = await partnerApi.post('/partner/me/deposit',
            { amount: Number(amount), note },
            { headers: { 'Idempotency-Key': generateIdempotencyKey('DEP') } }
        );
        return data;
    },
    withdraw: async (amount, note) => {
        const { data } = await partnerApi.post('/partner/me/withdraw',
            { amount: Number(amount), note },
            { headers: { 'Idempotency-Key': generateIdempotencyKey('WDR') } }
        );
        return data;
    },
    transfer: async (toAccountNumber, amount, note) => {
        const { data } = await partnerApi.post('/partner/me/transfer',
            { toAccountNumber, amount: Number(amount), note },
            { headers: { 'Idempotency-Key': generateIdempotencyKey('TRF') } }
        );
        return data;
    },

    // ── API Key rotation ──────────────────────────────────────────
    // POST /api/v1/partner/portal/keys/rotate-request
    requestRotation:  async (reason)  => (await partnerApi.post('/partner/portal/keys/rotate-request', { reason })).data,
    // GET  /api/v1/partner/portal/keys/rotation-requests
    getRotationHistory: async ()      => (await partnerApi.get('/partner/portal/keys/rotation-requests')).data,
    // GET  /api/v1/partner/portal/key/retrieve  (one-time read from vault)
    retrieveKey:      async ()        => (await partnerApi.get('/partner/portal/key/retrieve')).data,

    /** @deprecated use getTransactions() */
    getTransactionsByAccount: async () => partnerService.getTransactions(),
};

// ─────────────────────────────────────────────────────────────────
// BACKWARD-COMPAT ALIASES
// ─────────────────────────────────────────────────────────────────

/** @deprecated clientService merged into partnerService */
export const clientService = {
    getProfile:     partnerService.getPartnerInfo,
    updateWebhook:  async () => ({ success: true }),  // not yet implemented in backend
};

/** @deprecated import atmService directly */
export const transactionService = atmService;

export default adminApi;