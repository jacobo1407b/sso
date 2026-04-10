
import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';

const prisma = new PrismaClient();

async function getCode() {
    try {
        const user = await prisma.sSO_AUTH_USERS_T.findFirst({
            where: { email: 'admin@admin.com' },
            include: { SSO_AUTH_USER_2FA: true }
        });

        const secret = user?.SSO_AUTH_USER_2FA?.base32;

        if (!secret) {
            console.log('No se encontró secreto MFA para el administrador.');
            return;
        }

        const token = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
        });

        console.log('-----------------------------------');
        console.log(`Secreto Base32: ${secret}`);
        console.log(`CÓDIGO MFA ACTUAL: ${token}`);
        console.log('-----------------------------------');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

getCode();
