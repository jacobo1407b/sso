import { Request, Response } from "express";
import { roleService } from "@services/role.service";


export const getRolsController = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page ?? 1);
        const size = Number(req.query.size ?? 20);
        const rols = await roleService.getRoles(page, size);

        res.status(200).json({
            code: 200,
            statusCode: 200,
            data: rols
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const getRolsUniqID = async (req: Request, res: Response) => {
    try {
        const rol = await roleService.getRoleById(req.params.id);

        const users = rol?.SSO_AUTH_ACCESS_L.map((x) => {
            const { password, ...alldata } = x.SSO_AUTH_USERS_T
            return alldata;
        });
        res.status(200).json({
            code: 200,
            statusCode: 200,
            data: {
                id: rol?.id,
                rol_name: rol?.rol_name,
                rol_code: rol?.rol_code,
                created_by: rol?.created_by,
                created_date: rol?.created_date,
                last_update_by: rol?.last_update_by,
                last_update_date: rol?.last_update_date,
                users

            }
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const assigmentController = async (req: Request, res: Response) => {
    try {
        await roleService.assigmentRol(req.user?.username ?? "", req.body.rols, req.params.id);
        res.status(200).json({
            code: 201,
            statusCode: 201,
            data: null
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const revokeController = async (req: Request, res: Response) => {
    try {
        await roleService.revokeRoles(req.user?.username ?? "", req.body.rols);
        res.status(200).json({
            code: 201,
            statusCode: 201,
            data: null
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

//e850c02a-f05c-4f54-9f7c-18fb82df0da3


//3daa90aa-71fa-41c5-9f00-2199eb21e6bf