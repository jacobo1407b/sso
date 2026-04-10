import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { getServer } from "@config/oauth";
import OAuth2Server from "oauth2-server";
import { OAuthError } from "oauth2-server";

const RequestO = OAuth2Server.Request;
const ResponseO = OAuth2Server.Response;

export const authenticateRequest = async (req: Request, res: Response, next: NextFunction) => {
    const request = new RequestO(req);
    const response = new ResponseO(res);
    try {
        const usr = await getServer().authenticate(request, response, { scope: 'read_data write_data' });

        req.user = {
            userId: usr.user.userId,
            exp: usr.user.exp,
            iat: usr.user.iat,
            username: usr.user.username,
            client_id: usr.user.clientId,
            rols: usr.user.rols,
            log_in_status: usr.user.log_in_status
        };
        next();
    } catch (err: any) {
        res.status(err.code || 500).json(err);
    }
};

export const errorHandlerValidate = (req: Request, res: Response, next: NextFunction) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        const currentErr = errores.array()[0];
        const msg = currentErr.msg || "";
        const [det, errName] = msg.includes(":") ? msg.split(":") : ["USER", msg];

        return next(new OAuthError('Error de validación en campos esperados', {
            code: 400,
            name: errName || 'VALIDATION_ERROR',
            details: det || 'USER',
            ctx: currentErr
        }));
    }
    next();
};

type Action = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';

export function requierePermiso(resource: string, action: Action) {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.user;

        if (!token || !token.rols || token.rols.length === 0) {
            return next(new OAuthError('No roles found in token', {
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
            return next(new OAuthError(`Access denied for ${permissionCode}`, {
                code: 403,
                name: 'ROLE_UN_AUTORIZE',
                details: "SYS"
            }));
        }

        next();
    };
}