import express from "express";
import * as rols from "@controllers/role.controller"
import { authenticateRequest, requierePermiso } from "@middleware/authMiddleware";

const router = express.Router();

router.use(authenticateRequest);
router.use(requierePermiso(['IAM', 'ADMIN_SSO']));

router.get("/rols", rols.getRolsController)

router.get("/rol/:id", rols.getRolsUniqID);

router.post("/rols/:id", rols.assigmentController);

router.post("/rol", rols.createRolController)

export default router;