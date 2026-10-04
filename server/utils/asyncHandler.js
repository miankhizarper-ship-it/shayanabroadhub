/**
 * Wrap async route handlers so rejected promises reach the
 * centralized error handler instead of hanging the request.
 *
 * @param {import("express").RequestHandler} handler
 * @returns {import("express").RequestHandler}
 */
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
