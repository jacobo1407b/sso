import jwt from "jsonwebtoken";
import prisma from "@config/prisma";
import { comparePawd } from "@utils/bcrypt"
import { OAuthError } from "oauth2-server";

const SECRET_KEY = process.env.SECRET_KEY || 'tu_clave_secreta';


const getClient = async (clientId: string, clientSecret: string) => {
    //return clients.find(client => client.clientId === clientId && client.clientSecret === clientSecret);
    const result = await prisma.sSO_AUTH_CLIENTS_T.findFirst({
        where: {
            AND: [
                { client_id: clientId },
                { client_secret: clientSecret }
            ]
        },
        include: {
            SSO_AUTH_GRANTS_T: {
                select: {
                    grant_name: true // Solo traerá el campo GRANT_NAME
                }
            }
        }
    });

    if (!result) throw new OAuthError("No se encontro una client con este identificador", {
        code: 404,
        name: "CL_FN"
    });
    return {
        clientId: result?.client_id,
        app: result.app_name,
        clientSecret: result?.client_secret,
        grants: result?.SSO_AUTH_GRANTS_T.map((x) => x.grant_name)
    }
};

const saveToken = async (token: any, client: any, user: any) => {
    let refreshToken: string = '';
    const accessToken = jwt.sign(
        { userId: user?.id, clientId: client.client_id, scope: token.scope, username: user.email },
        SECRET_KEY,
        { expiresIn: Math.floor((token.accessTokenExpiresAt.getTime() - Date.now()) / 1000) }
    );
    if (token.refreshTokenExpiresAt) {
        refreshToken = jwt.sign(
            { userId: user?.id, clientId: client.client_id },
            SECRET_KEY,
            { expiresIn: Math.floor((token.refreshTokenExpiresAt.getTime() - Date.now()) / 1000) }
        );
    }


    await prisma.sSO_AUTH_TOKEN_T.create({
        data: {
            client_id: client.clientId,
            user_id: user?.id?.toString() ?? null,
            access_token: accessToken,
            refresh_token: refreshToken,
            access_expires: token.accessTokenExpiresAt,
            access_refresh: token.refreshTokenExpiresAt
        }
    });
    if (refreshToken) token.refreshToken = refreshToken;
    token.accessToken = accessToken;
    token.client = client;
    token.user = user;
    return token
};

const getAccessToken = async (accessToken: string) => {
    const tokenData = await prisma.sSO_AUTH_TOKEN_T.findFirst({
        where: { access_token: accessToken }
    });

    if (!tokenData) throw new OAuthError("Token no encontrado", {
        code: 404,
        name: "TKN_FN"
    });

    const payload = jwt.verify(accessToken, SECRET_KEY);

    return {
        user: payload,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.access_refresh,
        accessTokenExpiresAt: tokenData.access_expires,
        refreshTokenExpiresAt: tokenData.refresh_token,
        token_type: "Bearer"
    }
};

const getRefreshToken = async (refreshToken: string) => {
    const tokenDataRefresh = await prisma.sSO_AUTH_TOKEN_T.findFirst({
        where: { refresh_token: refreshToken },
        include: {
            SSO_AUTH_CLIENTS_T: {
                select: {
                    client_id: true,
                    client_secret: true
                }
            }
        }
    });

    if (!tokenDataRefresh) throw new OAuthError("Refresh_token no valido", {
        code: 404,
        name: "RFS_FN"
    });

    const payload: any = jwt.verify(refreshToken, SECRET_KEY);

    return {
        client: {
            clientId: tokenDataRefresh.client_id?.toString()
        },
        user: {
            id: payload.userId.toString()
        },
        refreshToken: refreshToken,
        accessToken: tokenDataRefresh.access_token.toString()
    }
};

const revokeToken = async (token: any) => {
    const tokenData = await prisma.sSO_AUTH_TOKEN_T.findFirst({
        where: { access_token: token.accessToken }
    });

    if (tokenData) {
        await prisma.sSO_AUTH_TOKEN_T.delete({
            where: { id: tokenData.id }
        });
        return true;
    }
    return false;
};

const getUser = async (username: any, passwordP: any) => {
    const user = await prisma.sSO_AUTH_USERS_T.findUnique({
        where: { email: username },
        include: {
            SSO_AUTH_ACCESS_L: {
                include: {
                    SSO_AUTH_ROLES_T: {
                        select: {
                            rol_code: true,
                            rol_name: true,
                            id: true
                        }
                    }
                }
            },
        }
    });


    if (!user) throw new OAuthError("Usuario no encontrado", {
        code: 404,
        name: "USR_FN"
    });

    if (!await comparePawd(passwordP, user?.password ?? "")) throw new OAuthError("Contraseña incorrecta", {
        code: 403,
        name: "USR_PASS"
    });

    const { password, ...userWithoutPassword } = user;
    const { SSO_AUTH_ACCESS_L, ...AllData } = userWithoutPassword;

    const formattedUser = {
        ...AllData,
        roles: user?.SSO_AUTH_ACCESS_L.map((access) => access.SSO_AUTH_ROLES_T),
    };

    return formattedUser
};

const verifyScope = (token: any, scope: any) => {
    return true; // Simplified for this example
};

/**************************************************************/

const getUserFromClient = (client: any) => {
    return {};
}

const getAuthorizationCode = (gilbertona: any) => {
    return {
        client: {},
        user: {},
        expiresAt: new Date('2025-06-05T20:49:47.853Z')
    }
}

const revokeAuthorizationCode = () => {
    return true
}

export {
    getClient,
    saveToken,
    getAccessToken,
    getRefreshToken,
    revokeToken,
    getUser,
    verifyScope,
    getUserFromClient,
    getAuthorizationCode,
    revokeAuthorizationCode
}