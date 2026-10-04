/**
 * Domain input validators — dependency-free, hand-rolled, extending
 * the Phase 3 validator conventions: every rule returns a
 * { details, value } pair where `details` maps field → user-facing
 * message (empty object = valid) and `value` is the whitelisted,
 * normalized payload ready for the model.
 *
 * Server data is never trusted: unknown keys are dropped, types are
 * coerced explicitly, lengths match the Mongoose schemas.
 */

import { isSlug, slugify } from "../utils/slugify.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^https?:\/\/\S+$|^\/\S+$/; // absolute http(s) or site-relative

const BLOG_STATUS = ["draft", "published"];
const FILE_TYPES = ["PDF", "XLSX", "DOCX", "ZIP", "EPUB"];
const MESSAGE_STATUS = ["unread", "read", "archived"];
const PAGE_SLUGS = ["home", "about", "contact"];

/* ── small helpers ─────────────────────────────────────────── */

const str = (v) => (typeof v === "string" ? v.trim() : "");
const bounded = (v, max) => str(v).slice(0, max);

/** Validate + normalize a Cloudinary-style image asset (or null). */
function imageAsset(input, field, details) {
  if (input === null || input === undefined || input === "") return null;
  if (typeof input !== "object") {
    details[field] = "Provide a valid image reference.";
    return null;
  }
  const url = str(input.url);
  if (!url || !URL_RE.test(url)) {
    details[field] = "The image needs a valid URL (http(s) or a site path).";
    return null;
  }
  return {
    url,
    publicId: str(input.publicId).slice(0, 200),
    width: Number.isFinite(+input.width) ? Math.max(0, Math.round(+input.width)) : 0,
    height: Number.isFinite(+input.height) ? Math.max(0, Math.round(+input.height)) : 0,
  };
}

/** Validate + normalize a Cloudinary-style file asset. */
function fileAsset(input, field, details) {
  if (!input || typeof input !== "object") {
    details[field] = "A file is required.";
    return null;
  }
  const url = str(input.url);
  if (!url || !URL_RE.test(url)) {
    details[field] = "The file needs a valid URL (http(s) or a site path).";
    return null;
  }
  return {
    url,
    publicId: str(input.publicId).slice(0, 200),
    name: bounded(input.name, 200),
    bytes: Number.isFinite(+input.bytes) ? Math.max(0, Math.round(+input.bytes)) : 0,
  };
}

function seo(input, details) {
  const value = typeof input === "object" && input !== null ? input : {};
  return {
    title: bounded(value.title, 70),
    description: bounded(value.description, 200),
  };
}

/** Enum check helper — records a message and returns the fallback. */
function oneOf(value, allowed, field, details, fallback) {
  if (allowed.includes(value)) return value;
  details[field] = `Choose one of: ${allowed.join(", ")}.`;
  return fallback;
}

/* ── auth (Phase 3, kept for reference) ────────────────────── */

export function validateLogin(body) {
  const details = {};
  const email = str(body?.email).toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email) details.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) details.email = "Enter a valid email address.";

  if (!password) details.password = "Password is required.";
  else if (password.length < 8) details.password = "Password must be at least 8 characters.";

  return { details, email, password };
}

/* ── upload signatures (Phase 3) ───────────────────────────── */

export function validateUploadSignatureRequest(body) {
  const folder = str(body?.folder);
  const resourceType = str(body?.resourceType) || "image";
  return { folder, resourceType };
}

/* ── blogs ─────────────────────────────────────────────────── */

/**
 * Validate a blog payload. `mode` "create" requires the full set;
 * "update" validates only provided keys against a merged document
 * (callers merge first, then validate the whole draft).
 */
