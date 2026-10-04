import { getUploadSignature } from "../config/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendValidationError } from "../utils/apiResponse.js";
import { validateUploadSignatureRequest } from "../validators/index.js";

/**
 * Upload controllers — signed-upload foundation only.
 * (Media CRUD arrives in a later phase.)
 */

/**
 * POST /api/uploads/signature   (admin-only)
 * body: { folder: "blogs" | "services" | "gallery" | "downloads" | "profile",
 *         resourceType?: "image" | "raw" }
 *
 * Returns everything the browser needs to upload directly to
 * Cloudinary — and crucially NOT the API secret.
 */
export const createUploadSignature = asyncHandler(async (req, res) => {
  const { folder, resourceType } = validateUploadSignatureRequest(req.body);

  if (!folder) {
    return sendValidationError(res, { folder: "An upload folder is required." });
  }

  const signature = getUploadSignature({ folder, resourceType });
  return sendSuccess(res, signature);
});
