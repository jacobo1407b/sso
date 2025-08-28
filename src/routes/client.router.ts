import express from "express";
import * as clent from "@controllers/client.controller";
import { upload } from '@config/multer';
import { authenticateRequest, requierePermiso } from "@middleware/authMiddleware";

const router = express.Router();

router.use(authenticateRequest);
router.use(requierePermiso(['APP_MANAGER', 'ADMIN_SSO']));
router.get("/client/:id", clent.getClientByIdController);

router.post("/client", upload.single('image'), clent.createClientController);

router.get("/clients", clent.getClientsController);

router.post("/client/grants/:id", clent.createGrantsController);

router.delete("/client/:id", clent.deleteClientController)

router.put("/client/:id", upload.single('image'), clent.updateClientController);

router.get("/client/grants", clent.listGrantsController);

export default router;
