import { Service } from "../models/Service.js";
import { connectDB } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendValidationError, sendError } from "../utils/apiResponse.js";
import { validateService } from "../validators/index.js";
import { isObjectId, parsePagination, textSearch } from "../utils/query.js";

/**
 * Service CRUD — /api/admin/services.
 * Ordering via the `order` field (ascending, then newest first).
 */

const sendNotFound = (res) =>
  sendError(res, 404, "not_found", "The requested service does not exist.");

/** GET /api/admin/services?q=&status=&page=&limit= */
export const listServices = asyncHandler(async (req, res) => {
  await connectDB();
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });

  const filter = {
    ...(textSearch(["title", "tagline", "description"], req.query.q) ?? {}),
  };
  if (req.query.status === "draft" || req.query.status === "published") {
    filter.status = req.query.status;
  }

  const [items, total] = await Promise.all([
    Service.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Service.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    items: items.map(({ __v, ...doc }) => doc),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

/** GET /api/admin/services/:id */
export const getService = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);
  const service = await Service.findById(req.params.id).lean();
  if (!service) return sendNotFound(res);
  const { __v, ...doc } = service;
  return sendSuccess(res, doc);
});

/** POST /api/admin/services */
export const createService = asyncHandler(async (req, res) => {
  const { details, value } = validateService(req.body, { mode: "create" });
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  await connectDB();

  const payload = { ...value, slug: value.slug ?? slugFrom(value.title) };
  const service = await Service.create(payload);
  const { __v, ...doc } = service.toObject();
  return sendSuccess(res, doc, { status: 201 });
});

/** PUT /api/admin/services/:id */
export const updateService = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);

  const service = await Service.findById(req.params.id);
  if (!service) return sendNotFound(res);

  const merged = { ...service.toObject(), ...req.body };
  const { details, value } = validateService(merged, { mode: "create" });
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  const assign = (key) => {
    if (value[key] !== undefined) service[key] = value[key];
  };
  [
    "title", "slug", "tagline", "description", "image", "benefits",
    "format", "commitment", "icon", "order", "featured", "status", "seo",
  ].forEach(assign);

  await service.save();
  const { __v, ...doc } = service.toObject();
  return sendSuccess(res, doc);
});

/** DELETE /api/admin/services/:id */
export const deleteService = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);
  const service = await Service.findByIdAndDelete(req.params.id).lean();
  if (!service) return sendNotFound(res);
  return sendSuccess(res, { deleted: true, id: service._id.toString() });
});

function slugFrom(text) {
  const base = String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return base || `service-${Date.now()}`;
}
