/**
 * List-query helpers — safe parsing for pagination, search and
 * filter parameters shared by every admin/public listing endpoint.
 * Never trusts client input: bounds-checked ints + escaped regexes.
 */

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

/**
 * Parse `page`/`limit` query params with bounds.
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function parsePagination(query, { defaultLimit = DEFAULT_PAGE_SIZE } = {}) {
  const page = Math.max(1, Number.parseInt(query?.page, 10) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number.parseInt(query?.limit, 10) || defaultLimit),
  );
  return { page, limit, skip: (page - 1) * limit };
}

/** Escape a user string for safe embedding in a RegExp. */
export function escapeRegExp(text) {
  return String(text ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Case-insensitive "contains" matcher for text search across fields.
 * The needle is length-capped so oversized query strings can never
 * produce pathological regexes, and user input is regex-escaped.
 * @param {string[]} fields document fields to match against
 * @param {string} search raw user input
 */
export function textSearch(fields, search) {
  const needle = String(search ?? "").trim().slice(0, 120);
  if (!needle) return null;
  const pattern = new RegExp(escapeRegExp(needle), "i");
  return {
    $or: fields.map((field) => ({ [field]: { $regex: pattern } })),
  };
}

/** Coerce a tri-state boolean query param ("true"/"false" only). */
export function parseTriState(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

/** Build the standard list payload returned by every listing endpoint. */
export function listPayload({ items, total, page, limit }) {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/** True when the string is a valid MongoDB ObjectId. */
export function isObjectId(value) {
  return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
}
