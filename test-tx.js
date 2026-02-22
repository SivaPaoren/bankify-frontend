const axios = require('axios');
const API = "http://localhost:8080/api/v1";

async function run() {
  try {
    const loginRes = await axios.post(`${API}/admin/auth/login`, {
      email: 'admin@bankify.com',
      password: 'password'
    });
    const token = loginRes.data.token;
    console.log({ token: token.substring(0, 10) });

    const accountsRes = await axios.get(`${API}/admin/accounts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = accountsRes.data;
    console.log("Accounts is Array?", Array.isArray(data));
    console.log("Keys:", Object.keys(data));
    if (!Array.isArray(data)) console.log("Content is array?", Array.isArray(data.content));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
run();
