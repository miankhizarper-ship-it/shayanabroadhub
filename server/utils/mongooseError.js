import mongoose from "mongoose";

/**
 * Translate Mongoose driver errors into the API's standard error
 * contract before they reach the central error funnel, so every
 * controller can simply `throw` and responses stay consistent:
 *
 *   duplicate key (11000)      → 409 conflict
 *   mongoose ValidationError   → 422 with per-field details
 *   CastError (bad ObjectId)   → 404 not found
 *   anything else              → untouched (500 via the funnel)
 */

/** Map a mongoose/driver error to { status, code, message, details } — or null. */
export function toApiError(error) {
  if (!error) return null;

  /* Duplicate unique index — name which field conflicted. */
  if (error.code === 11000 || error.name === "MongoServerError" && error.code === 11000) {
    const fields = Object.keys(error.keyPattern ?? {}).join(", ") || "field";
    return {
      status: 409,
      code: "duplicate",
      message: `That ${fields} is already in use — choose a different value.`,
      details: { [fields.split(", ")[0] ?? "field"]: "Already in use." },
    };
  }

  /* Schema validation failure — per-field messages for the form. */
  if (error instanceof mongoose.Error.ValidationError) {
    const details = {};
    for (const [field, fieldError] of Object.entries(error.errors ?? {})) {
      details[field] = fieldError?.message ?? "Invalid value.";
    }
    return {
      status: 422,
      code: "validation_failed",
      message: "Some fields need attention.",
      details,
    };
  }

  /* Bad ObjectId or cast — treat as "no such document". */
  if (error instanceof mongoose.Error.CastError) {
    return {
      status: 404,
      code: "not_found",
      message: "The requested item does not exist.",
    };
  }

  return null;
}

/**
 * Express error-funnel pre-processor: rewrites recognized mongoose
 * errors onto the response using the standard sendError shape.
 * Returns true when the error was handled (short-circuit the funnel).
 */
export function sendMongooseErrorResponse(error, res, sendError) {
  const mapped = toApiError(error);
  if (!mapped) return false;
  sendError(res, mapped.status, mapped.code, mapped.message, mapped.details);
  return true;
}
