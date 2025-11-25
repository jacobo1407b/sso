import { Request, Response } from "express";
import { roleService } from "@services/role.service";


export const getRolsController = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page ?? 1);
        const size = Number(req.query.size ?? 20);
        const cod = req.query.rol_code ? String(req.query.rol_code) : undefined;
        const rols = await roleService.getRoles(page, size, cod);

        res.status(200).json({
            code: 200,
            statusCode: 200,
            data: rols.items,
            page,
            pageSize: size,
            total: rols.total
        });
    } catch (error: any) {
        console.log(error)
        res.status(error.statusCode || 500).json(error);
    }
}

export const getRolsUniqID = async (req: Request, res: Response) => {
    try {
        const rol = await roleService.getRoleById(req.params.id);

        res.status(200).json({
            code: 200,
            statusCode: 200,
            data: rol
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const assigmentController = async (req: Request, res: Response) => {
    try {

        const asigment: Array<any> = req.body.rols.filter((x: any) => x.type === "CREATE");
        const revokUser: Array<any> = req.body.rols.filter((x: any) => x.type === "DELETE");

        if (asigment.length !== 0) {
            await roleService.assigmentRol(req.params.id, asigment, req.user?.userId ?? "");
        }

        if (revokUser.length !== 0) {
            await roleService.revokeRoles(req.params.id, revokUser);
        }

        res.status(200).json({
            code: 201,
            statusCode: 201,
            data: null
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const createRolController = async (req: Request, res: Response) => {
    try {
        const rol = await roleService.createRol(req.body.rol, req.body.users, req.user?.username ?? "");

        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: rol
        });

    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

//e850c02a-f05c-4f54-9f7c-18fb82df0da3


//3daa90aa-71fa-41c5-9f00-2199eb21e6bf