export function validateBlog(input, { mode = "create" } = {}) {
  const details = {};
  const body = typeof input === "object" && input !== null ? input : {};
  const value = {};

  const title = bounded(body.title, 160);
  if (mode === "create" || body.title !== undefined) {
    if (title.length < 3) details.title = "Title must be at least 3 characters.";
    else value.title = title;
  }

  /* Slug: optional on input — auto-generated from title when absent. */
  if (body.slug !== undefined && str(body.slug) !== "") {
    const customSlug = slugify(body.slug);
    if (!customSlug) details.slug = "Slug must contain letters or numbers.";
    else value.slug = customSlug;
  }

  const excerpt = bounded(body.excerpt, 400);
  if (mode === "create" || body.excerpt !== undefined) {
    if (excerpt.length < 10) details.excerpt = "Excerpt must be at least 10 characters.";
    else value.excerpt = excerpt;
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (mode === "create" || body.content !== undefined) {
    if (content.length < 1) details.content = "Content cannot be empty.";
    else if (content.length > 200000) details.content = "Content is too long.";
    else value.content = content;
  }

  const category = bounded(body.category, 60);
  if (mode === "create" || body.category !== undefined) {
    if (!category) details.category = "Category is required.";
    else value.category = category;
  }

  if (body.author !== undefined) {
    value.author = bounded(body.author, 80) || "Shayan";
  }

  if (body.status !== undefined) {
    const status = oneOf(str(body.status), BLOG_STATUS, "status", details, "draft");
    value.status = status;
  }

  if (body.featured !== undefined) value.featured = Boolean(body.featured);

  if (body.readingTime !== undefined && body.readingTime !== null && body.readingTime !== "") {
    const rt = Math.round(+body.readingTime);
    if (Number.isFinite(rt) && rt >= 1 && rt <= 120) value.readingTime = rt;
    else details.readingTime = "Reading time must be between 1 and 120 minutes.";
  }

  if (body.coverImage !== undefined) {
    const cover = imageAsset(body.coverImage, "coverImage", details);
    value.coverImage = cover;
  }

  if (body.seo !== undefined) value.seo = seo(body.seo, details);

  return { details, value };
}

/* ── categories ────────────────────────────────────────────── */

export function validateCategory(input, { mode = "create" } = {}) {
  const details = {};
  const body = typeof input === "object" && input !== null ? input : {};
  const value = {};

  const name = bounded(body.name, 60);
  if (mode === "create" || body.name !== undefined) {
    if (name.length < 2) details.name = "Name must be at least 2 characters.";
    else value.name = name;
  }

  if (body.slug !== undefined && str(body.slug) !== "") {
    const customSlug = slugify(body.slug);
    if (!customSlug) details.slug = "Slug must contain letters or numbers.";
    else value.slug = customSlug;
  }

  if (body.description !== undefined) {
    value.description = bounded(body.description, 300);
  }

  return { details, value };
}

/* ── services ──────────────────────────────────────────────── */

export function validateService(input, { mode = "create" } = {}) {
  const details = {};
  const body = typeof input === "object" && input !== null ? input : {};
  const value = {};

  const title = bounded(body.title, 120);
  if (mode === "create" || body.title !== undefined) {
    if (title.length < 3) details.title = "Title must be at least 3 characters.";
    else value.title = title;
  }

  if (body.slug !== undefined && str(body.slug) !== "") {
    const customSlug = slugify(body.slug);
    if (!customSlug) details.slug = "Slug must contain letters or numbers.";
    else value.slug = customSlug;
  }

  if (body.tagline !== undefined) value.tagline = bounded(body.tagline, 160);

  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (mode === "create" || body.description !== undefined) {
    if (description.length < 10) details.description = "Description must be at least 10 characters.";
    else value.description = description;
  }

  if (body.image !== undefined) value.image = imageAsset(body.image, "image", details);

  if (body.benefits !== undefined) {
    const benefits = Array.isArray(body.benefits) ? body.benefits : [];
    value.benefits = benefits
      .map((benefit) => bounded(benefit, 200))
      .filter(Boolean)
      .slice(0, 12);
  }

  if (body.format !== undefined) value.format = bounded(body.format, 120);
  if (body.commitment !== undefined) value.commitment = bounded(body.commitment, 120);
  if (body.icon !== undefined) value.icon = bounded(body.icon, 40);

  if (body.order !== undefined && body.order !== null && body.order !== "") {
    const order = Math.round(+body.order);
    if (Number.isFinite(order) && order >= 0) value.order = order;
    else details.order = "Order must be zero or a positive number.";
  }

  if (body.featured !== undefined) value.featured = Boolean(body.featured);

  if (body.status !== undefined) {
    value.status = oneOf(str(body.status), BLOG_STATUS, "status", details, "draft");
  }

  if (body.seo !== undefined) value.seo = seo(body.seo, details);

  return { details, value };
}

/* ── gallery ───────────────────────────────────────────────── */

export function validateGallery(input, { mode = "create" } = {}) {
  const details = {};
  const body = typeof input === "object" && input !== null ? input : {};
  const value = {};

  const title = bounded(body.title, 120);
  if (mode === "create" || body.title !== undefined) {
    if (title.length < 2) details.title = "Title must be at least 2 characters.";
    else value.title = title;
  }

  if (mode === "create" || body.image !== undefined) {
    if (body.image === undefined || body.image === null) {
      if (mode === "create") details.image = "An image is required.";
    } else {
      const image = imageAsset(body.image, "image", details);
      if (image) value.image = image;
    }
  }

  const category = bounded(body.category, 60);
  if (mode === "create" || body.category !== undefined) {
    if (!category) details.category = "Category is required.";
    else value.category = category;
  }

  if (body.caption !== undefined) value.caption = bounded(body.caption, 300);

  if (body.order !== undefined && body.order !== null && body.order !== "") {
    const order = Math.round(+body.order);
    if (Number.isFinite(order) && order >= 0) value.order = order;
    else details.order = "Order must be zero or a positive number.";
  }

  return { details, value };
}

/* ── downloads ─────────────────────────────────────────────── */

export function validateDownload(input, { mode = "create" } = {}) {
  const details = {};
  const body = typeof input === "object" && input !== null ? input : {};
  const value = {};

  const title = bounded(body.title, 160);
  if (mode === "create" || body.title !== undefined) {
    if (title.length < 3) details.title = "Title must be at least 3 characters.";
    else value.title = title;
  }

  if (body.slug !== undefined && str(body.slug) !== "") {
    const customSlug = slugify(body.slug);
    if (!customSlug) details.slug = "Slug must contain letters or numbers.";
    else value.slug = customSlug;
  }

  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (mode === "create" || body.description !== undefined) {
    if (description.length < 10) details.description = "Description must be at least 10 characters.";
    else value.description = description;
  }

  if (mode === "create" || body.file !== undefined) {
    if (body.file === undefined || body.file === null) {
      if (mode === "create") details.file = "A downloadable file is required.";
    } else {
      const file = fileAsset(body.file, "file", details);
      if (file) value.file = file;
    }
  }

  if (body.coverImage !== undefined) {
    value.coverImage = imageAsset(body.coverImage, "coverImage", details);
  }

  const category = bounded(body.category, 60);
  if (mode === "create" || body.category !== undefined) {
    if (!category) details.category = "Category is required.";
    else value.category = category;
  }

  const fileType = str(body.fileType).toUpperCase();
  if (mode === "create" || body.fileType !== undefined) {
    if (!FILE_TYPES.includes(fileType)) {
      details.fileType = `Choose one of: ${FILE_TYPES.join(", ")}.`;
    } else {
      value.fileType = fileType;
    }
  }

  if (body.fileSize !== undefined) value.fileSize = bounded(body.fileSize, 20);
  if (body.status !== undefined) {
    value.status = oneOf(str(body.status), BLOG_STATUS, "status", details, "draft");
  }

  return { details, value };
}

/* ── messages ──────────────────────────────────────────────── */

export function validateMessageStatus(body) {
  const details = {};
  const status = str(body?.status);
  if (!MESSAGE_STATUS.includes(status)) {
    details.status = `Choose one of: ${MESSAGE_STATUS.join(", ")}.`;
  }
  return { details, status };
}

/** Public contact submission — mirrors the Message schema rules. */
export function validateContact(body) {
  const details = {};
  const name = bounded(body?.name, 80);
  const email = str(body?.email).toLowerCase();
  const subject = bounded(body?.subject, 160);
  const message = str(body?.message);

  /* Honeypot — real users never see (or fill) this field. */
  const honeypot = bounded(body?.companyWebsite, 300);

  if (name.length < 2) details.name = "Please share your name (at least 2 characters).";
  if (!EMAIL_RE.test(email)) details.email = "Enter a valid email address.";
  if (subject.length < 3) details.subject = "A short subject helps (3+ characters).";
  if (message.length < 20) details.message = "Tell us a little more — at least 20 characters.";
  if (message.length > 5000) details.message = "Message is too long (5000 characters max).";

  return { details, value: { name, email, subject, message }, spam: honeypot !== "" };
}

/* ── pages ─────────────────────────────────────────────────── */

const PAGE_SECTION_RULES = {
  home: {
    hero: ["title", "description"],
    about: ["title", "description"],
    journey: ["title", "description"],
    contactCta: ["title", "description"],
  },
  about: {
    intro: ["title", "description"],
    mission: ["title", "description"],
    vision: ["title", "description"],
  },
  contact: {
    intro: ["title", "description"],
  },
};

/**
 * Validate a structured page update. Only whitelisted slugs and
 * section keys are accepted — values are length-capped strings,
 * which keeps arbitrary content out of MongoDB.
 */
export function validatePageUpdate(slug, body) {
  const details = {};
  const value = {};

  if (!PAGE_SLUGS.includes(slug)) {
    details.slug = `Pages can only be edited for: ${PAGE_SLUGS.join(", ")}.`;
    return { details, value, slug };
  }

  const sections =
    typeof body?.sections === "object" && body?.sections !== null ? body.sections : null;
  if (!sections) {
    details.sections = "A sections object is required.";
    return { details, value, slug };
  }

  const allowed = PAGE_SECTION_RULES[slug] ?? {};
  const cleaned = {};
  for (const [sectionKey, sectionValue] of Object.entries(sections)) {
    if (!allowed[sectionKey]) continue; // silently drop unknown sections
    if (typeof sectionValue !== "object" || sectionValue === null) continue;
    const cleanSection = {};
    for (const field of allowed[sectionKey]) {
      if (sectionValue[field] !== undefined) {
        cleanSection[field] = bounded(sectionValue[field], 2000);
      }
    }
    /* Media reference for hero-style sections (optional). */
    if (sectionValue.image !== undefined) {
      const image = imageAsset(sectionValue.image, `sections.${sectionKey}.image`, details);
      if (image) cleanSection.image = image;
    }
    if (sectionValue.items !== undefined && Array.isArray(sectionValue.items)) {
      cleanSection.items = sectionValue.items
        .slice(0, 12)
        .map((item) => ({
          label: bounded(item?.label, 120),
          value: bounded(item?.value, 600),
        }))
        .filter((item) => item.label || item.value);
    }
    cleaned[sectionKey] = cleanSection;
  }

  value.sections = cleaned;
  if (body?.title !== undefined) value.title = bounded(body.title, 160);
  if (body?.seo !== undefined) value.seo = seo(body.seo, details);

  return { details, value, slug };
}

/** Public/admin page fetch — slug must be canonical. */
export function isEditablePageSlug(slug) {
  return PAGE_SLUGS.includes(slug);
}

/* ── settings ──────────────────────────────────────────────── */

/**
 * Safe public href — social/profile links may only be http(s)
 * absolute URLs or site-relative paths. Anything else (javascript:,
 * data:, vbscript:…) is rejected so an admin entry can never become
 * an executable scheme in the public footer/contact cards.
 */
function safeHref(input) {
  const href = str(input).slice(0, 300);
  if (!href) return "";
  if (/^https?:\/\/\S+$/i.test(href) || /^\/\S+$/.test(href)) return href;
  return "";
}

const SOCIAL_LIMIT = 6;

export function validateSettings(body) {
  const details = {};
  const value = {};

  if (body?.siteName !== undefined) value.siteName = bounded(body.siteName, 80);
  if (body?.siteDescription !== undefined) value.siteDescription = bounded(body.siteDescription, 300);
  if (body?.email !== undefined) {
    const email = str(body.email);
    if (email && !EMAIL_RE.test(email)) details.email = "Enter a valid email address.";
    else value.email = email;
  }
  if (body?.phone !== undefined) value.phone = bounded(body.phone, 40);
  if (body?.whatsapp !== undefined) value.whatsapp = bounded(body.whatsapp, 40);
  if (body?.location !== undefined) value.location = bounded(body.location, 160);

  if (body?.socials !== undefined) {
    const socials = Array.isArray(body.socials) ? body.socials : [];
    value.socials = socials
      .slice(0, SOCIAL_LIMIT)
      .map((social) => ({
        label: bounded(social?.label, 40),
        href: safeHref(social?.href),
      }))
      .filter((social) => social.label && social.href);
  }

  if (body?.seo !== undefined) {
    const seoInput = typeof body.seo === "object" && body.seo !== null ? body.seo : {};
    value.seo = {
      title: bounded(seoInput.title, 70),
      description: bounded(seoInput.description, 200),
      ogImage: str(seoInput.ogImage).slice(0, 500),
    };
  }

  return { details, value };
}

export const validatorsMeta = { FILE_TYPES, MESSAGE_STATUS, PAGE_SLUGS };
