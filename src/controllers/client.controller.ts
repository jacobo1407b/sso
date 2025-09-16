import { Request, Response } from "express";
import { clientService } from "@services/client.service";
import { OAuthError } from "oauth2-server";
import { getStorageProvider } from "@services/storage.factory";


//GET obtener detalles de un app
export const getClientByIdController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const data = await clientService.getClientById(id);

        res.status(200).json({
            code: 200,
            statusCode: 200,
            data
        });
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
}

export const putImageClient = async (req: Request, res: Response) => {
    try {
        const storage = getStorageProvider();
        if (!req.file) throw new OAuthError('Imagen requerida', {
            code: 400,
            name: "BAD_REQUEST_NOT_IMAGE"
        });
        const { publicId } = await storage.uploadImage(req.file.buffer, {
            folder: "app",
            public_id: req.query.pub,
            overwrite: true,
            invalidate: true
        });
        await clientService.UpdateImageClient(req.params.id, publicId);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: null
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }

}
//POST Crear un app y sus grants
export const createClientController = async (req: Request, res: Response) => {
    try {
        const { app, grants, data } = req.body
        const create = await clientService.createClient(app, grants, data);

        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: create
        });

    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}
//GET obtener todas las apps
export const getClientsController = async (req: Request, res: Response) => {
    try {
        const pageNum = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 20;
        let filters: any = {};
        if (req.query.q) {
            filters = String(req.query.q).split(';').reduce((acc: any, pair) => {
                const [key, value] = pair.split('=');
                acc[key] = value;
                return acc;
            }, {});
        }
        const data = await clientService.getClients(pageNum, pageSize, filters);

        res.status(200).json({
            code: 200,
            statusCode: 200,
            data: data.data,
            page: pageNum,
            pageSize,
            totalCount: data.totalCount
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}
//POST set y revook granst
export const createGrantsController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { grantsType } = req.body;

        const deletesArr: Array<any> = grantsType.filter((x: any) => x.type === "DELETE");
        const updtArr: Array<any> = grantsType.filter((x: any) => x.type === "UPDATE");
        if (deletesArr.length !== 0) {
           await clientService.revokeGrants(id, deletesArr);
        }
        if (updtArr.length !== 0) {
            await clientService.setGrants(id, updtArr);
        }

        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: null
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const updateClientController = async (req: Request, res: Response) => {
    try {
        const updateClient = await clientService.updateClient(req.params.id, req.body);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: updateClient
        });

    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const deleteClientController = async (req: Request, res: Response) => {
    try {
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

export const listGrantsController = async (req: Request, res: Response) => {
    try {
        const list = await clientService.getGrants();
        res.status(200).json({
            code: 200,
            statusCode: 200,
            data: list
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}
