import express from "express";
import { authTokenController } from "@controllers/oauth.controller";

const router = express.Router();
/**
 * @swagger
 * /token:
 *   post:
 *     summary: Genera un token de autenticación
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               client_id:
 *                 type: string
 *                 example: "abc123"
 *               client_secret:
 *                 type: string
 *                 example: "secret123"
 *               grant_type:
 *                 type: string
 *                 example: "password"
 *               username:
 *                 type: string
 *                 example: "SYS"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               code:
 *                 type: string
 *                 example: "auth-code-xyz"
 *               refresh_token:
 *                 type: string
 *                 example: "refresh-token-abc"
 *     responses:
 *       200:
 *         description: Token generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOi..."
 *                 accessTokenExpiresAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-12T05:24:40.929Z"
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOi..."
 *                 refreshTokenExpiresAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-26T04:24:40.929Z"
 *                 client:
 *                   type: object
 *                   properties:
 *                     clientId:
 *                       type: string
 *                       example: "5613..."
 *                     app:
 *                       type: string
 *                       example: "SSO"
 *                     clientSecret:
 *                       type: string
 *                       example: "bccf..."
 *                     grants:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["password", "authorization_code", "client_credentials", "refresh_token"]
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "9955..."
 *                     username:
 *                       type: string
 *                       example: "SYS"
 *                     name:
 *                       type: string
 *                       example: "SYS"
 *                     last_name:
 *                       type: string
 *                       example: "SYS"
 *                     email:
 *                       type: string
 *                       example: "SYS"
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     profile_picture:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     last_login:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     reset_token:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     verified:
 *                       type: boolean
 *                       example: false
 *                     bio:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     created_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-10T04:20:33.650Z"
 *                     updated_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-10T04:20:33.650Z"
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *                 name:
 *                   type: string
 *                   example: "USR_FN"
 *       403:
 *         description: Contraseña incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 code:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: "Contraseña incorrecta"
 *                 name:
 *                   type: string
 *                   example: "USR_PASS"
 */


router.post("/token", authTokenController);

export default router;
