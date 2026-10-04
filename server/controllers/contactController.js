import { Message } from "../models/Message.js";
import { connectDB } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendValidationError } from "../utils/apiResponse.js";
import { validateContact } from "../validators/index.js";

/**
 * POST /api/contact — public contact-form submission.
 *
 * No authentication (by design); protected instead by the contact
 * rate limiter, strict validation, a honeypot field and the Message
 * schema itself. Bot submissions (honeypot filled) get the honest
 * success response but are silently dropped — nothing is stored.
 */
export const submitContact = asyncHandler(async (req, res) => {
  const { details, value, spam } = validateContact(req.body);
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  if (!spam) {
    await connectDB();
    await Message.create({ ...value, status: "unread" });
  }

  return sendSuccess(res, {
    message: "Thank you — your note has been received. Expect a personal reply within two business days.",
  });
});
