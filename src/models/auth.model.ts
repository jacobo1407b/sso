import jwt from "jsonwebtoken";
import prisma from "@config/prisma";
import { comparePawd } from "@utils/bcrypt"
import { OAuthError } from "oauth2-server";

const SECRET_KEY = process.env.SECRET_KEY || 'tu_clave_secreta';


const getClient = async (clientId: string, clientSecret: string) => {
    const result = await prisma.sSO_AUTH_CLIENTS_T.findFirst({
        /*where: {
            AND: [
                { client_id: clientId },
                { client_secret: clientSecret }
            ]
        },*/
        where: { client_id: clientId },
        include: {
            SSO_AUTH_CLIENT_GRANTS_T: {
                select: {
                    created_date: true,
                    SSO_AUTH_GRANTS_T: {
                        select: {
                            grant_code: true
                        }
                    }
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
        app_icon: result.client_icon_url,
        app_type: result.app_type,
        redirectUris: [result.redirect_callback],
        grants: result.SSO_AUTH_CLIENT_GRANTS_T.map((x) => x.SSO_AUTH_GRANTS_T.grant_code)
    }
};

const saveToken = async (token: any, client: any, user: any) => {
    let refreshToken: string = '';
    let accessToken: string = '';
    const expiresInOneMinute = Date.now() + 30 * 60 * 1000;
    if (user.user_id) {
        if (user.totp && user.log_status === "WAIT") throw new OAuthError("MFA en proceso", {
            code: 404,
            name: "MFA_WAIT"
        });
        if (user.totp && user.log_status === null) {
            accessToken = jwt.sign(
                {
                    userId: user?.user_id,
                    clientId: client.clientId,
                    totp_id: user.totp_id,
                    log_in_status: "WAIT",
                    email: user.email,
                    profile_picture: user.profile_picture
                },
                SECRET_KEY,
                //{ expiresIn: Math.floor((token.accessTokenExpiresAt.getTime() - Date.now()) / 1000) }
                { expiresIn: expiresInOneMinute }
            );
            await prisma.sSO_AUTH_USER_2FA.update({
                where: { id: user.totp_id },
                data: {
                    log_in_status:"WAIT"
                }
            });

        } else {
            accessToken = jwt.sign(
                {
                    userId: user?.user_id,
                    clientId: client.clientId,
                    scope: token.scope,
                    username: user.email,
                    rols: user.roles,
                    log_status: "SUCCESS",
                    email: user.email,
                    profile_picture: user.profile_picture
                },
                SECRET_KEY,
                //{ expiresIn: Math.floor((token.accessTokenExpiresAt.getTime() - Date.now()) / 1000) }
                { expiresIn: expiresInOneMinute }
            );
        }
    } else {
        accessToken = jwt.sign(
            {
                clientId: client.clientId,
                scope: token.scope,
                app: client.app,
                app_type: client.app_type,
                callback_url: client.callback_url,
                grants: client.grants
            },
            SECRET_KEY,
            { expiresIn: expiresInOneMinute }
            //{ expiresIn: Math.floor((token.accessTokenExpiresAt.getTime() - Date.now()) / 1000) }
        );
    }

    if (token.refreshTokenExpiresAt) {
        refreshToken = jwt.sign(
            { userId: user?.user_id, clientId: client.clientId, totp_id: user.totp_id },
            SECRET_KEY,
            { expiresIn: Math.floor((token.refreshTokenExpiresAt.getTime() - Date.now()) / 1000) }
        );
    }

    const tk = await prisma.sSO_AUTH_TOKEN_T.create({
        data: {
            client_id: client.clientId,
            user_id: user?.user_id?.toString() ?? null,
            access_token: accessToken,
            refresh_token: refreshToken,
            access_expires: new Date(expiresInOneMinute),
            //access_expires: token.accessTokenExpiresAt,
            refresh_expires: token.refreshTokenExpiresAt
        }
    });
    if (refreshToken) token.refreshToken = refreshToken;
    token.accessTokenExpiresAt = new Date(expiresInOneMinute);
    token.accessToken = accessToken;
    token.client = client;
    token.user = user;
    token.token_id = tk.token_id
    return token
};

const getAccessToken = async (accessToken: string) => {
    const tokenData = await prisma.sSO_AUTH_TOKEN_T.findFirst({
        where: { access_token: accessToken }
    });

    if (!tokenData) throw new OAuthError("Token no valido", {
        code: 404,
        name: "TKN_FN"
    });

    const payload = jwt.verify(accessToken, SECRET_KEY);
    return {
        user: payload,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        accessTokenExpiresAt: tokenData.access_expires,
        refreshTokenExpiresAt: tokenData.refresh_expires,
        token_type: "Bearer",
        token_id: tokenData.token_id
    }
};

const getRefreshToken = async (refreshToken: string) => {

    const tokenDataRefresh = await prisma.sSO_AUTH_TOKEN_T.findFirst({
        where: { refresh_token: refreshToken },
    });
    if (!tokenDataRefresh) throw new OAuthError("Refresh_token no valido", {
        code: 404,
        name: "RFS_FN"
    });
    const clientPrisma = await prisma.sSO_AUTH_CLIENTS_T.findFirst({
        where: { client_id: tokenDataRefresh?.client_id ?? "" },
        select: {
            client_id: true,
            app_name: true,
            client_secret: true,
            client_icon_url: true,
            app_type: true,
            redirect_callback: true,
            SSO_AUTH_CLIENT_GRANTS_T: {
                select: {
                    SSO_AUTH_GRANTS_T: {
                        select: {
                            grant_code: true
                        }
                    }
                }
            }
        }
    });
    const payload: any = jwt.verify(refreshToken, SECRET_KEY);

    const userData = await prisma.sSO_AUTH_USERS_T.findFirst({
        where: { user_id: payload.userId },
        select: {
            user_id: true,
            username: true,
            name: true,
            last_name: true,
            second_last_name: true,
            email: true,
            phone: true,
            profile_picture: true,
            status: true,
            last_login: true,
            biografia: true,
            last_update_avatar: true,
            SSO_AUTH_USER_PREFERENCES_T: true,
            SSO_USER_BUSINESS_UNIT_T: {
                select: {
                    job_title: true,
                    id: true,
                    department: true,
                    hire_date: true,
                    branch_id: true
                }
            },
            SSO_AUTH_ACCESS_T: {
                select: {
                    SSO_AUTH_ROLES_T: {
                        select: {
                            role_code: true,
                            module: true,
                            SSO_AUTH_ROLE_PERMISSIONS_T: {
                                select: {
                                    SSO_AUTH_PERMISSIONS_T: {
                                        select: {
                                            perm_code: true,
                                            action: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            SSO_AUTH_USER_2FA: {
                select: {
                    id: true,
                    log_in_status: true
                }
            }
        }
    });
    if (userData?.SSO_AUTH_USER_2FA?.id !== null && userData?.SSO_AUTH_USER_2FA?.log_in_status === "WAIT") throw new OAuthError("MFA en proceso", {
        code: 404,
        name: "MFA_WAIT"
    });

    const { SSO_AUTH_USER_PREFERENCES_T, SSO_USER_BUSINESS_UNIT_T, SSO_AUTH_ACCESS_T, ...userWithoutPassword } = userData ?? {};


    return {
        client: {
            clientId: clientPrisma?.client_id,
            app: clientPrisma?.app_name,
            clientSecret: clientPrisma?.client_secret,
            app_icon: clientPrisma?.client_icon_url,
            app_type: clientPrisma?.app_type,
            redirectUri: clientPrisma?.redirect_callback,
            grants: clientPrisma?.SSO_AUTH_CLIENT_GRANTS_T.map((x) => x.SSO_AUTH_GRANTS_T.grant_code)
        },
        user: {
            ...userWithoutPassword,
            preferences: SSO_AUTH_USER_PREFERENCES_T,
            userBusiness: SSO_USER_BUSINESS_UNIT_T,
            roles: SSO_AUTH_ACCESS_T?.map((x) => {
                const perm = x.SSO_AUTH_ROLES_T.SSO_AUTH_ROLE_PERMISSIONS_T.map((p) => `${p.SSO_AUTH_PERMISSIONS_T.perm_code}:${p.SSO_AUTH_PERMISSIONS_T.action}`)
                return {
                    role_code: x.SSO_AUTH_ROLES_T.role_code,
                    module: x.SSO_AUTH_ROLES_T.module,
                    policy_permission: perm
                }
            }),
            totp: userData?.SSO_AUTH_USER_2FA?.id ? true : false,
            log_status: userData?.SSO_AUTH_USER_2FA?.log_in_status ?? null,
            totp_id: userData?.SSO_AUTH_USER_2FA?.id ?? ""
        },
        refreshToken: refreshToken,
        accessToken: tokenDataRefresh?.access_token?.toString(),
        token_id: tokenDataRefresh.token_id
    }
};

const revokeToken = async (token: any) => {
    const tokenData = await prisma.sSO_AUTH_TOKEN_T.findFirst({
        where: { access_token: token.accessToken }
    });

    if (tokenData) {
        await prisma.sSO_AUTH_TOKEN_T.delete({
            where: { token_id: tokenData.token_id }
        });
        return true;
    }
    return false;
};

const getUser = async (username: any, passwordP: any) => {
    //var logged_status = null;
    const user = await prisma.sSO_AUTH_USERS_T.findUnique({
        where: { email: username },
        select: {
            user_id: true,
            username: true,
            name: true,
            last_name: true,
            second_last_name: true,
            email: true,
            phone: true,
            profile_picture: true,
            status: true,
            last_login: true,
            biografia: true,
            password: true,
            SSO_AUTH_USER_PREFERENCES_T: true,
            SSO_USER_BUSINESS_UNIT_T: {
                select: {
                    job_title: true,
                    id: true,
                    department: true,
                    hire_date: true,
                    branch_id: true
                }
            },
            SSO_AUTH_ACCESS_T: {
                select: {
                    SSO_AUTH_ROLES_T: {
                        select: {
                            role_code: true,
                            module: true,
                            SSO_AUTH_ROLE_PERMISSIONS_T: {
                                select: {
                                    SSO_AUTH_PERMISSIONS_T: {
                                        select: {
                                            perm_code: true,
                                            action: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            SSO_AUTH_USER_2FA: {
                select: {
                    id: true,
                    log_in_status: true
                }
            }
        }
    });
    //logged_status = user?.SSO_AUTH_USER_2FA?.log_in_status;
    if (!user) throw new OAuthError("Usuario no encontrado", {
        code: 404,
        name: "USR_FN"
    });

    if (!await comparePawd(passwordP, user?.password ?? "")) throw new OAuthError("Contraseña incorrecta", {
        code: 403,
        name: "USR_PASS"
    });
    /*if (user.SSO_AUTH_USER_2FA?.id && user.SSO_AUTH_USER_2FA.log_in_status === "SUCCESS") {
        logged_status = null;
        await prisma.sSO_AUTH_USER_2FA.update({
            where: { id: user.SSO_AUTH_USER_2FA.id },
            data: {
                log_in_status: null
            }
        })
    }*/
    const { SSO_AUTH_USER_2FA, SSO_AUTH_USER_PREFERENCES_T, SSO_USER_BUSINESS_UNIT_T, SSO_AUTH_ACCESS_T, password, ...userWithoutPassword } = user;


    const formattedUser = {
        ...userWithoutPassword,
        preferences: SSO_AUTH_USER_PREFERENCES_T,
        userBusiness: SSO_USER_BUSINESS_UNIT_T,
        roles: SSO_AUTH_ACCESS_T.map((x) => {
            const perm = x.SSO_AUTH_ROLES_T.SSO_AUTH_ROLE_PERMISSIONS_T.map((p) => `${p.SSO_AUTH_PERMISSIONS_T.perm_code}:${p.SSO_AUTH_PERMISSIONS_T.action}`)
            return {
                role_code: x.SSO_AUTH_ROLES_T.role_code,
                module: x.SSO_AUTH_ROLES_T.module,
                policy_permission: perm
            }
        }),
        totp: user.SSO_AUTH_USER_2FA?.id ? true : false,
        log_status: user.SSO_AUTH_USER_2FA?.log_in_status ?? null,
        totp_id: user.SSO_AUTH_USER_2FA?.id ?? ""
    };

    return formattedUser
};

const verifyScope = (token: any, scope: any) => {
    //console.log("model");
    //console.log(token);
    //console.log(scope)
    return true; // Simplified for this example
};

/**************************************************************/

const getUserFromClient = (client: any) => {
    return {};
}
const saveAuthorizationCode = async (code: any, client: any, user: any) => {
    await prisma.sSO_AUTH_AUTHORIZATION_CODES_T.create({
        data: {
            user_id: user.userId,
            client_id: client.clientId,
            authorization_code: code.authorizationCode,
            expires_at: code.expiresAt
        }
    });
    return {
        authorizationCode: code.authorizationCode,
        expiresAt: code.expiresAt,
        redirectUri: code.redirectUri,
        scope: "",
        client: { id: client.clientId },
        user: { id: user.userId }
    };
}
const getAuthorizationCode = async (code: any) => {
    const codeDb = await prisma.sSO_AUTH_AUTHORIZATION_CODES_T.findFirst({
        where: { authorization_code: code },
        select: {
            expires_at: true,
            SSO_AUTH_CLIENTS_T: {
                select: {
                    client_id: true,
                    redirect_callback: true
                }
            },
            SSO_AUTH_USERS_T: {
                select: {
                    user_id: true,
                    username: true,
                    name: true,
                    last_name: true,
                    second_last_name: true,
                    email: true,
                    phone: true,
                    profile_picture: true,
                    status: true,
                    last_login: true,
                    biografia: true,
                    SSO_AUTH_USER_PREFERENCES_T: true,
                    SSO_USER_BUSINESS_UNIT_T: {
                        select: {
                            job_title: true,
                            id: true,
                            department: true,
                            hire_date: true,
                            branch_id: true
                        }
                    },
                    SSO_AUTH_ACCESS_T: {
                        select: {
                            SSO_AUTH_ROLES_T: {
                                select: {
                                    role_code: true,
                                    module: true,
                                    SSO_AUTH_ROLE_PERMISSIONS_T: {
                                        select: {
                                            SSO_AUTH_PERMISSIONS_T: {
                                                select: {
                                                    perm_code: true,
                                                    action: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    if (!codeDb) throw new OAuthError("No se encontro un code", {
        code: 404,
        name: "CODE_FN"
    });

    const { SSO_AUTH_USER_PREFERENCES_T, SSO_USER_BUSINESS_UNIT_T, SSO_AUTH_ACCESS_T, ...userAll } = codeDb?.SSO_AUTH_USERS_T ?? {};
    return {
        client: codeDb?.SSO_AUTH_CLIENTS_T,
        user: {
            ...userAll,
            preferences: SSO_AUTH_USER_PREFERENCES_T,
            userBusiness: SSO_USER_BUSINESS_UNIT_T,
            roles: SSO_AUTH_ACCESS_T?.map((x) => {
                const perm = x.SSO_AUTH_ROLES_T.SSO_AUTH_ROLE_PERMISSIONS_T.map((p) => `${p.SSO_AUTH_PERMISSIONS_T.perm_code}:${p.SSO_AUTH_PERMISSIONS_T.action}`)
                return {
                    role_code: x.SSO_AUTH_ROLES_T.role_code,
                    module: x.SSO_AUTH_ROLES_T.module,
                    policy_permission: perm
                }
            })
        },
        expiresAt: codeDb?.expires_at,
        code: code
    }
}

const revokeAuthorizationCode = async (code: any) => {
    await prisma.sSO_AUTH_AUTHORIZATION_CODES_T.delete({
        where: { authorization_code: code.code }
    });
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
    revokeAuthorizationCode,
    saveAuthorizationCode
}