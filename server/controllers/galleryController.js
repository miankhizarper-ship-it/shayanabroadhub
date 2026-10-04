import { Gallery } from "../models/Gallery.js";
import { connectDB } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendValidationError, sendError } from "../utils/apiResponse.js";
import { validateGallery } from "../validators/index.js";
import { deleteCloudinaryAsset } from "../config/cloudinary.js";
import { isObjectId, listPayload, parsePagination, textSearch } from "../utils/query.js";

/**
 * Gallery CRUD — /api/admin/gallery.
 *
 * Media lives in Cloudinary (browser uploads directly with signed
 * params — see /api/uploads/signature); MongoDB stores the asset
 * reference. Deletion removes the record first, then attempts the
 * Cloudinary destroy best-effort: a CDN hiccup never blocks the
 * admin flow, it is reported as `mediaDeleted: false`.
 */

const sendNotFound = (res) =>
  sendError(res, 404, "not_found", "The requested gallery image does not exist.");

/** GET /api/admin/gallery?q=&category=&page=&limit= */
export const listGallery = asyncHandler(async (req, res) => {
  await connectDB();
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 24 });

  const filter = {
    ...(textSearch(["title", "caption", "category"], req.query.q) ?? {}),
  };
  if (req.query.category) filter.category = String(req.query.category).slice(0, 60);

  const [items, total] = await Promise.all([
    Gallery.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Gallery.countDocuments(filter),
  ]);

  return sendSuccess(
    res,
    listPayload({ items: items.map(({ __v, ...doc }) => doc), total, page, limit }),
  );
});

/** POST /api/admin/gallery */
export const createGalleryItem = asyncHandler(async (req, res) => {
  const { details, value } = validateGallery(req.body, { mode: "create" });
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  await connectDB();
  const item = await Gallery.create(value);
  const { __v, ...doc } = item.toObject();
  return sendSuccess(res, doc, { status: 201 });
});

/** PUT /api/admin/gallery/:id */
export const updateGalleryItem = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);

  const item = await Gallery.findById(req.params.id);
  if (!item) return sendNotFound(res);

  const merged = { ...item.toObject(), ...req.body };
  const { details, value } = validateGallery(merged, { mode: "create" });
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  const assign = (key) => {
    if (value[key] !== undefined) item[key] = value[key];
  };
  ["title", "image", "category", "caption", "order"].forEach(assign);

  await item.save();
  const { __v, ...doc } = item.toObject();
  return sendSuccess(res, doc);
});

/**
 * DELETE /api/admin/gallery/:id
 * MongoDB record removed first (source of truth), Cloudinary asset
 * destroyed best-effort afterwards.
 */
export const deleteGalleryItem = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);

  const item = await Gallery.findById(req.params.id).lean();
  if (!item) return sendNotFound(res);

  await Gallery.findByIdAndDelete(item._id);
  const media = await deleteCloudinaryAsset(
    item.image?.publicId,
    "image",
  );

  return sendSuccess(res, {
    deleted: true,
    id: item._id.toString(),
    mediaDeleted: media.deleted,
    ...(media.deleted ? {} : { mediaNote: `Cloudinary asset left in place (${media.reason}).` }),
  });
});
