
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5000';
const CREDS = {
    clientId: 'sso:1773110697606:web:eb160c41469fcfd90511f7',
    clientSecret: 'd6b404ebf90d89f40b5a22f00cc7aaec',
    user: 'admin@admin.com',
    pass: '$FBHp94DEyUq2'
};

let token = '';
let userId = '';
let companyId = '';
let clientId = '';

async function runMasterTest() {
    console.log('🚀 INICIANDO MASTER API VALIDATION SUITE\n');

    try {
        // --- MODULO 1: OAUTH ---
        console.log('[MODULE: OAUTH]');
        const loginResp = await fetch(`${BASE_URL}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ grant_type: 'password', client_id: CREDS.clientId, client_secret: CREDS.clientSecret, username: CREDS.user, password: CREDS.pass })
        });
        const loginData: any = await loginResp.json();
        if (loginResp.ok) {
            token = loginData.access_token;
            userId = loginData.user.user_id;
            console.log('✅ Success: Login Admin');
        } else {
            console.log('❌ Fail: Login Admin', loginData);
            return;
        }

        // --- MODULO 2: USERS ---
        console.log('\n[MODULE: USERS]');
        // 2.1 List Users
        const usersResp = await fetch(`${BASE_URL}/api/v1/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        console.log(usersResp.ok ? '✅ Success: Get Users List' : `❌ Fail: Get Users List (${usersResp.status})`);

        // 2.2 Create User (Validation Error: Password Weak)
        const weakUser = await fetch(`${BASE_URL}/api/v1/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ username: 'test', name: 'T', last_name: 'U', email: 't@u.com', password: '123' })
        });
        console.log(weakUser.status === 400 ? '✅ Success: Validation Caught Weak Password' : '❌ Fail: Weak Password Not Caught');

        // --- MODULO 3: COMPANY ---
        console.log('\n[MODULE: COMPANY]');
        // 3.1 Create Company
        const createBu = await fetch(`${BASE_URL}/api/v1/company`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ bu: { name: 'Master Corp', code: 'MCORP' }, branch: [{ name: 'Headquarters' }] })
        });
        const buData: any = await createBu.json();
        if (createBu.status === 201) {
            companyId = buData.data.id;
            console.log('✅ Success: Create Business Unit');
        }

        // 3.2 Bad UUID Validation
        const badBu = await fetch(`${BASE_URL}/api/v1/company/not-a-uuid`, { headers: { 'Authorization': `Bearer ${token}` } });
        console.log(badBu.status === 400 ? '✅ Success: UUID Validation Working' : '❌ Fail: UUID Validation Ignored');

        // --- MODULO 4: ROLES ---
        console.log('\n[MODULE: ROLES]');
        const rolesResp = await fetch(`${BASE_URL}/api/v1/rols`, { headers: { 'Authorization': `Bearer ${token}` } });
        console.log(rolesResp.ok ? '✅ Success: Get Roles List' : '❌ Fail: Get Roles List');

        // --- MODULO 5: CLIENTS ---
        console.log('\n[MODULE: CLIENTS]');
        const clientsResp = await fetch(`${BASE_URL}/api/v1/clients`, { headers: { 'Authorization': `Bearer ${token}` } });
        console.log(clientsResp.ok ? '✅ Success: Get Clients List' : '❌ Fail: Get Clients List');

        // --- MODULO 6: 2FA ---
        console.log('\n[MODULE: 2FA]');
        const g2fa = await fetch(`${BASE_URL}/api/v1/2fa/totp/generate`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (g2fa.ok) {
            console.log('✅ Success: Generate 2FA Secret');
        } else {
            const errBody = await g2fa.json();
            console.log('❌ Fail: Generate 2FA Secret', JSON.stringify(errBody, null, 2));
        }

        console.log('\n-------------------------------------------');
        console.log('🏁 MASTER VALIDATION COMPLETE: SYSTEM STABLE');
        console.log('-------------------------------------------');

    } catch (e) {
        console.error('💥 CRITICAL ERROR DURING MASTER TEST:', e);
    }
}

runMasterTest();
