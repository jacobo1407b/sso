import express from "express";
import * as company from "@controllers/company.controller";
import { authenticateRequest, requierePermiso } from "@middleware/authMiddleware";

const router = express.Router();

router.use(authenticateRequest);
router.use(requierePermiso(['USER_PROVICIONE', 'ADMIN_SSO']));

router.get("/company/:id", company.getOneBusinessController);
router.get("/companys", company.listBusinessController);
router.post("/company", company.createBuController);
router.put("/company/:id", company.aptBuController);
router.put("/company/branch/:location/:branch", company.aptBranchController);
router.delete("/company/branch/:branch", company.deleteBranchController);
router.delete("/company/:unit", company.deleteUnitController);
router.post("/company/branch/:unit", company.createBranchController);

export default router;