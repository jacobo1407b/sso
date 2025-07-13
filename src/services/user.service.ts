import prisma from "@config/prisma";
import { OAuthError } from "oauth2-server";
import { hashPassword } from "@utils/bcrypt";




class UserService {

    async updateUserLogin(id: string) {
        await prisma.sSO_AUTH_USERS_T.update({
            where: { id: id },
            data: {
                last_login: new Date()
            }
        })
    }
    
    async getUsers(page = 1, pageSize = 20) {
        const count = await prisma.sSO_AUTH_USERS_T.count();
        const data = await prisma.sSO_AUTH_USERS_T.findMany({
            take: pageSize,
            skip: (page - 1) * pageSize,
            select: {
                id: true,
                username: true,
                name: true,
                last_name: true,
                email: true,
                phone: true,
                profile_picture: true,
                status: true,
                last_login: true,
                reset_token: true,
                verified: true,
                bio: true
            }
        });

        return { data, count }
    }

    async getUserOne(id: string) {
        const usr = await prisma.sSO_AUTH_USERS_T.findUnique({
            where: { id: id },
            select: {
                id: true,
                username: true,
                name: true,
                last_name: true,
                email: true,
                phone: true,
                profile_picture: true,
                status: true,
                last_login: true,
                reset_token: true,
                verified: true,
                bio: true
            }
        });
        const empl = await prisma.sSO_AUTH_EMPLOYEE_INFO_T.findFirst({
            where: { user_id: usr?.id },
            select: {
                id: true,
                job_title: true,
                department: true,
                company_name: true,
                location: true
            }
        });
        return {
            ...usr,
            adicional: empl
        }
    }

    async createUser(userData: {
        username: string;
        name: string;
        last_name: string;
        email: string;
        password: string;
    }) {
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
        const responseCreateUser = await prisma.sSO_AUTH_USERS_T.create({
            data: {
                ...userData
            },
        });
        const info = await prisma.sSO_AUTH_EMPLOYEE_INFO_T.create({
            data: {
                user_id: responseCreateUser.id
            }
        });

        const { password, ...allData } = responseCreateUser;

        return {
            ...allData,
            adicional: info
        }
    }
    async getEmployeInfo(id: string) {
        return await prisma.sSO_AUTH_EMPLOYEE_INFO_T.findFirst({
            where: { user_id: id }
        })
    }
    async verifyUser(id: string) {
        const data = await prisma.sSO_AUTH_USERS_T.update({
            where: { id: id },
            data: {
                verified: true
            }
        });
        const bio = await prisma.sSO_AUTH_EMPLOYEE_INFO_T.findFirst({
            where: { user_id: id }
        });
        const { password, ...allData } = data;

        return {
            ...allData,
            adicional: bio
        }
    }

    async updateImageProfile(id: string, urlImage: string) {
        const dataUpdate = await prisma.sSO_AUTH_USERS_T.update({
            where: { id: id },
            data: {
                profile_picture: urlImage
            }
        });
        const info = await prisma.sSO_AUTH_EMPLOYEE_INFO_T.findFirst({
            where: { user_id: id }
        })
        const { password, ...alData } = dataUpdate;
        return {
            ...alData,
            adicional: info
        }
    }
    async inactiveUser(id: string) {
        return await prisma.sSO_AUTH_USERS_T.update({
            where: { id: id },
            data: {
                status: "INACTIVE"
            }
        })
    }

    async updateUser(data: {
        job_title: string,
        department: string,
        company_name: string
    }, id: string) {
        return await prisma.sSO_AUTH_EMPLOYEE_INFO_T.update({
            where: { id: id },
            data: data
        });
    }

    async resetPassword(pass: string, id: string) {
        const hashedPassword = await hashPassword(pass);
        prisma.sSO_AUTH_USERS_T.update({
            where: { id: id },
            data: {
                password: hashedPassword
            }
        });
    }


}

export const usrService = new UserService();
