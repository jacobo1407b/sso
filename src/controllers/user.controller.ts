import { Request, Response } from "express";
import { usrService } from "@services/user.service";
import { hashPassword } from "@utils/bcrypt";
import { OAuthError } from "oauth2-server";
import { getStorageProvider } from "@services/storage.factory";



export const getUsersController = async (req: Request, res: Response) => {
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
}

export const getUserController = async (req: Request, res: Response) => {
    const data = await usrService.getUserOne(req.params.id);
    res.status(200).json({
        code: 200,
        statusCode: 200,
        data
    });
}

export const createUserController = async (req: Request, res: Response) => {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
        throw new OAuthError('Todos los campos son obligatorios.', {
            code: 400,
            name: "BAD_REQUEST_NULL_FIELDS",
            details: "USER"
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
};

export const updateImgController = async (req: Request, res: Response) => {
    if (!req.file) {
        throw new OAuthError('Image requerida', {
            code: 400,
            name: "BAD_REQUEST_NOT_IMAGE",
            details: "USER"
        })
    }
    const storage = getStorageProvider();
    const filename = req.query.pub ? (req.query.pub as string).split("/")[1] : undefined;
    const factoryUpload = await storage.uploadImage(req.file?.buffer,
        {
            folder: "users",
            public_id: filename,
            overwrite: true,
            invalidate: true

        });
    const retData = await usrService.updateImageProfile(req.params.id, factoryUpload.publicId);
    res.status(201).json({
        code: 201,
        statusCode: 201,
        data: retData
    })
}

export const updateUserController = async (req: Request, res: Response) => {
    const updaUsr = await usrService.updateUser(req.body, req.params.id);
    res.status(201).json({
        code: 201,
        statusCode: 201,
        data: updaUsr
    })
}

export const resetPasswordController = async (req: Request, res: Response) => {
    await usrService.resetPassword(req.body.pass, req.params.id, req.body.last_pass);

    res.status(201).json({
        code: 201,
        statusCode: 201,
        data: null
    });
}

export const setPreferenceController = async (req: Request, res: Response) => {
    await usrService.setPreferences(req.params.id, req.body);
    res.status(201).json({
        code: 201,
        statusCode: 201,
        data: null
    });
}

export const getUserDetailController = async (req: Request, res: Response) => {
    const session_id = String(req.query.session ?? "")
    const details = await usrService.userdetails(req.params.id, session_id);
    res.status(200).json({
        code: 200,
        statusCode: 200,
        data: details
    })
}

export const revokeSesionController = async (req: Request, res: Response) => {
    const ssoMain = req.query.main === "Y" ? true : false;
    await usrService.revokSesion(req.params.id, ssoMain);
    res.status(201).json({
        code: 201,
        statusCode: 201,
        data: null
    })
}

export const getFederateDataController = async (req: Request, res: Response) => {
    const data = await usrService.getFederateData(req.query.user as string, req.query.client as string);
    res.status(200).json({
        code: 200,
        statusCode: 200,
        data
    });
}

export const downloadStream = async (req: Request, res: Response) => {
    const url = getStorageProvider().getImageUrl(req.query.file as string);
    const response = await fetch(url);
    if (!response.ok) throw new OAuthError(`Error al descargar: ${response.statusText}`,{
        code: 400,
        name: "ERROR_FILE_DOWNLOAD",
        details: "USER"
    });

    res.writeHead(200, {
        'Content-Type': 'application/octet-stream', // Or the appropriate MIME type
        'Content-Disposition': `attachment; filename="${req.query.fileName || 'downloaded_file'}.png"`,
    })
    res.end(Buffer.from(await response.arrayBuffer()));

}