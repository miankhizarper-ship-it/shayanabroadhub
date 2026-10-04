/**
 * API → UI adapters.
 *
 * The public components were built against stable view shapes
 * (BlogCard post, gallery tile, resource card…). These pure
 * functions map API documents onto those shapes, so the polished
 * UI keeps working byte-for-byte while the data source is the API.
 * Unknown/missing fields degrade gracefully (hidden badges, null
 * images fall back to the tonal placeholder).
 */

import { markdownToBlocks } from "../utils/markdown";
import { optimizedImageSrc } from "../utils/images";
import { formatDate, initials } from "../utils/format";

/** API blog (list projection) → BlogCard/FeaturedBlogs post shape. */
export function adaptBlogPost(post) {
  if (!post) return null;
  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    cover: optimizedImageSrc(post.coverImage?.url ?? null, { width: 800 }),
    alt: post.coverImage?.altHint ?? post.seo?.title ?? post.title,
    author: {
      name: post.author ?? "Shayan",
      role: "Principal Consultant",
      initials: initials(post.author ?? "Shayan"),
    },
    date: post.publishedAt ?? post.updatedAt ?? null,
    readingTime: post.readingTime ?? 5,
    featured: Boolean(post.featured),
  };
}

/** API blog (detail projection) → BlogDetails view model. */
export function adaptBlogDetail(post) {
  if (!post) return null;
  return {
    ...adaptBlogPost(post),
    /* Detail cover renders full-width — allow a larger delivery. */
    cover: optimizedImageSrc(post.coverImage?.url ?? null, { width: 1600 }),
    content: markdownToBlocks(post.content ?? ""),
  };
}

const FALLBACK_SERVICE_ICONS = ["Compass", "Presentation", "Feather", "Landmark", "Mic"];

/** API service → public Services/Home card shape. */
export function adaptService(service, index = 0) {
  if (!service) return null;
  return {
    id: service.slug ?? service._id,
    icon: service.icon || FALLBACK_SERVICE_ICONS[index % FALLBACK_SERVICE_ICONS.length],
    tag: service.tag ?? "",
    title: service.title,
    tagline: service.tagline ?? "",
    description: service.description,
    benefits: Array.isArray(service.benefits) ? service.benefits : [],
    format: service.format ?? "",
    commitment: service.commitment ?? "",
    featured: Boolean(service.featured),
  };
}

/** API gallery item → public Gallery/Lightbox tile shape. */
export function adaptGalleryImage(item) {
  if (!item) return null;
  const width = item.image?.width ?? 0;
  const height = item.image?.height ?? 0;
  const orientation =
    width && height ? (height > width ? "portrait" : "landscape") : "landscape";
  return {
    id: item._id,
    /* Width covers both grid tiles and the lightbox without
       downloading originals. */
    src: optimizedImageSrc(item.image?.url ?? null, { width: 1200 }),
    alt: item.caption || item.title,
    title: item.title,
    category: item.category,
    caption: item.caption ?? "",
    orientation,
  };
}

/** API download → public resource card shape. */
export function adaptResource(item) {
  if (!item) return null;
  return {
    id: item._id,
    slug: item.slug,
    title: item.title,
    description: item.description,
    category: item.category,
    fileType: item.fileType,
    fileSize: item.fileSize || "",
    fileName: item.file?.name ?? "",
    fileUrl: item.file?.url ?? null,
    version: "",
    downloadCount: item.downloadCount ?? 0,
  };
}

/** ISO-ish date used by <time dateTime>. */
export function postDate(post) {
  return formatDate(post?.publishedAt ?? post?.updatedAt);
}
