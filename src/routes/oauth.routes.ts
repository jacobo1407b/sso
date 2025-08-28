import express from "express";
import { authTokenController, autorizeController, revokTokenController, autorizeCode } from "@controllers/oauth.controller";
import { authenticateRequest } from "@middleware/authMiddleware";

const router = express.Router();

router.post("/token", authTokenController);
router.get("/authorize", autorizeController);
router.post("/authorize", autorizeCode)
router.delete("/revok", authenticateRequest, revokTokenController);

export default router;
