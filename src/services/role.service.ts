import prisma from "@config/prisma";
import { OAuthError } from "oauth2-server";


class RoleService {
    /** Obtiene todos los roles */
    async getRoles(page = 1, pageSize = 20, rol_code?: string) {
        const where: any = {};
        if (rol_code) where.rol_code = rol_code;
        const count = await prisma.sSO_AUTH_ROLES_T.count();
        const roles = await prisma.sSO_AUTH_ROLES_T.findMany({
            where,
            take: pageSize,
            skip: (page - 1) * pageSize
        });
        return {
            total: count,
            items: roles
        }
    }


    /** Obtiene un rol por ID */
    async getRoleById(roleId: string) {
        const rol = await prisma.sSO_AUTH_ROLES_T.findUnique({
            where: { id: roleId },
            select: {
                SSO_AUTH_ROLE_PERMISSIONS_T: {
                    select: {
                        SSO_AUTH_PERMISSIONS_T: {
                            select: {
                                perm_code: true,
                                perm_name: true,
                                description: true,
                                action: true,
                                IS_SYSTEM: true
                            }
                        }
                    }
                },
                role_name: true,
                role_code: true,
                module: true,
                description: true,
                is_system: true,
                created_date: true,
                created_by: true
            }
        });
        const users = await prisma.sSO_AUTH_ACCESS_T.findMany({
            where: { role_id: roleId },
            select: {
                created_date: true,
                SSO_AUTH_USERS_T: {
                    select: {
                        user_id: true,
                        name: true,
                        email: true,
                        last_name: true,
                        second_last_name: true,
                        profile_picture: true,
                        SSO_USER_BUSINESS_UNIT_T: {
                            select: {
                                job_title: true,
                                department: true
                            }
                        }
                    }
                }
            },
            /*
            include: {

                SSO_AUTH_USERS_T: {
                    select: {
                        user_id: true,
                        name: true,
                        last_name: true,
                        second_last_name: true,
                        profile_picture: true,
                        SSO_USER_BUSINESS_UNIT_T: {
                            select: {
                                job_title: true,
                                department: true
                            }
                        }
                    }
                }
            }*/

        });

        const rolMap = users.map((x) => {
            return {
                name: x.SSO_AUTH_USERS_T.name,
                email: x.SSO_AUTH_USERS_T.email,
                user_id: x.SSO_AUTH_USERS_T.user_id,
                last_name: x.SSO_AUTH_USERS_T.last_name,
                second_last_name: x.SSO_AUTH_USERS_T.second_last_name,
                profile_picture: x.SSO_AUTH_USERS_T.profile_picture,
                department: x.SSO_AUTH_USERS_T.SSO_USER_BUSINESS_UNIT_T?.department,
                job_title: x.SSO_AUTH_USERS_T.SSO_USER_BUSINESS_UNIT_T?.job_title,
                grant_date: x.created_date
            }
        });


        return {
            users: rolMap,
            role_name: rol?.role_name,
            role_code: rol?.role_code,
            description: rol?.description,
            created_by: rol?.created_by,
            created_date: rol?.created_date,
            is_system: rol?.is_system,
            module: rol?.module,
            permissions: rol?.SSO_AUTH_ROLE_PERMISSIONS_T.map((x) => x.SSO_AUTH_PERMISSIONS_T)
        }
    }

    async assigmentRol(rolId: string, users: Array<{ user: string }>, user: string) {
        const mapUsr = users.map((x) => {
            return {
                user_id: x.user,
                role_id: rolId,
                created_by: user
            }
        });

        await prisma.sSO_AUTH_ACCESS_T.createMany({
            data: mapUsr
        });
    }

    async revokeRoles(rolId: string, users: Array<{ user: string }>) {
        const usrs = users.map((x) => x.user);
        await prisma.sSO_AUTH_ACCESS_T.deleteMany({
            where: {
                role_id: rolId,
                user_id: {
                    in: usrs
                }
            }
        });
    }
    //update

    async createRol(data: {
        rol_name: string;
        rol_code: string;
        description: string;
        module: string;
    }, usersList: Array<string>, user: string) {
        const findRol = await prisma.sSO_AUTH_ROLES_T.findFirst({
            where: { role_code: data.rol_code }
        });

        if (findRol !== null) throw new OAuthError(`Ya existe un rol con el codigo ${data.rol_code}`, {
            code: 400,
            name: "ROL_EXIST"
        });

        const rol = await prisma.sSO_AUTH_ROLES_T.create({
            data
        });
        const rolsAssigment = usersList.map((x) => {
            return {
                user_id: x,
                role_id: rol.id,
                created_by: user
            }
        });

        await prisma.sSO_AUTH_ACCESS_T.createMany({
            data: rolsAssigment
        });

        return rol;

    }

    async deleteRol(idRol: string) {
        const rol = await prisma.sSO_AUTH_ROLES_T.findUnique({
            where: { id: idRol }
        });
        if (rol?.is_system) throw new OAuthError('No se puede eliminar un rol de sistema', {
            code: 400,
            name: "ROL_DEL"
        });
        await prisma.sSO_AUTH_ACCESS_T.deleteMany({
            where: { role_id: idRol }
        });
        await prisma.sSO_AUTH_ROLES_T.delete({
            where: { id: idRol }
        });
    }



}

export const roleService = new RoleService();


// 2,071,704 WSH_NEW_DELIVERIES

//12,470,916 WSH_DELIVERY_DETAILS

//12,470,918 WSH_DELIVERY_ASSIGNMENTS