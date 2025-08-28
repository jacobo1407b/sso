import express from "express";
import { upload } from '@config/multer';
import * as usr from "@controllers/user.controller";
import { authenticateRequest, errorHandlerValidate, requierePermiso } from "@middleware/authMiddleware";

import * as userValid from '@validators/users.validator';

const router = express.Router();

router.use(authenticateRequest);
router.post("/user", requierePermiso(["USER_PROVICIONE", 'ADMIN_SSO']), userValid.validarUsuario, errorHandlerValidate, usr.createUserController);

router.get("/users", requierePermiso(["USER_PROVICIONE", 'ADMIN_SSO']), userValid.getUser, errorHandlerValidate, usr.getUsersController);

router.get("/user/:id", requierePermiso(["END_USER", 'USER_PROVICIONE', 'ADMIN_SSO']), usr.getUserController);

router.put("/user/image/:id", requierePermiso(["END_USER", 'USER_PROVICIONE', 'ADMIN_SSO']), upload.single('image'), userValid.esquemaUploadArchivo, errorHandlerValidate, usr.updateImgController);

router.put("/user/:id", requierePermiso(["END_USER", 'USER_PROVICIONE', 'ADMIN_SSO']), userValid.PerfilUsuario, errorHandlerValidate, usr.updateUserController);

router.put("/user/password/:id", requierePermiso(["USER_PROVICIONE", 'ADMIN_SSO']), userValid.CambioPassword, errorHandlerValidate, usr.resetPasswordController);

router.put("/user/preferences/:id", requierePermiso(["END_USER", 'USER_PROVICIONE', 'ADMIN_SSO']), usr.setPreferenceController);

export default router;
