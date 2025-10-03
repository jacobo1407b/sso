import { Request, Response } from "express";
import { usrService } from "@services/user.service";
import { hashPassword } from "@utils/bcrypt";
import { OAuthError } from "oauth2-server";
import { getStorageProvider } from "@services/storage.factory";



export const getUsersController = async (req: Request, res: Response) => {
    try {
        const pageNum = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 20;
        const user = String(req.query.user) === "undefined" ? undefined : String(req.query.user)
        const { data, count } = await usrService.getUsers(pageNum, pageSize, user);
        res.status(200).json({
            code: 200,
            statusCode: 200,
            data,
            page: pageNum,
            pageSize,
            totalCount: count
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const getUserController = async (req: Request, res: Response) => {
    try {
        const data = await usrService.getUserOne(req.params.id);
        res.status(200).json({
            code: 200,
            statusCode: 200,
            data
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const createUserController = async (req: Request, res: Response) => {
    try {
        const { username, name, email, password } = req.body;

        if (!username || !name || !email || !password) {
            throw new OAuthError('Todos los campos son obligatorios.', {
                code: 400,
                name: "BAD_REQUEST_NULL_FIELDS"
            })
        } else {
            const hashedPassword = await hashPassword(password);

            const bodyData = {
                ...req.body,
                password: hashedPassword
            }
            const unidad = req.query.unid ? String(req.query.unid) : null;
            const branch = req.query.branch ? String(req.query.branch) : null;

            const user = await usrService.createUser(bodyData, unidad, branch, req.user?.userId);
            res.status(201).json({
                code: 201,
                statusCode: 201,
                data: user
            });
        }
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
};


export const updateImgController = async (req: Request, res: Response) => {
    try {

        if (!req.file) {
            throw new OAuthError('Image requerida', {
                code: 400,
                name: "BAD_REQUEST_NOT_IMAGE"
            })
        }
        const storage = getStorageProvider();
        const factoryUpload = await storage.uploadImage(req.file?.buffer,
            {
                folder: "users",
                public_id: req.query.pub,
                overwrite: true,
                invalidate: true

            });
        const retData = await usrService.updateImageProfile(req.params.id, factoryUpload.publicId);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: retData
        })
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const updateUserController = async (req: Request, res: Response) => {
    try {
        const updaUsr = await usrService.updateUser(req.body, req.params.id);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: updaUsr
        })
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const resetPasswordController = async (req: Request, res: Response) => {
    try {
        await usrService.resetPassword(req.body.pass, req.params.id, req.body.last_pass);

        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: null
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const setPreferenceController = async (req: Request, res: Response) => {
    try {
        await usrService.setPreferences(req.params.id, req.body);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: null
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const getUserDetailController = async (req: Request, res: Response) => {
    try {
        const session_id = String(req.query.session ?? "")
        const details = await usrService.userdetails(req.params.id, session_id);
        res.status(200).json({
            code: 200,
            statusCode: 200,
            data: details
        })
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const revokeSesionController = async (req: Request, res: Response) => {
    try {
        const ssoMain = req.query.main === "Y" ? true : false;
        await usrService.revokSesion(req.params.id, ssoMain);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: null
        })
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}