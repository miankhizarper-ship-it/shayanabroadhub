import { Download } from "../models/Download.js";
import { connectDB } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendValidationError, sendError } from "../utils/apiResponse.js";
import { validateDownload } from "../validators/index.js";
import { deleteCloudinaryAsset } from "../config/cloudinary.js";
import { isObjectId, listPayload, parsePagination, textSearch } from "../utils/query.js";

/**
 * Download CRUD — /api/admin/downloads.
 * Files live in Cloudinary (`raw` uploads); downloadCount is
 * incremented by the public track endpoint and surfaced here.
 */

const sendNotFound = (res) =>
  sendError(res, 404, "not_found", "The requested download does not exist.");

/** GET /api/admin/downloads?q=&category=&status=&page=&limit= */
export const listDownloads = asyncHandler(async (req, res) => {
  await connectDB();
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });

  const filter = {
    ...(textSearch(["title", "description", "category"], req.query.q) ?? {}),
  };
  if (req.query.category) filter.category = String(req.query.category).slice(0, 60);
  if (req.query.status === "draft" || req.query.status === "published") {
    filter.status = req.query.status;
  }

  const [items, total] = await Promise.all([
    Download.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Download.countDocuments(filter),
  ]);

  return sendSuccess(
    res,
    listPayload({ items: items.map(({ __v, ...doc }) => doc), total, page, limit }),
  );
});

/** GET /api/admin/downloads/:id */
export const getDownload = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);
  const download = await Download.findById(req.params.id).lean();
  if (!download) return sendNotFound(res);
  const { __v, ...doc } = download;
  return sendSuccess(res, doc);
});

/** POST /api/admin/downloads */
export const createDownload = asyncHandler(async (req, res) => {
  const { details, value } = validateDownload(req.body, { mode: "create" });
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  await connectDB();
  const payload = { ...value, slug: value.slug ?? slugFrom(value.title) };
  const download = await Download.create(payload);
  const { __v, ...doc } = download.toObject();
  return sendSuccess(res, doc, { status: 201 });
});

/** PUT /api/admin/downloads/:id */
export const updateDownload = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);

  const download = await Download.findById(req.params.id);
  if (!download) return sendNotFound(res);

  const merged = { ...download.toObject(), ...req.body };
  const { details, value } = validateDownload(merged, { mode: "create" });
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  const assign = (key) => {
    if (value[key] !== undefined) download[key] = value[key];
  };
  [
    "title", "slug", "description", "file", "coverImage", "category",
    "fileType", "fileSize", "status",
  ].forEach(assign);

  await download.save();
  const { __v, ...doc } = download.toObject();
  return sendSuccess(res, doc);
});

/**
 * DELETE /api/admin/downloads/:id — record first, Cloudinary raw
 * asset best-effort (same graceful contract as gallery).
 */
export const deleteDownload = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);

  const download = await Download.findById(req.params.id).lean();
  if (!download) return sendNotFound(res);

  await Download.findByIdAndDelete(download._id);
  const media = await deleteCloudinaryAsset(download.file?.publicId, "raw");

  return sendSuccess(res, {
    deleted: true,
    id: download._id.toString(),
    mediaDeleted: media.deleted,
    ...(media.deleted ? {} : { mediaNote: `Cloudinary asset left in place (${media.reason}).` }),
  });
});

function slugFrom(text) {
  const base = String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return base || `download-${Date.now()}`;
}
