import { env } from "../config/env.js";

/**
 * Admin session cookie configuration.
 *
 * - httpOnly: invisible to JavaScript (XSS mitigation)
 * - SameSite=Lax: correct default for the Vercel same-domain
 *   deployment (SPA + /api on one origin); CSRF-safe for POSTs.
 * - secure: HTTPS-only in production.
 * - path scoped to /, max age matches JWT expiry.
 */

export const ADMIN_COOKIE_NAME = "sb_admin_session";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Options used when SETTING the session cookie. */
export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_MS,
  };
}

/** Options used when CLEARING the session cookie (must match). */
export function clearAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
}
