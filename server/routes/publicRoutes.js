import { Router } from "express";
import { contactLimiter, trackLimiter } from "../middleware/rateLimiters.js";
import {
  listPublicBlogs,
  getPublicBlogBySlug,
  listPublicServices,
  listPublicGallery,
  listPublicDownloads,
  trackDownload,
  getPublicSite,
  getPublicPage,
} from "../controllers/publicController.js";
import { submitContact } from "../controllers/contactController.js";

/**
 * /api public routes — published content reads for the public
 * website plus the unauthenticated (rate-limited, validated)
 * contact submission endpoint.
 */
const router = Router();

/* Blogs — published only. */
router.get("/blogs", listPublicBlogs);
router.get("/blogs/:slug", getPublicBlogBySlug);

/* Services — published catalogue. */
router.get("/services", listPublicServices);

/* Gallery — curated archive. */
router.get("/gallery", listPublicGallery);

/* Downloads — published library + counter track ping. */
router.get("/downloads", listPublicDownloads);
router.post("/downloads/:id/track", trackLimiter, trackDownload);

/* Public contact form (rate-limited, validated, stored as unread). */
router.post("/contact", contactLimiter, submitContact);

/* Site settings + editable page content (public-safe projections). */
router.get("/site", getPublicSite);
router.get("/pages/:slug", getPublicPage);

export default router;
