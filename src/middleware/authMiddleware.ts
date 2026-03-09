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
                rols: usr.user.rols,
                log_in_status: usr.user.log_in_status
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
        const currentErr = errores.array()[0];
        const [det, errName] = currentErr.msg.split(":")

        return next(new OAuthError('Error de validación en campos esperados', {
            code: 400,
            name: errName,
            details: det,
            ctx: currentErr
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

type Action = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';

export function requierePermiso(resource: string, action: Action) {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.user;
        console.log("---------------------AQUI-----------");


        if (!token || !token.rols || token.rols.length === 0) {
            next(new OAuthError('No roles found in token', {
                code: 403,
                name: 'ROLE_UN_TOKEN',
                details: 'SYS'
            }));
        }

        const permissionCode = `${resource}:${action}`;

        const hasPermission = token?.rols.some(role =>
            role.policy_permission.includes(permissionCode)
        );
        if (!hasPermission) {
            next(new OAuthError(`Access denied for ${permissionCode}`, {
                code: 403,
                name: 'ROLE_UN_AUTORIZE',
                details: "SYS"
            }));
        }

        next();
    };
}