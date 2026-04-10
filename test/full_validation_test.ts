
import jwt from 'jsonwebtoken';

async function runValidationTests() {
    const baseUrl = 'http://localhost:5000';
    console.log('🛡️ Iniciando Validación Exhaustiva de Robustez (Con Autenticación)...\n');

    // DATOS DE PRUEBA
    const clientId = 'sso:1773098495932:web:859651ba0ae7bd06edb51d';
    const clientSecret = '3fb3c561321154edc220552939f0adec';
    const user = 'admin@admin.com';
    const pass = '$FBHp94DEyUq2';

    try {
        // PASO 1: Obtener Token Válido
        console.log('--- PASO 1: Obteniendo Token Válido para las pruebas ---');
        const tokenResp = await fetch(`${baseUrl}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ grant_type: 'password', client_id: clientId, client_secret: clientSecret, username: user, password: pass })
        });
        const tokenData: any = await tokenResp.json();
        const token = tokenData.access_token;
        console.log('✅ Token obtenido.\n');

        // 2. CASO DE ERROR: Crear usuario con contraseña débil (Ya autenticado)
        console.log('--- TEST 2: Crear usuario con contraseña débil (Mínimo 12 caracteres + complejos) ---');
        const weakUser = await fetch(`${baseUrl}/api/v1/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                username: 'test.user',
                name: 'Test',
                last_name: 'User',
                email: 'test@user.com',
                password: '123' // Fallará por corta y simple
            })
        });
        const weakUserData = await weakUser.json();
        console.log('Respuesta (Esperado 400 VALIDATION_ERROR):', weakUser.status, weakUserData.code);
        if (weakUserData.errors) console.log('Detalle:', weakUserData.errors[0].msg);

        // 3. CASO DE ERROR: UUID Malformado en Company (Ya autenticado)
        console.log('\n--- TEST 3: Consulta de Compañía con ID que no es UUID ---');
        const badUuid = await fetch(`${baseUrl}/api/v1/company/esto-no-es-un-uuid`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const badUuidData = await badUuid.json();
        console.log('Respuesta (Esperado 400 VALIDATION_ERROR):', badUuid.status, badUuidData.code);
        if (badUuidData.errors) console.log('Detalle:', badUuidData.errors[0].msg);

        // 4. CASO DE ÉXITO: Crear Business Unit (Datos válidos)
        console.log('\n--- TEST 4: Crear Business Unit con datos correctos ---');
        const goodBu = await fetch(`${baseUrl}/api/v1/company`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                bu: { name: 'Test Corp', code: 'TCORP' },
                branch: [{ name: 'Sucursal Norte' }]
            })
        });
        console.log('Respuesta (Esperado 201):', goodBu.status);

    } catch (error) {
        console.error('❌ Error durante el test:', error);
    }

    console.log('\n✅ Validación de Robustez Finalizada.');
}

runValidationTests();
