import prisma from "@config/prisma";
import { OAuthError } from "oauth2-server";

class ClientService {

    async getClientById(id: string) {

        const cl = await prisma.sSO_AUTH_CLIENTS_T.findUnique({
            where: { client_id: id },
            include: {
                SSO_AUTH_CLIENT_GRANTS_T: {
                    select: {
                        created_date: true,
                        SSO_AUTH_GRANTS_T: true
                    }
                }
            }
        });

        const grants = cl?.SSO_AUTH_CLIENT_GRANTS_T.map((x) => {
            return {
                created_date: x.created_date,
                ...x.SSO_AUTH_GRANTS_T
            }
        });

        return {
            client_secret: cl?.client_secret,
            client_id: cl?.client_id,
            app_name: cl?.app_name,
            description: cl?.description,
            redirect_callback: cl?.redirect_callback,
            scopes: cl?.scopes,
            is_active: cl?.is_active,
            app_type: cl?.app_type,
            client_icon_url: cl?.client_icon_url,
            created_by: cl?.created_by,
            last_update_date: cl?.last_update_date,
            grants: grants
        }
    }

    async createClient(appName: string, grantsType: Array<string>, data: {
        description: string;
        redirect_callback: string;
        scopes: string;
        app_type: string;
    }, userID: string) {
        const cliendValid = await prisma.sSO_AUTH_CLIENTS_T.findFirst({
            where: { app_name: appName }
        });

        if (cliendValid !== null) throw new OAuthError(`Ya existe un APP_NAME con el nombre ${appName}`, {
            code: 409,
            name: 'CLT_EX'
        });

        const client = await prisma.sSO_AUTH_CLIENTS_T.create({
            data: {
                ...data,
                created_by: userID,
                app_name: appName,
                client_id: "1",
                is_active: false
            }
        });

        const grGrants = grantsType.map((x) => {
            return {
                client_id: client.client_id,
                grant_id: x
            }
        });

        await prisma.sSO_AUTH_CLIENT_GRANTS_T.createMany({
            data: grGrants
        });

        return await this.getClientById(client.client_id);


    }

    async getClients(page = 1, pageSize = 20, filters?: { app_name?: string; app_type?: string }) {
        const totalCount = await prisma.sSO_AUTH_CLIENTS_T.count();

        const where: any = {};

        if (filters?.app_name) {
            where.app_name = { contains: filters.app_name, mode: "insensitive" };
        }
        if (filters?.app_type) {
            where.app_type = filters.app_type;
        }

        const data = await prisma.sSO_AUTH_CLIENTS_T.findMany({
            where,
            take: pageSize,
            skip: (page - 1) * pageSize,
            select: {
                client_secret: true,
                client_id: true,
                app_name: true,
                description: true,
                redirect_callback: true,
                scopes: true,
                is_active: true,
                app_type: true,
                client_icon_url: true,
                created_by: true,
                last_update_date: true,
                SSO_AUTH_CLIENT_GRANTS_T: {
                    select: {
                        SSO_AUTH_GRANTS_T: {
                            select: {
                                id: true,
                                icon_text: true,
                                grant_code: true,
                                grants_name: true
                            }
                        }
                    }
                },
                created_date: true
            }
        });
        const mpClient = data.map((c) => {
            const grants = c.SSO_AUTH_CLIENT_GRANTS_T.map((g) => g.SSO_AUTH_GRANTS_T);
            return {
                client_secret: c.client_secret,
                client_id: c.client_id,
                app_name: c.app_name,
                description: c.description,
                redirect_callback: c.redirect_callback,
                scopes: c.scopes,
                is_active: c.is_active,
                app_type: c.app_type,
                client_icon_url: c.client_icon_url,
                created_by: c.created_by,
                last_update_date: c.last_update_date,
                grants: grants,
                created_date: c.created_date
            }
        })
        return { data: mpClient, totalCount }
    }

    async setGrants(client: string, grantsType: Array<{ grant: string }>) {

        const grants = grantsType.map((x) => {
            return {
                client_id: client,
                grant_id: x.grant
            }
        });
        await prisma.sSO_AUTH_CLIENT_GRANTS_T.createMany({
            data: grants
        });
    }

    async revokeGrants(id: string, grants: Array<{ grant: string }>) {
        const mp = grants.map((x) => x.grant);
        await prisma.sSO_AUTH_CLIENT_GRANTS_T.deleteMany({
            where: {
                client_id: id,
                grant_id: { in: mp }
            }
        })
    }

    async deleteClient(id: string) {
        const verify = await prisma.sSO_AUTH_CLIENTS_T.findUnique({
            where: { client_id: id }
        });
        
        if (verify?.app_name === "SSO") throw new OAuthError(`No se puede eliminar esta aplicación`, {
            code: 409,
            name: 'DNT_DELET_SSO'
        });
        await prisma.sSO_AUTH_CLIENT_GRANTS_T.deleteMany({
            where: { client_id: id }
        });
        await prisma.sSO_AUTH_TOKEN_T.deleteMany({
            where: { client_id: id }
        });
        await prisma.sSO_AUTH_AUTHORIZATION_CODES_T.deleteMany({
            where: { client_id: id }
        })
        const re = await prisma.sSO_AUTH_CLIENTS_T.delete({
            where: { client_id: id }
        });
    }

    async updateClient(id: string, data: { description?: string; redirect_callback?: string; scopes?: string; }) {
        const updateData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== undefined && v !== null)
        );
        await prisma.sSO_AUTH_CLIENTS_T.update({
            where: { client_id: id },
            data: {
                ...updateData,
                last_update_date: new Date()
            }
        });
        return await this.getClientById(id);
    }

    async getGrants() {
        return await prisma.sSO_AUTH_GRANTS_T.findMany();
    }

    async UpdateImageClient(id: string, urlImage: string) {
        await prisma.sSO_AUTH_CLIENTS_T.update({
            where: { client_id: id },
            data: {
                client_icon_url: urlImage,
                last_update_date: new Date()
            }
        })
    }
}

export const clientService = new ClientService();