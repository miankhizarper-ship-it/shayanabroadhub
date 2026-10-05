/**
 * Image URL helpers.
 *
 * All public imagery is admin-uploaded (Cloudinary via the signed
 * upload flow) — there are no built-in stock photos anywhere in the
 * UI. Sections without an uploaded image render branded tonal tiles
 * instead, so nothing flashes before real content arrives.
 */

const CLOUDINARY_UPLOAD = "/image/upload/";

/**
 * Inject responsive delivery transformations into Cloudinary URLs.
 *
 * `f_auto` lets the CDN pick the best format (WebP/AVIF), `q_auto`
 * optimizes quality per image, and `w_` caps the width so visitors
 * never download huge originals. Non-Cloudinary URLs pass through
 * untouched (e.g. pasted external links).
 *
 * @param {string} url the stored asset URL
 * @param {{ width?: number }} [opts] intended render width in px
 * @returns {string}
 */
export function optimizedImageSrc(url, { width } = {}) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes(CLOUDINARY_UPLOAD)) {
    return url;
  }
  const params = width
    ? `f_auto,q_auto,w_${Math.max(320, Math.round(width))}`
    : "f_auto,q_auto";
  return url.replace(CLOUDINARY_UPLOAD, `/image/upload/${params}/`);
}
