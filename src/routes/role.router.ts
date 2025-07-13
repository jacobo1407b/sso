import express from "express";
import * as rols from "@controllers/role.controller"
import { authenticateRequest } from "@middleware/authMiddleware";

const router = express.Router();

/**
 * @openapi
 * /api/v1/rols:
 *   get:
 *     summary: Lista los roles registrados en el sistema
 *     tags:
 *       - Roles
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Número de página para paginación
 *       - name: size
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Número de registros por página
 *     responses:
 *       200:
 *         description: Lista de roles obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "abc123"
 *                       rol_name:
 *                         type: string
 *                         example: "Administrador"
 *                       rol_code:
 *                         type: string
 *                         example: "ADMIN"
 *                       created_by:
 *                         type: string
 *                         example: "admin_user"
 *                       created_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-06-20T14:32:00Z"
 *                       last_update_by:
 *                         type: string
 *                         example: "admin_user"
 *                       last_update_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-07-01T10:15:00Z"
 */
router.get("/rols", authenticateRequest, rols.getRolsController)

/**
 * @openapi
 * /api/v1/rol/{id}:
 *   get:
 *     summary: Obtiene la información de un rol por su ID, incluyendo sus usuarios asociados
 *     tags:
 *       - Roles
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del rol
 *     responses:
 *       200:
 *         description: Rol encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "19e7458c-30bc-44fb-ba02-a8a75fe156cd"
 *                     rol_name:
 *                       type: string
 *                       example: "SSO Administrator"
 *                     rol_code:
 *                       type: string
 *                       example: "ADMIN_SSO"
 *                     created_by:
 *                       type: string
 *                       example: "system"
 *                     created_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-30T18:11:34.541Z"
 *                     last_update_by:
 *                       type: string
 *                       example: "system"
 *                     last_update_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-30T18:11:34.541Z"
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "3daa90aa-71fa-41c5-9f00-2199eb21e6bf"
 *                           username:
 *                             type: string
 *                             example: "ADMIN"
 *                           name:
 *                             type: string
 *                             example: "ADMIN"
 *                           last_name:
 *                             type: string
 *                             example: "ADMIN"
 *                           email:
 *                             type: string
 *                             example: "admin@admin.com"
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                           profile_picture:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                           status:
 *                             type: string
 *                             example: "ACTIVE"
 *                           last_login:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: null
 *                           reset_token:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                           verified:
 *                             type: boolean
 *                             example: false
 *                           bio:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                           created_date:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-06-30T18:11:34.318Z"
 *                           updated_date:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-06-30T18:11:34.318Z"
 *       404:
 *         description: Rol no encontrado
 *       401:
 *         description: No autorizado
 */


router.get("/rol/:id", authenticateRequest, rols.getRolsUniqID);

/**
 * @openapi
 * /api/v1/rols/{id}:
 *   post:
 *     summary: Asocia múltiples roles al recurso indicado por ID
 *     tags:
 *       - Roles
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del recurso al que se le asignan los roles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rols:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["1", "2", "3"]
 *             required:
 *               - rols
 *     responses:
 *       201:
 *         description: Roles asignados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Recurso destino no encontrado
 */

router.post("/rols/:id", authenticateRequest, rols.assigmentController);

/**
 * @openapi
 * /api/v1/rols:
 *   delete:
 *     summary: Elimina múltiples roles por ID
 *     tags:
 *       - Roles
 *     security:
 *       - OAuth2: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rols:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["1", "2", "3"]
 *             required:
 *               - rols
 *     responses:
 *       201:
 *         description: Roles eliminados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Formato de datos inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Roles no encontrados
 */

router.delete("/rols", authenticateRequest, rols.revokeController);

export default router;