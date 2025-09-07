import { Request, Response } from "express";
import { faService } from "@services/2fa.service";
import { OAuthError } from "oauth2-server";
import speakeasy from "speakeasy"


export const generateSecretController = async (req: Request, res: Response) => {
    try {
        const fa = await faService.generateSecret();
        await faService.setUser2fa(req.user?.userId ?? "", fa.id);

        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: {
                id: fa.id,
                otpauth_url: fa.otpauth_url
            }
        });
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
}

export const verifySecretController = async (req: Request, res: Response) => {
    try {
        let secret = await faService.getSecret(req.body.id);
        const now = new Date();

        if (secret?.last_attempt_date && now < new Date(secret.last_attempt_date)) throw new OAuthError(`2FA verification blocked: user temporarily locked`, {
            code: 403,
            name: 'ERR_2FA_TOTP_LOCKED'
        });
        if (secret?.last_attempt_date && new Date(secret.last_attempt_date) <= now && (secret?.failed_attempts ?? 0) >= 5) {
            secret.failed_attempts = 0;
        }


        if ((secret?.failed_attempts ?? 0) >= 5) throw new OAuthError(`2FA verification blocked: maximum failed attempts reached for user`, {
            code: 403,
            name: 'ERR_2FA_TOTP_MAX_ATTEMPTS'
        });

        const verify = speakeasy.totp.verify({
            secret: secret?.base32 ?? "",
            encoding: "base32",
            token: req.body.code
        });

        if (!verify) {
            const newAttempts = (secret?.failed_attempts ?? 0) + 1;
            await faService.updateAttemp(req.body.id, newAttempts);
            throw new OAuthError(`Error retrieving user`, {
                code: 403,
                name: 'ERR_2FA_TOTP'
            });
        }
        await faService.setSuccess(req.body.id);
        res.status(200).json({
            code: 200,
            statusCode: 200
        });
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
}

export const cancelSecretController = async (req: Request, res: Response) => {
    try {
        await faService.delete2fa(req.params.id, req.user?.userId ?? "");
        res.status(201).json({
            code: 201,
            statusCode: 201
        });
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
}