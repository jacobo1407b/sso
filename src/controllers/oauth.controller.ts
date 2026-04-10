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

    if (token.user && token.user.user_id) {
        oauthService.updateUserLogin(token.user.user_id);
    }

    // --- MEJORAS DE SEGURIDAD (FEAT) ---
    // 1. Generar ID Token (OIDC)
    const idToken = jwt.sign({
        sub: token.user.user_id,
        email: token.user.email,
        name: token.user.name,
        preferred_username: token.user.username,
        iat: Math.floor(Date.now() / 1000),
    }, SECRET_KEY, { expiresIn: '1h' });

    // 2. Configurar Cookie HttpOnly (Para mayor seguridad en el Front/Next.js)
    // Solo se enviará si estamos en producción (Secure) o si el usuario lo solicita
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 3600000 // 1 hora en ms
    });

    res.status(200).json({
        ...token,
        access_token: token.accessToken,
        id_token: idToken, // Nuevo: Token de identidad
        token_type: 'Bearer',
        expires_in: 3600
    });
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
    res.status(201).json({ code: 201, statusCode: 201, message: "Token revocado exitosamente" });
}