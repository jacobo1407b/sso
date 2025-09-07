import express from "express";
import * as rols from "@controllers/role.controller"
import { authenticateRequest, requierePermiso } from "@middleware/authMiddleware";

const router = express.Router();

router.use(authenticateRequest);

router.get("/rols", requierePermiso('PERM_VIEW', 'READ'), rols.getRolsController)

router.get("/rol/:id", requierePermiso('PERM_VIEW', 'READ'), rols.getRolsUniqID);

router.post("/rols/:id", requierePermiso('USR_ROLE_ASSIGN', 'UPDATE'), rols.assigmentController);

//router.post("/rol", rols.createRolController)

export default router;