import prisma from "@config/prisma";
import { OAuthError } from "oauth2-server";
import { hashPassword } from "@utils/bcrypt";




class UserService {
    //todos
    

    //administracion
    async getUsers(page = 1, pageSize = 20, name?: string) {
        const where: any = {};
        if (name) {
            where.name = name
        }
        const count = await prisma.sSO_AUTH_USERS_T.count();
        const data = await prisma.sSO_AUTH_USERS_T.findMany({
            take: pageSize,
            skip: (page - 1) * pageSize,
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
                biografia: true
            },
            where
        });

        return { data, count }
    }

    //todos
    async getUserOne(id: string) {
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
                SSO_AUTH_USER_PREFERENCES_T: true,
                SSO_USER_BUSINESS_UNIT_T: {
                    select: {
                        job_title: true,
                        id: true,
                        department: true,
                        hire_date: true,
                        branch_id: true
                    }
                }
            }
        });
        const location = await prisma.sSO_BUSINESS_UNIT_BRANCHES_T.findUnique({
            where: { branch_id: usr?.SSO_USER_BUSINESS_UNIT_T?.branch_id ?? "" },
            select: {
                SSO_BUSINESS_LOCATIONS_T: true
            }
        });


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
            preferences: {
                ...usr?.SSO_AUTH_USER_PREFERENCES_T
            },
            userBusiness: {
                ...usr?.SSO_USER_BUSINESS_UNIT_T
            },
            location: {
                ...location?.SSO_BUSINESS_LOCATIONS_T
            }
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
        department: string
    }, unit: string, branch: string) {
        // Verificar si el email ya está en uso
        const existingUser = await prisma.sSO_AUTH_USERS_T.findUnique({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new OAuthError("El email ya está registrado.", {
                code: 409,
                name: "USR_EMEXT"
            });
        }
        const result = await prisma.$transaction(async (tx) => {
            const preferences = await tx.sSO_AUTH_USER_PREFERENCES_T.create({
                data: {
                    theme: "dark",
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
                    username: userData.email,
                    name: userData.name,
                    last_name: userData.last_name,
                    password: userData.password,
                    second_last_name: userData.second_last_name,
                    status: "ACTIVE",
                    id_user_preference: preferences.id,
                    id_user_bu: userBusiness.id
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

        const location = await prisma.sSO_BUSINESS_UNIT_BRANCHES_T.findFirst({
            where: { branch_id: branch },
            select: {
                SSO_BUSINESS_LOCATIONS_T: true
            }
        })

        return {
            ...result,
            location: location?.SSO_BUSINESS_LOCATIONS_T
        }
    }

    async updateImageProfile(id: string, urlImage: string) {
        await prisma.sSO_AUTH_USERS_T.update({
            where: { user_id: id },
            data: {
                profile_picture: urlImage
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
        await prisma.sSO_USER_BUSINESS_UNIT_T.update({
            where: { id: usrUpt?.id_user_bu ?? "" },
            data: {
                department: data.department,
                job_title: data.job_title
            }
        });

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


}

export const usrService = new UserService();
