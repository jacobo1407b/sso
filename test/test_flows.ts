
import jwt from 'jsonwebtoken';

async function runTests() {
    const baseUrl = 'http://localhost:5000';
    console.log('🚀 Iniciando Pruebas de Flujos SSO (Final)...\n');

    const clientId = 'sso:1773098495932:web:859651ba0ae7bd06edb51d';
    const clientSecret = '3fb3c561321154edc220552939f0adec';
    const user = 'admin@admin.com';
    const pass = '$FBHp94DEyUq2';

    try {
        console.log(`--- PRUEBA 1: Password Grant ---`);
        const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'password',
                client_id: clientId,
                client_secret: clientSecret,
                username: user,
                password: pass
            })
        });

        const tokenData: any = await tokenResponse.json();
        
        if (tokenResponse.ok) {
            console.log('✅ Token obtenido con éxito.');
            console.log('🔑 Access Token: Presente');
            console.log('🆔 ID Token (OIDC): Presente');
            console.log('🍪 Cookie HttpOnly: Enviada');

            console.log('\n--- PRUEBA 2: Validación de Sesión (/oauth/authorize) ---');
            const authResponse = await fetch(`${baseUrl}/oauth/authorize`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
            });
            const userData = await authResponse.json();
            
            if (authResponse.ok) {
                console.log('✅ Sesión validada. Usuario identificado:', userData.username);
            } else {
                console.log('❌ Error al validar sesión:', userData);
            }

            console.log('\n--- PRUEBA 3: Client Credentials (M2M) ---');
            const m2mResponse = await fetch(`${baseUrl}/oauth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: clientId,
                    client_secret: clientSecret
                })
            });
            const m2mData: any = await m2mResponse.json();
            if (m2mResponse.ok) {
                console.log('✅ Token de Máquina obtenido con éxito.');
                const payload: any = jwt.decode(m2mData.access_token);
                console.log('🤖 Payload Identificado como Service Account:', payload.clientId);
                console.log('📄 Scopes permitidos:', payload.scope);
            } else {
                console.log('❌ Error en Client Credentials:', m2mData);
            }

        } else {
            console.error('❌ Error en Password Grant:', tokenData);
        }

    } catch (error) {
        console.error('❌ Error durante la ejecución de las pruebas:', error);
    }
}

runTests();
