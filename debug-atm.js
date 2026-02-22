import axios from 'axios';

const API = 'http://localhost:8080/api/v1';

// Admin login
const loginRes = await axios.post(API + '/admin/auth/login', { email: 'admin@bankify.local', password: 'admin123' })
    .catch(() => axios.post(API + '/admin/auth/login', { email: 'admin@bankify.com', password: 'password' }));
const adminToken = loginRes.data.token;
console.log('Admin token (prefix):', adminToken.substring(0, 20));

// Get accounts
const accsRes = await axios.get(API + '/admin/accounts', { headers: { Authorization: 'Bearer ' + adminToken } });
const accs = Array.isArray(accsRes.data) ? accsRes.data : (accsRes.data.content || []);
const customerAccs = accs.filter(a => a.status === 'ACTIVE' && !a.partnerAppId);
console.log('\nCustomer accounts:');
customerAccs.forEach(a => console.log(' ', a.accountNumber, a.type, a.status));

// Try ATM login
if (customerAccs.length > 0) {
    const acct = customerAccs[0];
    console.log('\nTrying ATM login for:', acct.accountNumber);
    const atmRes = await axios.post(API + '/atm/auth/login', { accountNumber: acct.accountNumber, pin: '123456' });
    console.log('ATM Login response:', JSON.stringify(atmRes.data, null, 2));

    const atmToken = atmRes.data.token;
    console.log('\nTrying deposit with token...');
    const depRes = await axios.post(API + '/atm/me/deposit', { amount: 100, note: 'Debug Test' }, {
        headers: { Authorization: 'Bearer ' + atmToken, 'Idempotency-Key': 'debug-001-' + Date.now() }
    }).catch(e => {
        console.log('Deposit error status:', e.response?.status);
        console.log('Deposit error data:', JSON.stringify(e.response?.data));
    });
    if (depRes) console.log('Deposit success:', JSON.stringify(depRes.data));
}
