import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { getServer } from "@config/oauth";
import OAuth2Server from "oauth2-server";
import { OAuthError } from "oauth2-server";

const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;


export const authenticateRequest = (req: Request, res: Response, next: NextFunction) => {
    const request = new Request(req);
    const response = new Response(res);
    getServer()
        .authenticate(request, response, { scope: 'read_data write_data' })
        .then((usr) => {
            req.user = {
                userId: usr.user.userId,
                exp: usr.user.exp,
                iat: usr.user.iat,
                username: usr.user.username,
                client_id: usr.user.clientId,
                rols: usr.user.rols
            }
            next();
        })
        .catch((err) => res.status(err.code || 500).json(err));
};
/*
export const autorizeReq = (req: Request, res: Response, next: NextFunction) => {
    const request = new Request(req);
    const response = new Response(res);

    getServer().authorize(request, response)
}
*/

export const errorHandlerValidate = (req: Request, res: Response, next: NextFunction) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return next(new OAuthError('Error de validación en campos esperados', {
            code: 400,
            name: 'VALIDATION_ERROR',
            details: errores.array().map((y) => `${y.type}:${y.msg}`)
        }));
    }

    /*const camposRecibidos = Object.keys(req.body);
    const camposInvalidos = camposRecibidos.filter(campo => !camposPermitidos.includes(campo));

    if (camposInvalidos.length > 0) {
        return next(new OAuthError('Se encontraron campos no permitidos en el body', {
            code: 400,
            name: 'UNEXPECTED_FIELDS',
            details: camposInvalidos
        }));
    }*/
    next();
};

export const requierePermiso = (rol: string[], dominio?: string) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const permisos = req.user?.rols?.flatMap((x) => x.role_code) || [];


        const faltantes = rol.filter(p => permisos.includes(p));
        
        if (faltantes.length === 0) return next(new OAuthError('Permiso insuficiente para esta operación', {
            code: 403,
            name: 'FORBIDDEN_POLICY',
            details: null
        }));

        next();
    };
};
