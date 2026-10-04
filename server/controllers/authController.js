import { Admin } from "../models/Admin.js";
import { connectDB } from "../config/db.js";
import { signAdminToken } from "../utils/jwt.js";
import { verifyPassword } from "../utils/password.js";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  clearAdminCookieOptions,
} from "../utils/cookies.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendUnauthorized, sendValidationError } from "../utils/apiResponse.js";
import { validateLogin } from "../validators/index.js";

/**
 * Auth controllers — admin session lifecycle.
 *
 * Security posture:
 *  - one generic failure message for unknown email, wrong password
 *    AND deactivated accounts (no account enumeration);
 *  - httpOnly cookie session, JWT verified against the DB on every
 *    protected request;
 *  - lastLogin updated on success (used by the future dashboard);
 *  - no credential values ever logged.
 */

/** POST /api/auth/login — body: { email, password } */
export const login = asyncHandler(async (req, res) => {
  const { details, email, password } = validateLogin(req.body);
  if (Object.keys(details).length > 0) {
    return sendValidationError(res, details);
  }

  await connectDB();

  const admin = await Admin.findOne({ email }).select("+passwordHash");
  const passwordMatches = admin
    ? await verifyPassword(password, admin.passwordHash)
    : /* constant-ish work even for unknown emails */ verifyPassword(
        password,
        "$2a$12$C6UzMDM.H6dfI/f/IKcEeO7ZbnCuE1AwUJNv9nx3rQ3gYrPjMRJ2W",
      );

  /* Generic failure — identical shape/timing message for all causes. */
  if (!admin || !passwordMatches || !admin.isActive) {
    if (admin && passwordMatches && !admin.isActive) {
      console.warn("[auth:login_rejected] inactive account attempted sign-in");
    }
    return sendUnauthorized(res, "Invalid email or password.");
  }

  admin.lastLogin = new Date();
  await admin.save();

  const token = signAdminToken({ id: admin._id.toString(), role: admin.role });
  res.cookie(ADMIN_COOKIE_NAME, token, adminCookieOptions());

  return sendSuccess(res, {
    admin: {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
      lastLogin: admin.lastLogin,
    },
  });
});

/** POST /api/auth/logout — clears the session cookie. */
export function logout(_req, res) {
  res.clearCookie(ADMIN_COOKIE_NAME, clearAdminCookieOptions());
  return sendSuccess(res, { message: "Signed out." });
}

/** GET /api/auth/me — protected; returns the session admin. */
export function me(req, res) {
  const { id, name, email, role, lastLogin } = req.admin;
  return sendSuccess(res, { admin: { id, name, email, role, lastLogin } });
}
