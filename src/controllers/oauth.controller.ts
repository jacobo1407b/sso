import OAuth2Server from "oauth2-server";
import { getServer } from "@config/oauth";
import { Request } from "express";


export const authTokenController = async (req: Request, res: any) => {
    const RequestO = OAuth2Server.Request;
    const ResponseO = OAuth2Server.Response;
    const requ = new RequestO(req);
    const resp = new ResponseO(res);
    try {
        const token = await getServer().token(requ, resp);
        res.cookie('session', JSON.stringify(token), {
            httpOnly: true,   // Impide acceso desde JavaScript (protege contra XSS)
            secure: true,     // Solo se envía en HTTPS
        });
        res.status(200).json({
            ...token,
            access_token: token.accessToken,
            token_type: 'Bearer',
            expires_in: token.accessTokenExpiresAt
        });
    } catch (err: any) {
        res.status(err.code || 500).json(err);
    }
}

export const autorizeController = async (req: Request, res: any) => {
    try {
        res.status(200).json(req.user);
    } catch (err: any) {
        res.status(err.code || 500).json(err);
    }
}