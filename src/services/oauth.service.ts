import prisma from "@config/prisma";
import { parseUserAgent } from "@utils/ua";

class OAuthService {
    async updateUserLogin(id: string) {
        await prisma.sSO_AUTH_USERS_T.update({
            where: { user_id: id },
            data: {
                last_login: new Date()
            }
        });
    }

    async revokToken(user: string, token: string) {
        await prisma.sSO_AUTH_TOKEN_T.deleteMany({
            where: {
                user_id: user,
                access_token: token
            }
        });
    }

    async updateAgent(agent: string, ip: string, id: string) {
        const { browser, os } = parseUserAgent(agent);
        await prisma.sSO_AUTH_TOKEN_T.update({
            where: { token_id: id },
            data: {
                agent: `${os} ${browser}`,
                ip_address: ip
            }
        })
    }

    async resetMfa(email: string) {
        const user = await prisma.sSO_AUTH_USERS_T.findUnique({
            where: { email: email },
            select: {
                SSO_AUTH_USER_2FA: {
                    select: {
                        id: true
                    }
                }
            }
        });
        if (user?.SSO_AUTH_USER_2FA) {
            await prisma.sSO_AUTH_USER_2FA.update({
                where: { id: user.SSO_AUTH_USER_2FA.id },
                data: {
                    log_in_status: null
                }
            })
        }

    }
}

export const oauthService = new OAuthService();

//joaaquiriz