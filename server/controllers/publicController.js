import { Blog } from "../models/Blog.js";
import { Service } from "../models/Service.js";
import { Gallery } from "../models/Gallery.js";
import { Download } from "../models/Download.js";
import { Page } from "../models/Page.js";
import { connectDB } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { isObjectId, listPayload, parsePagination, textSearch } from "../utils/query.js";
import { readSettings } from "./settingsController.js";
import { isEditablePageSlug } from "../validators/index.js";

/**
 * Public read endpoints — no authentication. Only published (or
 * order-approved) content is exposed, projections are tight, and
 * every list is paginated/capped. These power the public website's
 * journal, services, gallery, resource library and editable pages.
 */

/* ── Blogs ─────────────────────────────────────────────────── */

/**
 * GET /api/blogs?q=&category=&featured=&excludeFeatured=&exclude=&page=&limit=
 * Published only, newest first. Response includes the distinct
 * category list of published posts (powers the public filters).
 */
export const listPublicBlogs = asyncHandler(async (req, res) => {
  await connectDB();
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 9 });

  const filter = { status: "published" };
  const search = textSearch(["title", "excerpt", "category"], req.query.q);
  if (search) filter.$and = [search];
  if (req.query.category) filter.category = String(req.query.category).slice(0, 60);

  if (req.query.featured === "true") filter.featured = true;
  if (req.query.featured === "false") filter.featured = false;
  if (req.query.excludeFeatured === "true") filter.featured = { $ne: true };

  const exclude = String(req.query.exclude ?? "").slice(0, 120);
  if (exclude) filter.slug = { $ne: exclude };

  const projection =
    "slug title excerpt category author coverImage featured readingTime publishedAt updatedAt";

  const [items, total, categories] = await Promise.all([
    Blog.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(projection)
      .lean(),
    Blog.countDocuments(filter),
    Blog.distinct("category", { status: "published" }),
  ]);

  return sendSuccess(res, {
    ...listPayload({ items, total, page, limit }),
    categories: categories.filter(Boolean).sort((a, b) => a.localeCompare(b)),
  });
});

/** GET /api/blogs/:slug — a single published post with content. */
export const getPublicBlogBySlug = asyncHandler(async (req, res) => {
  await connectDB();

  const slug = String(req.params.slug ?? "").toLowerCase();
  const blog = await Blog.findOne({ slug, status: "published" })
    .select("-__v -seo")
    .lean();

  if (!blog) {
    return sendError(res, 404, "not_found", "This essay hasn't been published.");
  }

  /* Related: same category first, then most recent, excluding self. */
  const related = await Blog.find({
    status: "published",
    slug: { $ne: slug },
  })
    .sort({ publishedAt: -1 })
    .limit(6)
    .select("slug title excerpt category author coverImage featured readingTime publishedAt")
    .lean();

  const ordered = [
    ...related.filter((post) => post.category === blog.category),
    ...related.filter((post) => post.category !== blog.category),
  ].slice(0, 3);

  return sendSuccess(res, { post: blog, related: ordered });
});

/* ── Services ──────────────────────────────────────────────── */

/** GET /api/services — published catalogue, featured first. */
export const listPublicServices = asyncHandler(async (_req, res) => {
  await connectDB();

  const items = await Service.find({ status: "published" })
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .select(
      "slug title tagline description image benefits format commitment icon featured order",
    )
    .limit(24)
    .lean();

  return sendSuccess(res, { items, total: items.length });
});

/* ── Gallery ───────────────────────────────────────────────── */

/** GET /api/gallery?category= — curated archive (hard cap 100). */
export const listPublicGallery = asyncHandler(async (req, res) => {
  await connectDB();

  const filter = {};
  if (req.query.category) filter.category = String(req.query.category).slice(0, 60);

  const [items, categories] = await Promise.all([
    Gallery.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .select("title image category caption order")
      .limit(100)
      .lean(),
    Gallery.distinct("category"),
  ]);

  return sendSuccess(res, {
    items,
    total: items.length,
    categories: categories.filter(Boolean).sort((a, b) => a.localeCompare(b)),
  });
});

/* ── Downloads ─────────────────────────────────────────────── */

/** GET /api/downloads — published resource library. */
export const listPublicDownloads = asyncHandler(async (_req, res) => {
  await connectDB();

  const [items, categories] = await Promise.all([
    Download.find({ status: "published" })
      .sort({ createdAt: -1 })
      .select("slug title description file coverImage category fileType fileSize downloadCount")
      .limit(60)
      .lean(),
    Download.distinct("category", { status: "published" }),
  ]);

  return sendSuccess(res, {
    items,
    total: items.length,
    categories: categories.filter(Boolean).sort((a, b) => a.localeCompare(b)),
  });
});

/**
 * POST /api/downloads/:id/track — increments the public download
 * counter. Fire-and-forget semantics: invalid ids answer 404 and
 * are silently ignored by the frontend.
 */
export const trackDownload = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) {
    return sendError(res, 404, "not_found", "Unknown resource.");
  }
  const download = await Download.findByIdAndUpdate(
    req.params.id,
    { $inc: { downloadCount: 1 } },
    { returnDocument: "after" },
  )
    .select("downloadCount")
    .lean();
  if (!download) return sendError(res, 404, "not_found", "Unknown resource.");
  return sendSuccess(res, { downloadCount: download.downloadCount });
});

/* ── Site settings & pages ─────────────────────────────────── */

/** GET /api/site — public-safe site settings (contact, socials, SEO). */
export const getPublicSite = asyncHandler(async (_req, res) => {
  const settings = await readSettings();
  return sendSuccess(res, settings);
});

/** GET /api/pages/:slug — structured content for home/about/contact. */
export const getPublicPage = asyncHandler(async (req, res) => {
  if (!isEditablePageSlug(req.params.slug)) {
    return sendError(res, 404, "not_found", "That page does not exist.");
  }
  await connectDB();

  const doc = await Page.findOne({ slug: req.params.slug }).lean();
  return sendSuccess(res, {
    slug: req.params.slug,
    title: doc?.title ?? req.params.slug,
    sections: doc?.sections ?? {},
    updatedAt: doc?.updatedAt ?? null,
  });
});
