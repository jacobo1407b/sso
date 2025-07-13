import { Request, Response } from "express";
import { usrService } from "@services/user.service";
import { hashPassword } from "@utils/bcrypt";
import { OAuthError } from "oauth2-server";
import { getStorageProvider } from "@services/storage.factory";



export const getUsersController = async (req: Request, res: Response) => {
    try {
        const pageNum = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 20;
        const { data, count } = await usrService.getUsers(pageNum, pageSize);
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
        const { username, name, email, password, lastName } = req.body;

        if (!username || !name || !email || !password) {
            throw new OAuthError('Todos los campos son obligatorios.', {
                code: 400,
                name: "BAD_REQUEST"
            })
        } else {
            const hashedPassword = await hashPassword(password);
            const user = await usrService.createUser({ username, name, email, password: hashedPassword, last_name: lastName });
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

export const employeController = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const emplInfo = await usrService.getEmployeInfo(userId);
        res.status(200).json({
            code: 200,
            statusCode: 200,
            data: emplInfo
        })
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const verifyUserController = async (req: Request, res: Response) => {
    try {
        const usr = await usrService.verifyUser(req.params.id);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: usr
        })
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const updateImgController = async (req: Request, res: Response) => {
    try {

        if (!req.file) {
            throw new OAuthError('Image requerida', {
                code: 400,
                name: "BAD_REQUEST"
            })
        }
        const storage = getStorageProvider();
        const factoryUpload = await storage.uploadImage(req.file?.buffer,
            {
                folder: "sso",
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
        await usrService.resetPassword(req.body.pass, req.params.id);

        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: null
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}