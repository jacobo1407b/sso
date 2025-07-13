import { Request, Response } from "express";
import { clientService } from "@services/client.service";
import { OAuthError } from "oauth2-server";

//GET
export const getClientByIdController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const data = await clientService.getClientById(id);
        const grants = data?.SSO_AUTH_GRANTS_T;
        res.status(200).json({
            code: 200,
            statusCode: 200,
            data: {
                grants,
                clientId: data?.client_id,
                app: data?.app_name,
                clientSecret: data?.client_secret,
                createdDate: data?.created_date
            }
        });
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
}
//POST
export const createClientController = async (req: Request, res: Response) => {
    try {
        const { app, grants } = req.body;
        const create = await clientService.createClient(app, grants);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: {
                clientId: create?.client_id,
                app: create?.app_name,
                clientSecret: create?.client_secret,
                createdDate: create?.created_date,
                grants: create.grants,
            }
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}
//GET
export const getClientsController = async (req: Request, res: Response) => {
    try {
        const pageNum = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 20;
        const data = await clientService.getClients(pageNum, pageSize);

        const clients = data.data.map((x) => {
            const grants = x.SSO_AUTH_GRANTS_T;
            return {
                grants,
                clientId: x?.client_id,
                app: x?.app_name,
                clientSecret: x?.client_secret,
                createdDate: x?.created_date
            }
        });
        res.status(200).json({
            code: 200,
            statusCode: 200,
            data: clients,
            page: pageNum,
            pageSize,
            totalCount: data.totalCount
        });
    } catch (error: any) {
        console.log(error)
        res.status(error.statusCode || 500).json(error);
    }
}
//POST
export const createGrantsController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { grantsType } = req.body;
        const data = await clientService.setGrants(id, grantsType);

        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: {
                grants: data?.SSO_AUTH_GRANTS_T ?? [],
                clientId: data?.client_id,
                app: data?.app_name,
                clientSecret: data?.client_secret,
                createdDate: data?.created_date
            }
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const delteClientController = async (req: Request, res: Response) => {
    try {
        const data = await clientService.getClientById(req.params.id);
        if (data?.app_name === "SSO") throw new OAuthError(`No se puede eliminar este recurso`, {
            code: 409,
            name: 'CLT_DEL'
        })

        await clientService.deleteClient(req.params.id);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: null
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }

}