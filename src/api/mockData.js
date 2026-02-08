export const initialClients = [
    { id: 1, name: 'Mock Client A', apiKey: 'test_key_123', status: 'ACTIVE' },
    { id: 2, name: 'Mock Client B', apiKey: 'live_key_999', status: 'SUSPENDED' }
];

export const initialCustomers = [
    { id: 101, fullName: 'John Doe', email: 'john@example.com', phone: '0812345678', type: 'INDIVIDUAL', status: 'ACTIVE' },
    { id: 102, fullName: 'Jane Smith', email: 'jane@example.com', phone: '0898765432', type: 'BUSINESS', status: 'ACTIVE' }
];

export const initialAccounts = [
    { id: 201, accountNumber: '8822-0001', customerId: 101, type: 'SAVINGS', currency: 'THB', balance: 50000, status: 'ACTIVE' },
    { id: 202, accountNumber: '8822-0002', customerId: 102, type: 'CURRENT', currency: 'USD', balance: 1500, status: 'ACTIVE' }
];

export const initialAuditLogs = [
    { id: 1, action: 'LOGIN', user: 'admin@bankify.local', details: 'Admin login', timestamp: new Date(Date.now() - 1000000).toISOString() },
    { id: 2, action: 'VIEW_CLIENTS', user: 'admin@bankify.local', details: 'Viewed API clients', timestamp: new Date(Date.now() - 500000).toISOString() }
];
