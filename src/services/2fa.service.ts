import prisma from "@config/prisma";
import { OAuthError } from "oauth2-server";
import speakeasy from "speakeasy";

class Security2FA {
    async generateSecret() {
        const temp_secret = speakeasy.generateSecret({
            name: process.env.SECRET_SPEAKEASY,
            issuer: process.env.ISSUER_SPEAKEASY
        });

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        return await prisma.sSO_AUTH_USER_2FA.create({
            data: {
                ascii: temp_secret.ascii,
                hex: temp_secret.hex,
                base32: temp_secret.base32,
                otpauth_url: temp_secret?.otpauth_url ?? "",
                verified_status: "UNVERIFIED",
                expires_date: expiresAt
            }
        });

    }

    async updateAttemp(id: string, attempts: number) {
        const lockUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
        await prisma.sSO_AUTH_USER_2FA.update({
            where: { id: id },
            data: {
                failed_attempts: attempts,
                last_attempt_date: attempts === 5 ? lockUntil : new Date(),
                updated_date: new Date(),
                verified_status: attempts === 5 ? 'BLOCKED' : 'FAILED'
            }
        })
    }
    async getSecret(id: string) {
        return await prisma.sSO_AUTH_USER_2FA.findUnique({
            where: { id: id }
        });
    }

    async setSuccess(id: string) {
        await prisma.sSO_AUTH_USER_2FA.update({
            where: { id: id },
            data: {
                verified_status: "VERIFIED",
                verified_date: new Date(),
                failed_attempts: 0,
                updated_date: new Date()
            }
        })
    }

    async setUser2fa(user: string, fa: string) {
        await prisma.sSO_AUTH_USER_2FA.update({
            where: { id: fa },
            data: {
                verified_status: "VERIFIED",
                verified_date: new Date(),
                failed_attempts: 0,
                updated_date: new Date()
            }
        })
        await prisma.sSO_AUTH_USERS_T.update({
            where: { user_id: user },
            data: {
                id_user_2fa: fa
            }
        })
    }

    /*async delete2fa(id: string) {
        await 
    }*/
}

export const faService = new Security2FA();