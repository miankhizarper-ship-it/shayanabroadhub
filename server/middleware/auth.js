import { Admin } from "../models/Admin.js";
import { connectDB } from "../config/db.js";
import { verifyAdminToken } from "../utils/jwt.js";
import { ADMIN_COOKIE_NAME, clearAdminCookieOptions } from "../utils/cookies.js";
import { sendUnauthorized, sendError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * requireAdmin — protects every admin-scoped route.
 *
 * 1. Extract the session token (httpOnly cookie, with an
 *    Authorization: Bearer fallback for API clients).
 * 2. Verify signature, issuer, audience and expiry.
 * 3. Load the admin from the database — a valid token for a
 *    deactivated account is rejected and its cookie cleared.
 * 4. Attach the safe admin document to req.admin.
 */
export const requireAdmin = asyncHandler(async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[ADMIN_COOKIE_NAME] ?? bearer;

  if (!token) {
    return sendUnauthorized(res);
  }

  let payload;
  try {
    payload = verifyAdminToken(token);
  } catch {
    res.clearCookie(ADMIN_COOKIE_NAME, clearAdminCookieOptions());
    return sendUnauthorized(res, "Your session has expired. Please sign in again.");
  }

  await connectDB();
  const admin = await Admin.findById(payload.sub).select("-passwordHash");

  if (!admin || !admin.isActive) {
    res.clearCookie(ADMIN_COOKIE_NAME, clearAdminCookieOptions());
    return sendUnauthorized(res, "Your session has expired. Please sign in again.");
  }

  req.admin = admin;
  return next();
});

/**
 * requireAuthConfigured — returns 503 with a clear message when
 * JWT_SECRET is missing, instead of an opaque failure.
 */
export function requireAuthConfigured(req, res, next) {
  if (!process.env.JWT_SECRET) {
    return sendError(
      res,
      503,
      "auth_not_configured",
      "Authentication is not configured — set the JWT_SECRET environment variable.",
    );
  }
  return next();
}
