import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { getDashboard } from "../controllers/dashboardController.js";
import {
  listBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";
import {
  listGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from "../controllers/galleryController.js";
import {
  listDownloads,
  getDownload,
  createDownload,
  updateDownload,
  deleteDownload,
} from "../controllers/downloadController.js";
import {
  listMessages,
  getMessage,
  updateMessageStatus,
  deleteMessage,
} from "../controllers/messageController.js";
import { listPages, getPage, updatePage } from "../controllers/pageController.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";

/**
 * /api/admin routes — the entire CMS surface.
 * `requireAdmin` is applied once at the router level: every child
 * route (including future ones added here) is protected by default.
 */
const router = Router();

router.use(requireAdmin);

/* Dashboard statistics (single round-trip). */
router.get("/dashboard", getDashboard);

/* Blogs */
router.get("/blogs", listBlogs);
router.post("/blogs", createBlog);
router.get("/blogs/:id", getBlog);
router.put("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);

/* Categories */
router.get("/categories", listCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

/* Services */
router.get("/services", listServices);
router.post("/services", createService);
router.get("/services/:id", getService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

/* Gallery */
router.get("/gallery", listGallery);
router.post("/gallery", createGalleryItem);
router.put("/gallery/:id", updateGalleryItem);
router.delete("/gallery/:id", deleteGalleryItem);

/* Downloads */
router.get("/downloads", listDownloads);
router.post("/downloads", createDownload);
router.get("/downloads/:id", getDownload);
router.put("/downloads/:id", updateDownload);
router.delete("/downloads/:id", deleteDownload);

/* Messages */
router.get("/messages", listMessages);
router.get("/messages/:id", getMessage);
router.patch("/messages/:id/status", updateMessageStatus);
router.delete("/messages/:id", deleteMessage);

/* Pages (structured home/about/contact content) */
router.get("/pages", listPages);
router.get("/pages/:slug", getPage);
router.put("/pages/:slug", updatePage);

/* Settings */
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;
