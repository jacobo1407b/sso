import prisma from "@config/prisma";

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
}

export const oauthService = new OAuthService();

//joaaquiriz