import prisma from "@config/prisma";
import { OAuthError } from "oauth2-server";

class RoleService {
    /** Obtiene todos los roles */
    async getRoles(page = 1, pageSize = 20) {
        return await prisma.sSO_AUTH_ROLES_T.findMany({
            take: pageSize,
            skip: (page - 1) * pageSize
        });
    }


    /** Obtiene un rol por ID */
    async getRoleById(roleId: string) {
        return await prisma.sSO_AUTH_ROLES_T.findUnique({
            where: { id: roleId },
            include: {
                SSO_AUTH_ACCESS_L: {
                    where: { role_id: roleId },
                    include: { SSO_AUTH_USERS_T: true }
                }
            }
        });
    }

    async assigmentRol(user: string, rols: Array<string>, id: string) {
        const dto = rols.map((rl) => {
            return {
                user_id: id,
                role_id: rl,
                created_by: user,
                last_update_by: user
            }
        });
        await prisma.sSO_AUTH_ACCESS_L.createMany({
            data: dto
        });
    }

    async revokeRoles(user: string, rols: Array<string>) {
        await prisma.sSO_AUTH_ACCESS_L.deleteMany({
            where: {
                user_id: user,
                role_id: { in: rols }
            }
        });
    }

}

export const roleService = new RoleService();


// 2,071,704 WSH_NEW_DELIVERIES

//12,470,916 WSH_DELIVERY_DETAILS

//12,470,918 WSH_DELIVERY_ASSIGNMENTS