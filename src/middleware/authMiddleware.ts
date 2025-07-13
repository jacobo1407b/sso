import { Request, Response, NextFunction } from 'express';
import { getServer } from "@config/oauth";
import OAuth2Server from "oauth2-server";

const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;



export const authenticateRequest = (req: Request, res: Response, next: NextFunction) => {
    const request = new Request(req);
    const response = new Response(res);
    getServer()
        .authenticate(request, response)
        .then((usr) => {
            req.user = {
                userId: usr.user.userId,
                exp: usr.user.exp,
                iat: usr.user.iat,
                username: usr.user.username
            }
            next();
        })
        .catch((err) => res.status(err.code || 500).json(err));
};

export const autorizeReq = (req: Request, res: Response, next: NextFunction) => {
    const request = new Request(req);
    const response = new Response(res);

    getServer().authorize(request, response)
}