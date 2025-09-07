import express from "express";
import * as faCloud from "@controllers/2fa.controller";
import { authenticateRequest, requierePermiso } from "@middleware/authMiddleware";

const router = express.Router();

router.use(authenticateRequest);
router.post("/2fa/totp/generate", requierePermiso('SEC_2FA_ENABLE_SELF', 'UPDATE'), faCloud.generateSecretController);
router.post("/2fa/totp/verify", faCloud.verifySecretController);
router.delete("/2fa/totp/cancel/:id", requierePermiso('SEC_2FA_DISABLE_SELF', 'DELETE'), faCloud.cancelSecretController)

export default router;
