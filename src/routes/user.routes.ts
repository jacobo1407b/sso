import express from "express";
import { upload } from '@config/multer';
import * as usr from "@controllers/user.controller";
import { authenticateRequest, errorHandlerValidate, requierePermiso } from "@middleware/authMiddleware";

import * as userValid from '@validators/users.validator';

const router = express.Router();

router.use(authenticateRequest);
router.delete("/user/sesion/:id", requierePermiso('USR_VIEW_ONE', 'READ'), usr.revokeSesionController);
router.post("/user", requierePermiso('USR_CREATE', 'CREATE'), userValid.validarUsuario, errorHandlerValidate, usr.createUserController);

router.get("/users", requierePermiso('USR_VIEW_ALL', 'READ'), userValid.getUser, errorHandlerValidate, usr.getUsersController);

router.get("/user/:id", requierePermiso('USR_VIEW_ONE', 'READ'), usr.getUserController);

router.put("/user/image/:id", requierePermiso('USR_EDIT_PROF', 'UPDATE'), upload.single('image'), usr.updateImgController);

router.put("/user/:id", requierePermiso('USR_EDIT_PROF', 'UPDATE'), userValid.PerfilUsuario, errorHandlerValidate, usr.updateUserController);

router.put("/user/password/:id", requierePermiso('SYS_PREF_UPDATE', 'UPDATE'), userValid.CambioPassword, errorHandlerValidate, usr.resetPasswordController);

router.put("/user/preferences/:id", requierePermiso('SYS_PREF_UPDATE', 'UPDATE'), usr.setPreferenceController);

router.get("/user/details/:id", requierePermiso('USR_VIEW_ONE', 'READ'), usr.getUserDetailController);

router.get("/sso/federated", requierePermiso('USR_VIEW_ONE', 'READ'), usr.getFederateDataController);

router.get("/utl/file/download", usr.downloadStream)


export default router;
//falta api para actualizar datos empresariales de usuario