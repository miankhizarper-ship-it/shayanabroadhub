/**
 * Frontend API client — the single doorway to the backend.
 *
 * Every admin/public module in `src/lib/api/` goes through here so
 * base URL, credentials, JSON parsing and error shaping live in
 * exactly one place. Session auth relies on the backend's httpOnly
 * cookie (same-origin), so no token ever touches localStorage.
 *
 * Errors are normalized to ApiError:
 *   { status, code, message, details? }  — details maps field → message
 */

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code ?? "request_failed";
    this.details = details ?? null;
  }

  /** True for authentication failures the UI should react to. */
  get isAuthError() {
    return this.status === 401;
  }

  /** True for validation failures with per-field details. */
  get isValidationError() {
    return this.status === 422 && Boolean(this.details);
  }
}

const BASE = "/api";

/**
 * Perform an API request. Returns the parsed `data` payload on
 * success; throws ApiError otherwise.
 *
 * @param {string} path  API path beginning with "/"
 * @param {{ method?: string, body?: unknown, signal?: AbortSignal }} [options]
 * @returns {Promise<any>}
 */
export async function request(path, { method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      credentials: "same-origin",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError(0, "network_error", "Cannot reach the server — check your connection and try again.");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    /* non-JSON (should not happen) */
  }

  if (!response.ok || payload?.success === false) {
    const error = payload?.error;
    throw new ApiError(
      response.status,
      error?.code,
      error?.message ?? `Request failed (${response.status}).`,
      error?.details,
    );
  }

  return payload?.data ?? null;
}

/** Convenience verbs used by the domain modules. */
export const apiGet = (path, options) => request(path, { ...options, method: "GET" });
export const apiPost = (path, body, options) => request(path, { ...options, method: "POST", body });
export const apiPut = (path, body, options) => request(path, { ...options, method: "PUT", body });
export const apiPatch = (path, body, options) => request(path, { ...options, method: "PATCH", body });
export const apiDelete = (path, options) => request(path, { ...options, method: "DELETE" });
