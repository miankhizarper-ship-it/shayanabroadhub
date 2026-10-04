import { Router } from "express";
import { healthController } from "../controllers/healthController.js";
import { getRobotsTxt, getSitemapXml } from "../controllers/seoController.js";

/**
 * API root router — everything mounted here lives under `/api`.
 * Health probe, SEO endpoints (robots.txt / sitemap.xml mapped by
 * vercel.json rewrites) — domain routes live in their own routers.
 */
const router = Router();

/* Deployment probe — no middleware, no DB connection. */
router.get("/health", healthController);

/* SEO infrastructure (clean paths via vercel.json rewrites). */
router.get("/robots.txt", getRobotsTxt);
router.get("/sitemap.xml", getSitemapXml);

export default router;
