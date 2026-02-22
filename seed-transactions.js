import axios from 'axios';
import { randomUUID } from 'crypto';

const API = 'http://localhost:8080/api/v1';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const genKey = (prefix = 'TXN') => `${prefix}-${randomUUID()}`;

async function adminLogin() {
    try {
        const r = await axios.post(`${API}/admin/auth/login`, { email: 'admin@bankify.local', password: 'admin123' });
        return r.data.token;
    } catch {
        const r = await axios.post(`${API}/admin/auth/login`, { email: 'admin@bankify.com', password: 'password' });
        return r.data.token;
    }
}

async function deposit(token, accountId, amount, note) {
    return axios.post(`${API}/admin/transactions/deposit`, { accountId, amount, note }, {
        headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': genKey('DEP') }
    });
}

async function withdraw(token, accountId, amount, note) {
    return axios.post(`${API}/admin/transactions/withdraw`, { accountId, amount, note }, {
        headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': genKey('WDR') }
    });
}

async function transfer(token, fromAccountId, toAccountId, amount, note) {
    return axios.post(`${API}/admin/transactions/transfer`, { fromAccountId, toAccountId, amount, note }, {
        headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': genKey('TRF') }
    });
}

async function main() {
    console.log('🏦 Bankify Transaction Seeder (Admin API)\n');

    const token = await adminLogin();
    console.log('✅ Admin login success\n');

    // Fetch all accounts
    const accsRes = await axios.get(`${API}/admin/accounts`, { headers: { Authorization: `Bearer ${token}` } });
    const accounts = Array.isArray(accsRes.data) ? accsRes.data : (accsRes.data.content || []);
    const active = accounts.filter(a => a.status === 'ACTIVE');
    console.log(`📋 ${active.length} active accounts\n`);

    if (active.length === 0) {
        console.error('No active accounts found.');
        process.exit(1);
    }

    let ok = 0, fail = 0;

    // ── Deposits for each account ───────────────────────────────────────────
    const depositBatches = [
        [15000, 'Initial Funding'],
        [8500, 'Salary Credit'],
        [3200, 'Freelance Payment'],
        [6000, 'Investment Return'],
        [1200, 'Bonus Payout'],
        [9800, 'Client Invoice'],
        [2500, 'Referral Reward'],
    ];

    for (const account of active) {
        const id = account.id;
        const acctNum = account.accountNumber;
        console.log(`💳 Account ${acctNum}`);

        for (const [amount, note] of depositBatches) {
            try {
                await deposit(token, id, amount, note);
                console.log(`   💰 +฿${amount.toLocaleString()} "${note}" ✅`);
                ok++;
                await sleep(100);
            } catch (err) {
                console.log(`   ⚠️  Deposit ฿${amount} failed: ${err.response?.data?.message || err.message}`);
                fail++;
            }
        }

        const withdrawBatches = [
            [2500, 'ATM Cash Withdrawal'],
            [1800, 'Rent Payment'],
            [650, 'Grocery Store'],
            [420, 'Utilities Bill'],
            [990, 'Subscription Services'],
        ];

        for (const [amount, note] of withdrawBatches) {
            try {
                await withdraw(token, id, amount, note);
                console.log(`   💸 -฿${amount.toLocaleString()} "${note}" ✅`);
                ok++;
                await sleep(100);
            } catch (err) {
                console.log(`   ⚠️  Withdraw ฿${amount} failed: ${err.response?.data?.message || err.message}`);
                fail++;
            }
        }
        await sleep(200);
    }

    // ── Transfers between accounts ──────────────────────────────────────────
    if (active.length >= 2) {
        console.log('\n🔄 Creating transfers...');
        const pairs = [
            [0, 1, 3500, 'Business Payout'],
            [1, 2 % active.length, 2200, 'Vendor Payment'],
            [0, 2 % active.length, 4100, 'Invoice Settlement'],
            [1, 0, 1600, 'Subscription Refund'],
            [0, 1, 900, 'Service Fee'],
            [2 % active.length, 0, 2800, 'Partner Transfer'],
            [0, 3 % active.length, 5000, 'Capital Transfer'],
        ];

        for (const [fi, ti, amount, note] of pairs) {
            if (!active[fi] || !active[ti] || fi === ti) continue;
            try {
                await transfer(token, active[fi].id, active[ti].id, amount, note);
                console.log(`   ↔️  ฿${amount.toLocaleString()} "${note}" ✅`);
                ok++;
                await sleep(150);
            } catch (err) {
                console.log(`   ⚠️  Transfer ฿${amount} failed: ${err.response?.data?.message || err.message}`);
                fail++;
            }
        }
    }

    console.log(`\n─────────────────────────────────────────────`);
    console.log(`✅ Done! ${ok} transactions created, ${fail} failed`);
    console.log('🔄 Refresh the admin dashboard to see live data!\n');
}

main().catch(console.error);
