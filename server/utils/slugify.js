/**
 * Slug generation — dependency-free, model-agnostic.
 *
 * Produces the same shape the `slugField` schema enforces:
 * lowercase, [a-z0-9], single hyphens, no leading/trailing hyphen.
 */

/** Convert arbitrary text into a URL-safe slug ("Hello, World!" → "hello-world"). */
export function slugify(text) {
  return String(text ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

/** True when the string is a valid slug per the shared schema rule. */
export function isSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value ?? ""));
}
