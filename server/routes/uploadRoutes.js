import { Router } from "express";
import { createUploadSignature } from "../controllers/uploadController.js";
import { requireAdmin } from "../middleware/auth.js";

/**
 * /api/uploads routes — signed-upload foundation (admin-only).
 * Only the signature endpoint exists in this phase.
 */
const router = Router();

router.post("/signature", requireAdmin, createUploadSignature);

export default router;
