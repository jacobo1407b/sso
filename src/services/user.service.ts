import prisma from "@config/prisma";
import { Prisma } from '@prisma/client';
import { OAuthError } from "oauth2-server";
import { hashPassword } from "@utils/bcrypt";




class UserService {
    //todos

    //administracion
    async getUsers(page = 1, pageSize = 20, name?: string) {
        const whereClause = name
            ? {
                name: {
                    contains: name,
                    mode: Prisma.QueryMode.insensitive
                }
            }
            : undefined;

        const count = await prisma.sSO_AUTH_USERS_T.count();
        const data = await prisma.sSO_AUTH_USERS_T.findMany({
            take: pageSize,
            skip: (page - 1) * pageSize,
            where: whereClause,
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
                SSO_USER_BUSINESS_UNIT_T: true,
                last_update_avatar: true
            }
        });
        const tempData = data.map((x) => {
            const { SSO_USER_BUSINESS_UNIT_T, ...all } = x;
            return {
                ...all,
                userBusiness: SSO_USER_BUSINESS_UNIT_T,
                last_update_avatar: x.last_update_avatar ? new Date(x.last_update_avatar).getTime() : null
            }
        })
        return { data: tempData, count }
    }

    //todos
    async getUserOne(id: string) {
        let location = null;
        const usr = await prisma.sSO_AUTH_USERS_T.findUnique({
            where: { user_id: id },
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
                SSO_AUTH_USER_2FA: {
                    select: {
                        id: true
                    }
                },
                SSO_AUTH_TOKEN_T: {
                    select: {
                        token_id: true
                    }
                }
            }
        });
        if (usr?.SSO_USER_BUSINESS_UNIT_T?.branch_id) {
            location = await prisma.sSO_BUSINESS_UNIT_BRANCHES_T.findUnique({
                where: { branch_id: usr?.SSO_USER_BUSINESS_UNIT_T?.branch_id ?? "" },
                select: {
                    SSO_BUSINESS_LOCATIONS_T: true
                }
            });
        }



        return {
            user_id: usr?.user_id,
            username: usr?.username,
            name: usr?.name,
            last_name: usr?.last_name,
            second_last_name: usr?.second_last_name,
            email: usr?.email,
            phone: usr?.phone,
            profile_picture: usr?.profile_picture,
            status: usr?.status,
            last_login: usr?.last_login,
            biografia: usr?.biografia,
            last_update_avatar: usr?.last_update_avatar ? new Date(usr.last_update_avatar) : null,
            preferences: {
                ...usr?.SSO_AUTH_USER_PREFERENCES_T
            },
            userBusiness: {
                ...usr?.SSO_USER_BUSINESS_UNIT_T
            },
            location: {
                ...location?.SSO_BUSINESS_LOCATIONS_T
            },
            mfa_enable: usr?.SSO_AUTH_USER_2FA ? true : false,
            sessions: usr?.SSO_AUTH_TOKEN_T.length ?? 0
        }
    }

    //administracion
    async createUser(userData: {
        username: string;
        name: string;
        last_name: string;
        email: string;
        password: string;
        second_last_name: string;
        hire_date: string;
        job_title: string,
        department: string;
        phone: string;
    }, unit: string | null, branch: string | null, currentUser?: string) {
        // Verificar si el email ya está en uso
        const existingUser = await prisma.sSO_AUTH_USERS_T.findUnique({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new OAuthError("El email ya está registrado.", {
                code: 409,
                name: "EMAIL_ALREADY",
                details: "USER"
            });
        }
        const rolUser = await prisma.sSO_AUTH_ROLES_T.findFirst({
            where: { role_code: 'END_USER' }
        })
        const result = await prisma.$transaction(async (tx) => {
            const preferences = await tx.sSO_AUTH_USER_PREFERENCES_T.create({
                data: {
                    theme: "light",
                    notifications: false,
                    timezone: "America/Mexico_City",
                    lang: "es"
                }
            });

            const userBusiness = await tx.sSO_USER_BUSINESS_UNIT_T.create({
                data: {
                    unit_id: unit,
                    branch_id: branch,
                    job_title: userData.job_title,
                    department: userData.department,
                    hire_date: userData.hire_date
                }
            });
            const user = await tx.sSO_AUTH_USERS_T.create({
                data: {
                    username: userData.username,
                    email: userData.email,
                    name: userData.name,
                    last_name: userData.last_name,
                    password: userData.password,
                    second_last_name: userData.second_last_name,
                    status: "ACTIVE",
                    id_user_preference: preferences.id,
                    id_user_bu: userBusiness.id,
                    phone: userData.phone
                }
            });

            return {
                user_id: user?.user_id,
                username: user?.username,
                name: user?.name,
                last_name: user?.last_name,
                second_last_name: user?.second_last_name,
                email: user?.email,
                phone: user?.phone,
                profile_picture: user?.profile_picture,
                status: user?.status,
                last_login: user?.last_login,
                biografia: user?.biografia,
                preferences,
                userBusiness
            }
        });
        await prisma.sSO_AUTH_ACCESS_T.create({
            data: {
                role_id: rolUser?.id ?? "",
                user_id: result.user_id,
                created_by: currentUser
            }
        })
        let location = null;
        if (branch) {
            location = await prisma.sSO_BUSINESS_UNIT_BRANCHES_T.findFirst({
                where: { branch_id: branch },
                select: {
                    SSO_BUSINESS_LOCATIONS_T: true
                }
            })
        }


        return {
            ...result,
            location: location?.SSO_BUSINESS_LOCATIONS_T
        }
    }

    async updateImageProfile(id: string, urlImage: string) {
        await prisma.sSO_AUTH_USERS_T.update({
            where: { user_id: id },
            data: {
                profile_picture: urlImage,
                last_update_avatar: new Date()
            }
        });

        const data = await this.getUserOne(id);
        return data;

    }
    //administracion
    async inactiveUser(id: string) {
        return await prisma.sSO_AUTH_USERS_T.update({
            where: { user_id: id },
            data: {
                status: "INACTIVE"
            }
        })
    }
    //todos
    async updateUser(data: {
        name: string;
        last_name: string;
        second_last_name: string;
        phone: string;
        job_title: string;
        department: string;
        biografia: string
    }, id: string) {

        const usrUpt = await prisma.sSO_AUTH_USERS_T.update({
            where: { user_id: id },
            data: {
                name: data.name,
                last_name: data.last_name,
                second_last_name: data.second_last_name,
                phone: data.phone,
                biografia: data.biografia,
            }
        });
        if (usrUpt.id_user_bu) {
            await prisma.sSO_USER_BUSINESS_UNIT_T.update({
                where: { id: usrUpt?.id_user_bu ?? "" },
                data: {
                    department: data.department,
                    job_title: data.job_title
                }
            });
        }

        return await this.getUserOne(id);
    }

    //administracion, users
    async resetPassword(pass: string, id: string, last_pass: string) {
        const hashedPassword = await hashPassword(pass);
        await prisma.sSO_AUTH_USERS_T.update({
            where: { user_id: id },
            data: {
                password: hashedPassword,
                last_password_change: last_pass
            }
        });
    }

    //administracion
    async changeLocation(id: string, org: string, user: string, unit: string) {
        await prisma.sSO_USER_BUSINESS_UNIT_T.update({
            where: { id: id },
            data: {
                branch_id: org,
                unit_id: unit
            }
        });
        return await this.getUserOne(user);
    }

    async setPreferences(id: string, data: {
        theme: string,
        lang: string,
        timezone: string,
        notifications: boolean
    }) {
        await prisma.sSO_AUTH_USER_PREFERENCES_T.update({
            where: { id: id },
            data
        })
    }

    async userdetails(id: string, session: string) {
        const userDetails = await prisma.sSO_AUTH_USERS_T.findUnique({
            where: { user_id: id },
            select: {
                username: true,
                SSO_AUTH_USER_2FA: {
                    select: {
                        id: true,
                        failed_attempts: true,
                        expires_date: true,
                        last_attempt_date: true,
                        verified_status: true
                    }
                },
                last_login: true,
                SSO_AUTH_TOKEN_T: {
                    select: {
                        agent: true,
                        ip_address: true,
                        created_date: true,
                        token_id: true
                    }
                },
                SSO_AUTH_USER_PREFERENCES_T: true
            }
        });
        const sessions = userDetails?.SSO_AUTH_TOKEN_T.map((x) => {
            const current = x.token_id === session;
            return {
                ...x,
                current
            }
        })
        return {
            username: userDetails?.username,
            totp: userDetails?.SSO_AUTH_USER_2FA ? {
                id: userDetails?.SSO_AUTH_USER_2FA?.id,
                failed_attempts: userDetails?.SSO_AUTH_USER_2FA?.failed_attempts,
                expires_date: userDetails?.SSO_AUTH_USER_2FA?.expires_date,
                last_attempt_date: userDetails?.SSO_AUTH_USER_2FA?.last_attempt_date,
                verified_status: userDetails?.SSO_AUTH_USER_2FA?.verified_status
            } : null,
            sesions: sessions,
            preferences: userDetails?.SSO_AUTH_USER_PREFERENCES_T ?? null
        }
    }

    async revokSesion(id: string, sso: boolean) {
        if (sso) {
            const tok = await prisma.sSO_AUTH_TOKEN_T.findFirst({
                where: { token_id: id },
                select: {
                    SSO_AUTH_USERS_T: {
                        select: {
                            id_user_2fa: true
                        }
                    }
                }
            });
            if (tok?.SSO_AUTH_USERS_T?.id_user_2fa) await prisma.sSO_AUTH_USER_2FA.update({
                where: { id: tok.SSO_AUTH_USERS_T.id_user_2fa },
                data: {
                    log_in_status: null
                }
            })

        }

        await prisma.sSO_AUTH_TOKEN_T.delete({
            where: { token_id: id }
        });
    }
    async getFederateData(userId: string, clientId: string) {
        const userData = await prisma.sSO_AUTH_USERS_T.findUnique({
            where: { user_id: userId },
            select: {
                profile_picture: true,
                email: true,
                name: true
            }
        });
        const clientData = await prisma.sSO_AUTH_CLIENTS_T.findUnique({
            where: { client_id: clientId },
            select: {
                app_name: true,
                description: true,
                client_icon_url: true,
                redirect_callback: true
            }
        });
        return {
            ...userData,
            ...clientData
        }
    }


}

export const usrService = new UserService();
