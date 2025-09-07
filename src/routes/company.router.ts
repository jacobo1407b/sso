import express from "express";
import * as company from "@controllers/company.controller";
import { authenticateRequest, requierePermiso } from "@middleware/authMiddleware";

const router = express.Router();

router.use(authenticateRequest);

router.get("/company/:id", requierePermiso('BUS_UNIT_VIEW', 'READ'), company.getOneBusinessController);
router.get("/companys", requierePermiso('BUS_UNIT_VIEW', 'READ'), company.listBusinessController);
router.post("/company", requierePermiso('BUS_UNIT_CREATE', 'CREATE'), company.createBuController);
router.put("/company/:id", requierePermiso('BUS_UNIT_UPDATE', 'UPDATE'), company.aptBuController);
router.put("/company/branch/:location/:branch", requierePermiso('BUS_UNIT_UPDATE', 'UPDATE'), company.aptBranchController);
router.delete("/company/branch/:branch", requierePermiso('BUS_UNIT_DELETE', 'DELETE'), company.deleteBranchController);
router.delete("/company/:unit", requierePermiso('BUS_UNIT_DELETE', 'DELETE'), company.deleteUnitController);
router.post("/company/branch/:unit", requierePermiso('BRANCH_CREATE', 'CREATE'), company.createBranchController);
router.put("/company/file/:id", requierePermiso('BUS_UNIT_UPDATE', 'UPDATE'), company.putImageBuController);

export default router;