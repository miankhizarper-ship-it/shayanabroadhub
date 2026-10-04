/**
 * Consistent JSON response helpers.
 *
 * Every endpoint responds with one of two shapes:
 *   success: { success: true, data: … }
 *   failure: { success: false, error: { code, message, details? } }
 *
 * (The deployment probe /api/health additionally keeps its
 * long-lived `status: "ok"` key for uptime-monitor compatibility.)
 */

export function sendSuccess(res, data, { status = 200 } = {}) {
  return res.status(status).json({ success: true, data });
}

export function sendError(res, status, code, message, details) {
  const error = { code, message };
  if (details) error.details = details;
  return res.status(status).json({ success: false, error });
}

/** Standard validation failure — 422 with per-field details. */
export function sendValidationError(res, details) {
  return sendError(res, 422, "validation_failed", "Some fields need attention.", details);
}

/** Generic 401 — message is deliberately identical for every
 *  authentication failure to prevent account enumeration. */
export function sendUnauthorized(res, message = "Authentication required.") {
  return sendError(res, 401, "unauthorized", message);
}
