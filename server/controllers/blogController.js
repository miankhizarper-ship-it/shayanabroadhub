import { Blog } from "../models/Blog.js";
import { connectDB } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendValidationError, sendError } from "../utils/apiResponse.js";
import { validateBlog } from "../validators/index.js";
import {
  isObjectId,
  listPayload,
  parsePagination,
  parseTriState,
  textSearch,
} from "../utils/query.js";

const sendNotFound = (res) =>
  sendError(res, 404, "not_found", "The requested blog does not exist.");

/**
 * Blog CRUD — /api/admin/blogs (requireAdmin enforced at the router).
 *
 * Listing supports search (title/excerpt/category), category filter,
 * status filter, featured filter and server-side pagination.
 * `publishedAt` is server-owned: set when a blog first transitions
 * to published, never client-supplied.
 */

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  title: { title: 1 },
  updatedAt: { updatedAt: -1 },
};

/** GET /api/admin/blogs?q=&category=&status=&featured=&page=&limit=&sort= */
export const listBlogs = asyncHandler(async (req, res) => {
  await connectDB();
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {
    ...(textSearch(["title", "excerpt", "category"], req.query.q) ?? {}),
  };
  if (req.query.category) filter.category = String(req.query.category).slice(0, 60);
  if (req.query.status === "draft" || req.query.status === "published") {
    filter.status = req.query.status;
  }
  const featured = parseTriState(req.query.featured);
  if (featured !== undefined) filter.featured = featured;

  const sort = SORTS[req.query.sort] ?? SORTS.updatedAt;

  const [items, total] = await Promise.all([
    Blog.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Blog.countDocuments(filter),
  ]);

  return sendSuccess(
    res,
    listPayload({ items: items.map(({ __v, ...doc }) => doc), total, page, limit }),
  );
});

/** GET /api/admin/blogs/:id */
export const getBlog = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);
  const blog = await Blog.findById(req.params.id).lean();
  if (!blog) return sendNotFound(res);
  const { __v, ...doc } = blog;
  return sendSuccess(res, doc);
});

/**
 * POST /api/admin/blogs — body: validated blog fields.
 * Auto-generates the slug from the title when not supplied.
 */
export const createBlog = asyncHandler(async (req, res) => {
  const { details, value } = validateBlog(req.body, { mode: "create" });
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  await connectDB();

  const payload = { ...value, slug: value.slug ?? slugFrom(value.title, value.category) };
  if (payload.status === "published") payload.publishedAt = new Date();

  const blog = await Blog.create(payload);
  const { __v, ...doc } = blog.toObject();
  return sendSuccess(res, doc, { status: 201 });
});

/**
 * PUT /api/admin/blogs/:id — partial update; the incoming payload is
 * merged over the stored document, then validated as a whole so
 * "required" fields can never be erased through a partial body.
 */
export const updateBlog = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);

  const blog = await Blog.findById(req.params.id);
  if (!blog) return sendNotFound(res);

  const merged = {
    ...blog.toObject(),
    ...req.body,
  };
  const { details, value } = validateBlog(merged, { mode: "create" });
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  /* Explicitly whitelisted assignment — undefined keys are skipped. */
  const assign = (key) => {
    if (value[key] !== undefined) blog[key] = value[key];
  };
  ["title", "slug", "excerpt", "content", "category", "author", "status", "featured", "readingTime", "coverImage", "seo"].forEach(assign);

  /* publishedAt transitions: first publish stamps the date; the
     value survives unpublishing for editorial history. */
  if (blog.status === "published" && !blog.publishedAt) {
    blog.publishedAt = new Date();
  }

  await blog.save();
  const { __v, ...doc } = blog.toObject();
  return sendSuccess(res, doc);
});

/** DELETE /api/admin/blogs/:id */
export const deleteBlog = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);
  const blog = await Blog.findByIdAndDelete(req.params.id).lean();
  if (!blog) return sendNotFound(res);
  return sendSuccess(res, { deleted: true, id: blog._id.toString() });
});

function slugFrom(title, category) {
  const base = String(title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return base || `post-${Date.now()}-${String(category ?? "").toLowerCase().slice(0, 12)}`;
}
