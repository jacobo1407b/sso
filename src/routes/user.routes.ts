import express from "express";
import { upload } from '@config/multer';
import * as usr from "@controllers/user.controller";
import { authenticateRequest } from "@middleware/authMiddleware";
const router = express.Router();

/**
 * @openapi
 * /api/v1/users:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags:
 *       - Usuarios
 *     security:
 *       - OAuth2: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - name
 *               - email
 *               - password
 *               - lastName
 *             properties:
 *               username:
 *                 type: string
 *                 example: "jacobo"
 *               name:
 *                 type: string
 *                 example: "jacobo"
 *               email:
 *                 type: string
 *                 example: "jacobo"
 *               password:
 *                 type: string
 *                 example: "jacobo"
 *               lastName:
 *                 type: string
 *                 example: "jacobo"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "00ab6556-0d33-40d5-a57c-399ede9046a8"
 *                 username:
 *                   type: string
 *                   example: "jacobo1"
 *                 name:
 *                   type: string
 *                   example: "jacobo1"
 *                 last_name:
 *                   type: string
 *                   example: "jacobo1"
 *                 email:
 *                   type: string
 *                   example: "jacobo1"
 *                 phone:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 profile_picture:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 status:
 *                   type: string
 *                   example: "ACTIVE"
 *                 last_login:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: null
 *                 reset_token:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 verified:
 *                   type: boolean
 *                   example: false
 *                 bio:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 created_date:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-12T04:38:23.299Z"
 *                 updated_date:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-12T04:38:23.299Z"
 *                 adicional:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "5109812a-8776-4a25-bfbf-c1ef1c783af9"
 *                     user_id:
 *                       type: string
 *                       example: "00ab6556-0d33-40d5-a57c-399ede9046a8"
 *                     job_title:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     department:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     company_name:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     location:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     hire_date:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 */

router.post("/users", authenticateRequest, usr.createUserController);

/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     summary: Obtiene una lista paginada de usuarios
 *     tags:
 *       - Usuarios
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página actual
 *       - in: query
 *         name: pageSize
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Cantidad de usuarios por página
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
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
 *                       name:
 *                         type: string
 *                         example: "Jacobo"
 *                       id:
 *                         type: string
 *                         example: "uuid-123"
 *                       username:
 *                         type: string
 *                         example: "jaco_dev"
 *                       last_name:
 *                         type: string
 *                         example: "Ramírez"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "jacobo@example.com"
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       profile_picture:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       status:
 *                         type: string
 *                         nullable: true
 *                         example: "ACTIVE"
 *                       last_login:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       reset_token:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       verified:
 *                         type: boolean
 *                         nullable: true
 *                         example: false
 *                       bio:
 *                         type: string
 *                         nullable: true
 *                         example: "Backend developer with a passion for performance tuning"
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   example: 10
 *                 totalCount:
 *                   type: integer
 *                   example: 150
 */


router.get("/users", authenticateRequest, usr.getUsersController);

/**
 * @openapi
 * /api/v1/user/{id}:
 *   get:
 *     summary: Obtiene el detalle de un usuario por ID
 *     tags:
 *       - Usuarios
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado exitosamente
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
 *                     adicional:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         job_title:
 *                           type: string
 *                           nullable: true
 *                         department:
 *                           type: string
 *                           nullable: true
 *                         company_name:
 *                           type: string
 *                           nullable: true
 *                         location:
 *                           type: string
 *                           nullable: true
 *                     name:
 *                       type: string
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     profile_picture:
 *                       type: string
 *                       nullable: true
 *                     status:
 *                       type: string
 *                       nullable: true
 *                     last_login:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     reset_token:
 *                       type: string
 *                       nullable: true
 *                     verified:
 *                       type: boolean
 *                       nullable: true
 *                     bio:
 *                       type: string
 *                       nullable: true
 */

router.get("/user/:id", authenticateRequest, usr.getUserController);
/**
 * @openapi
 * /api/v1/employe/{id}:
 *   get:
 *     summary: Obtiene los datos laborales de un empleado por ID
 *     tags:
 *       - Usuarios
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del empleado obtenidos exitosamente
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
 *                     user_id:
 *                       type: string
 *                     job_title:
 *                       type: string
 *                       nullable: true
 *                     department:
 *                       type: string
 *                       nullable: true
 *                     company_name:
 *                       type: string
 *                       nullable: true
 *                     location:
 *                       type: string
 *                       nullable: true
 *                     hire_date:
 *                       type: boolean
 */

router.get("/employe/:id", authenticateRequest, usr.employeController);

/**
 * @openapi
 * /api/v1/verifi/{id}:
 *   put:
 *     summary: Verifica y devuelve información detallada de un usuario por ID
 *     tags:
 *       - Usuarios
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Verificación exitosa con datos del usuario
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
 *                     created_date:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     updated_date:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     name:
 *                       type: string
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     profile_picture:
 *                       type: string
 *                       nullable: true
 *                     status:
 *                       type: string
 *                       nullable: true
 *                     adicional:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         user_id:
 *                           type: string
 *                         job_title:
 *                           type: string
 *                           nullable: true
 *                         department:
 *                           type: string
 *                           nullable: true
 *                         company_name:
 *                           type: string
 *                           nullable: true
 *                         location:
 *                           type: string
 *                           nullable: true
 *                         hire_date:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 */

router.put("/verifi/:id", authenticateRequest, usr.verifyUserController);

/**
 * @openapi
 * /api/v1/user/image/{id}:
 *   put:
 *     summary: Sube una imagen de perfil para un usuario
 *     tags:
 *       - Usuarios
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: pub
 *         required: false
 *         schema:
 *          type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente con detalles del usuario
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
 *                     adicional:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         user_id:
 *                           type: string
 *                         job_title:
 *                           type: string
 *                           nullable: true
 *                         department:
 *                           type: string
 *                           nullable: true
 *                         company_name:
 *                           type: string
 *                           nullable: true
 *                         location:
 *                           type: string
 *                           nullable: true
 *                         hire_date:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                     name:
 *                       type: string
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     profile_picture:
 *                       type: string
 *                       nullable: true
 *                     status:
 *                       type: string
 *                       nullable: true
 *                     last_login:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     reset_token:
 *                       type: string
 *                       nullable: true
 *                     verified:
 *                       type: boolean
 *                       nullable: true
 *                     bio:
 *                       type: string
 *                       nullable: true
 */

router.put("/user/image/:id", authenticateRequest, upload.single('image'), usr.updateImgController);

/**
 * @openapi
 * /api/v1/user/{id}:
 *   put:
 *     summary: Actualiza información laboral de un usuario
 *     tags:
 *       - Usuarios
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               job_title:
 *                 type: string
 *               department:
 *                 type: string
 *               company_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Información del usuario actualizada exitosamente
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
 *                     id:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     job_title:
 *                       type: string
 *                       nullable: true
 *                     department:
 *                       type: string
 *                       nullable: true
 *                     company_name:
 *                       type: string
 *                       nullable: true
 *                     location:
 *                       type: string
 *                       nullable: true
 *                     hire_date:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 */

router.put("/user/:id", authenticateRequest, usr.updateUserController);

/**
 * @openapi
 * /api/v1/user/password/{id}:
 *   put:
 *     summary: Actualiza la contraseña de un usuario por ID
 *     tags:
 *       - Usuarios
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contraseña actualizada exitosamente
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
 *                   type: "null"
 *                   example: null
 */

router.put("/user/password/:id", authenticateRequest, usr.resetPasswordController);

export default router;
