import prisma from "@config/prisma";
import { OAuthError } from "oauth2-server";

type GrantSer = {
    grant_name: string
}
class ClientService {

    async getClientById(id: string) {
        return await prisma.sSO_AUTH_CLIENTS_T.findUnique({
            where: { client_id: id },
            include: {
                SSO_AUTH_GRANTS_T: true
            }
        })
    }
    async createClient(appName: string, grantsType: Array<GrantSer>) {
        const cliendValid = await prisma.sSO_AUTH_CLIENTS_T.findFirst({
            where: { app_name: appName }
        });

        if (cliendValid !== null) throw new OAuthError(`Ya existe un APP_NAME con el nombre ${appName}`, {
            code: 409,
            name: 'CLT_EX'
        });

        const client = await prisma.sSO_AUTH_CLIENTS_T.create({
            data: {
                app_name: appName
            }
        });

        await prisma.sSO_AUTH_GRANTS_T.createMany({
            data: grantsType.map((gr) => {
                return {
                    ...gr,
                    client_id: client.client_id
                }
            })
        });

        const getAllGrants = await prisma.sSO_AUTH_GRANTS_T.findMany({
            where: { client_id: client.client_id },
            select: {
                id: true,
                grant_name: true,
                created_date: true,
            }
        });
        return {
            ...client,
            grants: getAllGrants
        }
    }

    async getClients(page = 1, pageSize = 20) {
        const totalCount = await prisma.sSO_AUTH_CLIENTS_T.count();
        const data = await prisma.sSO_AUTH_CLIENTS_T.findMany({
            take: pageSize,
            skip: (page - 1) * pageSize,
            include: {
                SSO_AUTH_GRANTS_T: true
            }
        });
        return { data, totalCount }
    }

    async setGrants(client: string, grantsType: Array<GrantSer>) {
        await prisma.sSO_AUTH_GRANTS_T.createMany({
            data: grantsType.map((x) => {
                return {
                    ...x,
                    client_id: client
                }
            })
        });
        return await prisma.sSO_AUTH_CLIENTS_T.findUnique({
            where: { client_id: client },
            include: {
                SSO_AUTH_GRANTS_T: true
            }
        });
    }

    async revokeGrants(id: string, grants: Array<string>) {
        await prisma.sSO_AUTH_GRANTS_T.deleteMany({
            where: {
                id: {
                    in: grants
                }
            }
        });
        return await this.getClientById(id);
    }

    async deleteClient(id: string) {
        await prisma.sSO_AUTH_GRANTS_T.deleteMany({
            where: { client_id: id }
        });
        await prisma.sSO_AUTH_TOKEN_T.deleteMany({
            where: { client_id: id }
        })
        await prisma.sSO_AUTH_CLIENTS_T.delete({
            where: { client_id: id }
        })
    }
}

export const clientService = new ClientService();