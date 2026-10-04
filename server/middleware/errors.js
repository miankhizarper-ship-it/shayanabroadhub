import { env } from "../config/env.js";
import { sendError } from "../utils/apiResponse.js";
import { sendMongooseErrorResponse } from "../utils/mongooseError.js";

/**
 * API error middleware.
 */

/** 404 for unknown /api/* paths — JSON, never the SPA fallback. */
export function apiNotFoundHandler(req, res) {
  return sendError(
    res,
    404,
    "not_found",
    `No API route matches ${req.method} ${req.originalUrl}`,
  );
}

/**
 * Central error funnel — every thrown/rejected error lands here.
 * Production responses never include stack traces or driver
 * internals; the detailed cause stays in the function logs only.
 */
export function errorHandler(err, _req, res, _next) {
  /* Recognized mongoose/driver errors → standard 409/422/404 shapes. */
  if (sendMongooseErrorResponse(err, res, sendError)) return;

  const status = err.status ?? err.statusCode ?? 500;

  /* Log the real cause server-side, without leaking secrets. */
  const summary = `${err.name ?? "Error"}: ${err.message ?? "unknown"}`;
  if (status >= 500) {
    console.error("[api:error]", summary);
    if (!env.isProduction && err.stack) console.error(err.stack);
  } else {
    console.warn("[api:request_rejected]", summary);
  }

  const isDev = !env.isProduction;
  const message =
    status >= 500
      ? isDev
        ? err.message ?? "Internal server error"
        : "Internal server error"
      : err.message ?? "Request failed";

  return sendError(res, status, err.code ?? "request_failed", message);
}
