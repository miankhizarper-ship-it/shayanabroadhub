import { Router } from "express";
import { login, logout, me } from "../controllers/authController.js";
import { requireAdmin, requireAuthConfigured } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/rateLimiters.js";

/**
 * /api/auth routes — admin session lifecycle.
 */
const router = Router();

router.post("/login", loginLimiter, requireAuthConfigured, login);
router.post("/logout", logout);
router.get("/me", requireAuthConfigured, requireAdmin, me);

export default router;
