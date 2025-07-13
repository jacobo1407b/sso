import express from "express";
import * as clent from "@controllers/client.controller";
import { authenticateRequest } from "@middleware/authMiddleware";

const router = express.Router();

/**
 * @openapi
 * /api/v1/client/{id}:
 *   get:
 *     summary: Obtiene un client APP por identificador
 *     tags:
 *       - Client
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de clients
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
 *                     grants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           client_id:
 *                             type: string
 *                             example: "abc123"
 *                           created_date:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-06-01T12:00:00Z"
 *                           id:
 *                             type: string
 *                             example: "grant-001"
 *                           grant_name:
 *                             type: string
 *                             example: "read"
 *                     clientId:
 *                       type: string
 *                       example: "abc123"
 *                     app:
 *                       type: string
 *                       example: "my-app"
 *                     clientSecret:
 *                       type: string
 *                       example: "secret123"
 *                     createdDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-01T12:00:00Z"
 */
router.get("/client/:id", authenticateRequest, clent.getClientByIdController);

/**
 * @openapi
 * /api/v1/client:
 *   post:
 *     summary: Crea un nuevo cliente con sus grants
 *     tags:
 *       - Client
 *     security:
 *       - OAuth2: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               app:
 *                 type: string
 *                 example: "application name"
 *               grants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     grant_name:
 *                       type: string
 *                       example: "refresh_token"
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
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
 *                   type: object
 *                   properties:
 *                     clientId:
 *                       type: string
 *                       example: "706d324f2ac696b19c223af6af6b731a007e92a155abea14bcae5b43e3d4b233"
 *                     app:
 *                       type: string
 *                       example: "APPS"
 *                     clientSecret:
 *                       type: string
 *                       example: "2bebbc867ee9a462956879a480bf5651"
 *                     createdDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-12T04:21:02.565Z"
 *                     grants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "6997690f-5463-4eee-833a-6fb45b6e85ac"
 *                           grant_name:
 *                             type: string
 *                             example: "refresh_token"
 *                           created_date:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-06-12T04:21:02.667Z"
 *       409:
 *         description: Ya existe un cliente con ese nombre de aplicación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 409
 *                 status:
 *                   type: integer
 *                   example: 409
 *                 code:
 *                   type: integer
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: "Ya existe un APP_NAME con el nombre APP"
 *                 name:
 *                   type: string
 *                   example: "CLT_EX"
 */

router.post("/client", authenticateRequest, clent.createClientController);

/**
 * @openapi
 * /api/v1/clients:
 *   get:
 *     summary: Obtiene una lista de clients paginados por 20 filas
 *     tags:
 *       - Client
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: Página actual
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *         description: Cantidad total por consulta
 *     responses:
 *       200:
 *         description: Lista de clients
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
 *                       clientId:
 *                         type: string
 *                         example: "abc123"
 *                       app:
 *                         type: string
 *                         example: "APP"
 *                       clientSecret:
 *                         type: string
 *                         example: "abc123"
 *                       createdDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-06-01T12:00:00Z"
 *                       grants:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             client_id:
 *                               type: string
 *                               example: "abc123"
 *                             created_date:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-06-01T12:00:00Z"
 *                             id:
 *                               type: string
 *                               example: "grant-001"
 *                             grant_name:
 *                               type: string
 *                               example: "read"
 */

router.get("/clients", authenticateRequest, clent.getClientsController);

/**
 * @openapi
 * /api/v1/client/grants/{id}:
 *   post:
 *     summary: Crear grants para un cliente
 *     tags:
 *       - Client
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grantsType:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     grant_name:
 *                       type: string
 *                       example: "refresh_token"
 *     responses:
 *       201:
 *         description: Grants creados exitosamente
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
 *                   type: object
 *                   properties:
 *                     grants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           client_id:
 *                             type: string
 *                             example: "abc123"
 *                           created_date:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-06-01T12:00:00Z"
 *                           id:
 *                             type: string
 *                             example: "grant-001"
 *                           grant_name:
 *                             type: string
 *                             example: "refresh_token"
 *                     clientId:
 *                       type: string
 *                       example: "abc123"
 *                     app:
 *                       type: string
 *                       example: "my-app"
 *                     clientSecret:
 *                       type: string
 *                       example: "secret123"
 *                     createdDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-01T12:00:00Z"
 */

router.post("/client/grants/:id", authenticateRequest, clent.createGrantsController);

/**
 * @openapi
 * /api/v1/client/{id}:
 *   delete:
 *     summary: Elimina un cliente por ID
 *     tags:
 *       - Client
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a eliminar
 *     responses:
 *       201:
 *         description: Cliente eliminado exitosamente
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
 */

router.delete("/client/:id", authenticateRequest, clent.delteClientController)

export default router;
