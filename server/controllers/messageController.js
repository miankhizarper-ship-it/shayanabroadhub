import { Message } from "../models/Message.js";
import { connectDB } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendValidationError, sendError } from "../utils/apiResponse.js";
import { validateMessageStatus } from "../validators/index.js";
import { isObjectId, listPayload, parsePagination, textSearch } from "../utils/query.js";

/**
 * Message management — /api/admin/messages.
 * Messages are created by the public contact endpoint only; admins
 * read, mark (read/unread/archived) and delete them.
 */

const sendNotFound = (res) =>
  sendError(res, 404, "not_found", "The requested message does not exist.");

/** GET /api/admin/messages?q=&status=&page=&limit= */
export const listMessages = asyncHandler(async (req, res) => {
  await connectDB();
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 15 });

  const filter = {
    ...(textSearch(["name", "email", "subject", "message"], req.query.q) ?? {}),
  };
  if (["unread", "read", "archived"].includes(req.query.status)) {
    filter.status = req.query.status;
  }

  const [items, total, unreadCount] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments(filter),
    Message.countDocuments({ status: "unread" }),
  ]);

  return sendSuccess(res, {
    ...listPayload({
      items: items.map(({ __v, ...doc }) => doc),
      total,
      page,
      limit,
    }),
    unreadCount,
  });
});

/** GET /api/admin/messages/:id */
export const getMessage = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);
  const message = await Message.findById(req.params.id).lean();
  if (!message) return sendNotFound(res);
  const { __v, ...doc } = message;
  return sendSuccess(res, doc);
});

/** PATCH /api/admin/messages/:id/status — body: { status } */
export const updateMessageStatus = asyncHandler(async (req, res) => {
  const { details, status } = validateMessageStatus(req.body);
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);

  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { $set: { status } },
    { returnDocument: "after", runValidators: true },
  ).lean();
  if (!message) return sendNotFound(res);

  const { __v, ...doc } = message;
  return sendSuccess(res, doc);
});

/** DELETE /api/admin/messages/:id */
export const deleteMessage = asyncHandler(async (req, res) => {
  await connectDB();
  if (!isObjectId(req.params.id)) return sendNotFound(res);
  const message = await Message.findByIdAndDelete(req.params.id).lean();
  if (!message) return sendNotFound(res);
  return sendSuccess(res, { deleted: true, id: message._id.toString() });
});
