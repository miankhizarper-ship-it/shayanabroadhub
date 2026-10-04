/**
 * Remote image helpers.
 *
 * All imagery comes from Unsplash's image CDN (stable photo IDs,
 * verified reachable at build time). Centralising URL construction
 * here means switching to Cloudinary-delivered assets in a later
 * phase is a one-file change.
 */

const UNSPLASH = "https://images.unsplash.com";

/**
 * Build a sized, optimized Unsplash URL for a photo ID.
 *
 * @param {string} id Unsplash photo id, e.g. "photo-1499…"
 * @param {{ w?: number, h?: number }} [opts] width/height in px
 * @returns {string}
 */
export function unsplash(id, { w = 1600, h } = {}) {
  const params = new URLSearchParams({
    q: "80",
    auto: "format",
    fit: "crop",
    w: String(w),
  });
  if (h) params.set("h", String(h));
  return `${UNSPLASH}/${id}?${params.toString()}`;
}

/** Curated photo ids used across the site (single source of truth). */
export const photos = {
  portraitPrimary: "photo-1573496359142-b8d87734a5a2",
  portraitSecondary: "photo-1580489944761-15a19d654956",
  portraitWorking: "photo-1573497019940-1c28c88b4f3e",
  openBook: "photo-1512820790803-83ca734da794",
  teamHands: "photo-1521737604893-d14cc237f11d",
};

const CLOUDINARY_UPLOAD = "/image/upload/";

/**
 * Inject responsive delivery transformations into Cloudinary URLs.
 *
 * `f_auto` lets the CDN pick the best format (WebP/AVIF), `q_auto`
 * optimizes quality per image, and `w_` caps the width so visitors
 * never download huge originals. Non-Cloudinary URLs pass through
 * untouched (Unsplash links are already sized by unsplash() above).
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
