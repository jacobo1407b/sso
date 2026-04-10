
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanup() {
    try {
        console.log('🧹 Limpiando datos de 2FA para pruebas...');
        await prisma.sSO_AUTH_USERS_T.updateMany({
            where: { email: 'admin@admin.com' },
            data: { id_user_2fa: null }
        });
        await prisma.sSO_AUTH_USER_2FA.deleteMany({});
        console.log('✅ Base de datos lista para pruebas de 2FA.');
    } catch (e) {
        console.error('❌ Error en limpieza:', e);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
