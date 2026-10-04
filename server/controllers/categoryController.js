import { Category } from "../models/Category.js";
import { Blog } from "../models/Blog.js";
import { Gallery } from "../models/Gallery.js";
import { Download } from "../models/Download.js";
import { connectDB } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendValidationError, sendError } from "../utils/apiResponse.js";
import { validateCategory } from "../validators/index.js";
import { isObjectId, textSearch } from "../utils/query.js";

/**
 * Category CRUD — /api/admin/categories.
 *
 * Documents across blogs/gallery/downloads reference categories by
 * their display name (query-friendly for the public site), so a
 * category that is still in use cannot be deleted — the endpoint
 * refuses with 409 and the usage counts instead of leaving
 * broken references behind.
 */

const sendNotFound = (res) =>
  sendError(res, 404, "not_found", "The requested category does not exist.");

/** GET /api/admin/categories?q= — includes per-collection usage counts. */
export const listCategories = asyncHandler(async (req, res) => {
  await connectDB();

  const filter = textSearch(["name", "slug", "description"], req.query.q) ?? {};
  const [categories, blogCounts, galleryCounts, downloadCounts] = await Promise.all([
    Category.find(filter).sort({ name: 1 }).lean(),
    Blog.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    Gallery.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    Download.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);

  const toMap = (rows) =>
    rows.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});
  const blogs = toMap(blogCounts);
  const gallery = toMap(galleryCounts);
  const downloads = toMap(downloadCounts);

  return sendSuccess(res, {
    items: categories.map(({ __v, ...doc }) => ({
      ...doc,
      usage: {
        blogs: blogs[doc.name] ?? 0,
        gallery: gallery[doc.name] ?? 0,
        downloads: downloads[doc.name] ?? 0,
      },
    })),
    total: categories.length,
  });
});

/** POST /api/admin/categories */
export const createCategory = asyncHandler(async (req, res) => {
  const { details, value } = validateCategory(req.body, { mode: "create" });
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  await connectDB();

  /* Duplicate guards give friendly messages before Mongo's 11000. */
  const name = value.name;
  const slug = value.slug ?? slugifyCategory(name);
  const duplicate = await Category.findOne({ $or: [{ name }, { slug }] }).lean();
  if (duplicate) {
    const field = duplicate.name === name ? "name" : "slug";
    return sendValidationError(res, {
      [field]:
        field === "name"
          ? "A category with this name already exists."
          : "A category with this slug already exists.",
    });
  }

  const category = await Category.create({ ...value, slug });
  const { __v, ...doc } = category.toObject();
  return sendSuccess(res, doc, { status: 201 });
});

/** PUT /api/admin/categories/:id */
export const updateCategory = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);

  const category = await Category.findById(req.params.id);
  if (!category) return sendNotFound(res);

  const merged = { ...category.toObject(), ...req.body };
  const { details, value } = validateCategory(merged, { mode: "create" });
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  const nextName = value.name ?? category.name;
  const nextSlug = value.slug ?? slugifyCategory(nextName);
  const duplicate = await Category.findOne({
    _id: { $ne: category._id },
    $or: [{ name: nextName }, { slug: nextSlug }],
  }).lean();
  if (duplicate) {
    const field = duplicate.name === nextName ? "name" : "slug";
    return sendValidationError(res, {
      [field]:
        field === "name"
          ? "A category with this name already exists."
          : "A category with this slug already exists.",
    });
  }

  /* If the display name changes, cascade it to every referencing
     collection so no document is left pointing at the old name. */
  if (nextName !== category.name) {
    await Promise.all([
      Blog.updateMany({ category: category.name }, { $set: { category: nextName } }),
      Gallery.updateMany({ category: category.name }, { $set: { category: nextName } }),
      Download.updateMany({ category: category.name }, { $set: { category: nextName } }),
    ]);
  }

  category.name = nextName;
  category.slug = nextSlug;
  if (value.description !== undefined) category.description = value.description;

  await category.save();
  const { __v, ...doc } = category.toObject();
  return sendSuccess(res, doc);
});

/**
 * DELETE /api/admin/categories/:id — refused with 409 while blogs,
 * gallery items or downloads still reference the category.
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);

  const category = await Category.findById(req.params.id).lean();
  if (!category) return sendNotFound(res);

  const [blogCount, galleryCount, downloadCount] = await Promise.all([
    Blog.countDocuments({ category: category.name }),
    Gallery.countDocuments({ category: category.name }),
    Download.countDocuments({ category: category.name }),
  ]);
  const inUse = blogCount + galleryCount + downloadCount;

  if (inUse > 0) {
    return sendError(
      res,
      409,
      "category_in_use",
      `This category is still used by ${inUse} item${inUse === 1 ? "" : "s"} — reassign them first.`,
      { blogs: blogCount, gallery: galleryCount, downloads: downloadCount, total: inUse },
    );
  }

  await Category.findByIdAndDelete(category._id);
  return sendSuccess(res, { deleted: true, id: category._id.toString() });
});

function slugifyCategory(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
