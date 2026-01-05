import OAuth2Server from "oauth2-server";
import { getServer } from "@config/oauth";
import { Request } from "express";
import { oauthService } from "@services/oauth.service";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || 'tu_clave_secreta';

export const authTokenController = async (req: Request, res: any) => {
    const RequestO = OAuth2Server.Request;
    const ResponseO = OAuth2Server.Response;
    const requ = new RequestO(req);
    const resp = new ResponseO(res);

    if (req.body.grant_type === 'password') {
        await oauthService.resetMfa(req.body.username);
    }
    const token = await getServer().token(requ, resp, { allowExtendedTokenAttributes: true });
    if (req.body.userAgent) {
        await oauthService.updateAgent(req.body.userAgent, req.body.ip, token.token_id)
    }
    oauthService.updateUserLogin(token.user.user_id);
    res.status(200).json({
        ...token,
        access_token: token.accessToken,
        token_type: 'Bearer',
        expires_in: token.accessTokenExpiresAt
    });

    //res.status(err.code || 500).json(err);

}
export const autorizeCode = async (req: Request, res: any) => {
    const RequestO = OAuth2Server.Request;
    const ResponseO = OAuth2Server.Response;

    const request = new RequestO(req);
    const response = new ResponseO(res);

    const result = await getServer().authorize(request, response, {
        authenticateHandler: {
            handle: (req: any) => {
                const token = req.headers.authorization?.split(' ')[1];
                const user = jwt.verify(token, SECRET_KEY);
                return user
            }
        }
    });
    res.status(200).json(result);
}
export const autorizeController = async (req: Request, res: any) => {
    res.status(200).json(req.user);
}

export const revokTokenController = async (req: Request, res: any) => {
    const authHeader = req.headers['authorization'] ?? "";
    const token = authHeader.split(' ')[1];
    await oauthService.revokToken(req.user?.userId ?? "", token);
    res.status(201);
}