import express from "express";
import * as clent from "@controllers/client.controller";
import { upload } from '@config/multer';
import { authenticateRequest, requierePermiso } from "@middleware/authMiddleware";

const router = express.Router();

router.use(authenticateRequest);
router.get("/client/:id", requierePermiso('APP_VIEW', 'READ'), clent.getClientByIdController);

router.post("/client", requierePermiso('APP_CREATE', 'CREATE'), clent.createClientController);//FALTA AGREGAR

router.get("/clients", requierePermiso('APP_VIEW', 'READ'), clent.getClientsController);

router.post("/client/grants/:id", requierePermiso('APP_GRANTS_MANAGE', 'UPDATE'), clent.createGrantsController);

router.delete("/client/:id", requierePermiso('APP_DELETE', 'DELETE'), clent.deleteClientController)

router.put("/client/:id", requierePermiso('APP_UPDATE', 'UPDATE'), clent.updateClientController);

router.get("/client/grants", requierePermiso('APP_VIEW', 'READ'), clent.listGrantsController);

router.put("/client/file/:id", requierePermiso('APP_UPDATE', 'UPDATE'), upload.single('image'), clent.putImageClient);

export default router;
