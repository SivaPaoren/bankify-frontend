export const initialClients = [
    { id: 1, name: 'Mock Client A', apiKey: 'test_key_123', status: 'ACTIVE' },
    { id: 2, name: 'Mock Client B', apiKey: 'live_key_999', status: 'SUSPENDED' }
];

export const initialCustomers = [
    { id: 101, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '0812345678', type: 'INDIVIDUAL', status: 'ACTIVE' },
    { id: 102, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '0898765432', type: 'BUSINESS', status: 'ACTIVE' }
];

export const initialAccounts = [
    { id: 201, accountNumber: '8822-0001', customerId: 101, type: 'SAVINGS', currency: 'THB', balance: 50000, status: 'ACTIVE' },
    { id: 202, accountNumber: '8822-0002', customerId: 102, type: 'CURRENT', currency: 'USD', balance: 1500, status: 'ACTIVE' }
];

export const initialAuditLogs = [
    { id: 1, action: 'LOGIN', user: 'admin@bankify.local', details: 'Admin login', timestamp: new Date(Date.now() - 1000000).toISOString() },
    { id: 2, action: 'VIEW_CLIENTS', user: 'admin@bankify.local', details: 'Viewed API clients', timestamp: new Date(Date.now() - 500000).toISOString() }
];

export const initialTransactions = [
    { id: 'tx_001', date: new Date(Date.now() - 100000).toISOString(), type: 'DEPOSIT', amount: 5000.00, currency: 'THB', status: 'SUCCESS', source: 'ATM-01', destination: '8822-0001', customerId: 101 },
    { id: 'tx_002', date: new Date(Date.now() - 200000).toISOString(), type: 'WITHDRAWAL', amount: 1000.00, currency: 'USD', status: 'SUCCESS', source: '8822-0002', destination: 'ATM-02', customerId: 102 },
    { id: 'tx_003', date: new Date(Date.now() - 300000).toISOString(), type: 'TRANSFER', amount: 2500.00, currency: 'THB', status: 'PENDING', source: '8822-0001', destination: '8822-0002', customerId: 101 },
    { id: 'tx_004', date: new Date(Date.now() - 86400000).toISOString(), type: 'PAYMENT', amount: 120.00, currency: 'EUR', status: 'FAILED', source: '8822-0002', destination: 'MERCHANT-99', customerId: 102 },
    { id: 'tx_005', date: new Date(Date.now() - 90000000).toISOString(), type: 'DEPOSIT', amount: 10000.00, currency: 'THB', status: 'SUCCESS', source: 'BANK-COUNTER', destination: '8822-0001', customerId: 101 },
];

export const initialSystemSettings = {
    bankName: 'Bankify',
    supportEmail: 'support@bankify.com',
    maintenanceMode: false,
    defaultCurrency: 'THB',
    supportedCurrencies: {
        THB: true,
        USD: true,
        EUR: true,
        GBP: false,
        CHF: false
    },
    transactionLimits: {
        dailyTransferLimit: 50000,
        dailyWithdrawLimit: 20000
    }
};
