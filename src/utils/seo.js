import { useEffect } from "react";

/**
 * useSeo — dependency-free per-route SEO management.
 *
 * The public site is an SPA, so every route owns its <title>,
 * meta description, canonical URL, Open Graph + Twitter card tags
 * and (optionally) JSON-LD structured data. This hook upserts those
 * tags into <head> on mount and on dependency changes — no external
 * library (react-helmet etc.) needed at this scale.
 *
 * Managed tags are deterministic selectors, so navigating between
 * pages updates them in place rather than accumulating duplicates:
 *   document.title
 *   meta[name=description]        meta[name=robots] (noindex only)
 *   link[rel=canonical]
 *   og:title/og:type/og:url/og:image/og:site_name/og:locale
 *   twitter:card/twitter:title/twitter:description/twitter:image
 *   script[type=application/ld+json][data-seo-managed]  (cleaned up)
 *
 * The canonical base prefers VITE_SITE_URL (build-time) and falls
 * back to window.location.origin, which matches the deployed origin
 * on Vercel.
 */

const SITE_NAME = "Shayan Abroad Hub";

const SITE_URL = String(import.meta.env?.VITE_SITE_URL ?? "")
  .trim()
  .replace(/\/+$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "");

function absoluteUrl(path) {
  if (!path) return SITE_URL || "/";
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Create-or-update a <meta> tag matched by an attribute selector. */
function upsertMeta(selector, attribute, value, content) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    const [attrType, attrName] = attribute.split("=");
    tag.setAttribute(attrType, attrName.replace(/['"]/g, ""));
    document.head.appendChild(tag);
  }
  if (content === null || content === undefined || content === "") {
    tag.removeAttribute("content");
  } else {
    tag.setAttribute("content", content);
  }
  return tag;
}

/** Create-or-update the canonical <link>. */
function upsertCanonical(href) {
  let tag = document.head.querySelector("link[rel='canonical']");
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

/**
 * Apply route SEO.
 *
 * @param {object} options
 * @param {string} [options.title]        Page title (site name appended unless already present).
 * @param {string} [options.description]  Meta description.
 * @param {string} [options.path]         Route path for canonical/og:url (e.g. "/blogs").
 * @param {string} [options.image]        Social card image (absolute or site-relative).
 * @param {("website"|"article")} [options.type]
 * @param {string} [options.publishedTime] ISO date for article:published_time.
 * @param {string} [options.author]       Article author name.
 * @param {boolean} [options.noIndex]     Emit robots noindex,nofollow (404s, admin).
 * @param {object|object[]} [options.jsonLd] JSON-LD schema(s); removed on unmount.
 */
export function useSeo({
  title,
  description,
  path = "",
  image,
  type = "website",
  publishedTime,
  author,
  noIndex = false,
  jsonLd = null,
} = {}) {
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    /* Title — keep the brand suffix unless the caller already used it. */
    const trimmedTitle = String(title ?? "").trim();
    const fullTitle =
      trimmedTitle && trimmedTitle.includes(SITE_NAME)
        ? trimmedTitle
        : trimmedTitle
          ? `${trimmedTitle} — ${SITE_NAME}`
          : `${SITE_NAME} — Personal Consulting & Knowledge Hub`;
    document.title = fullTitle;

    if (description) {
      upsertMeta("meta[name='description']", "name=description", "description", description);
    }

    /* Canonical + og:url always reflect the route. */
    const canonical = absoluteUrl(path);
    upsertCanonical(canonical);

    /* Robots — only managed when a page must stay out of indexes. */
    const robotsTag = document.head.querySelector("meta[name='robots']");
    if (noIndex) {
      if (robotsTag) {
        robotsTag.setAttribute("content", "noindex, nofollow");
      } else {
        upsertMeta("meta[name='robots']", "name=robots", "robots", "noindex, nofollow");
      }
    } else if (robotsTag) {
      robotsTag.remove();
    }

    /* Open Graph. */
    upsertMeta("meta[property='og:title']", "property=og:title", "og:title", fullTitle);
    if (description) {
      upsertMeta("meta[property='og:description']", "property=og:description", "og:description", description);
    }
    upsertMeta("meta[property='og:type']", "property=og:type", "og:type", type);
    upsertMeta("meta[property='og:url']", "property=og:url", "og:url", canonical);
    upsertMeta("meta[property='og:site_name']", "property=og:site_name", "og:site_name", SITE_NAME);
    upsertMeta("meta[property='og:locale']", "property=og:locale", "og:locale", "en_US");

    const cardImage = image ? absoluteUrl(image) : null;
    if (cardImage) {
      upsertMeta("meta[property='og:image']", "property=og:image", "og:image", cardImage);
      upsertMeta("meta[property='og:image:alt']", "property=og:image:alt", "og:image:alt", fullTitle);
    } else {
      document.head.querySelector("meta[property='og:image']")?.remove();
      document.head.querySelector("meta[property='og:image:alt']")?.remove();
    }

    if (type === "article" && publishedTime) {
      upsertMeta(
        "meta[property='article:published_time']",
        "property=article:published_time",
        "article:published_time",
        publishedTime,
      );
      if (author) {
        upsertMeta("meta[property='article:author']", "property=article:author", "article:author", author);
      }
    } else {
      document.head.querySelector("meta[property='article:published_time']")?.remove();
      document.head.querySelector("meta[property='article:author']")?.remove();
    }

    /* Twitter card. */
    upsertMeta(
      "meta[name='twitter:card']",
      "name=twitter:card",
      "twitter:card",
      cardImage ? "summary_large_image" : "summary",
    );
    upsertMeta("meta[name='twitter:title']", "name=twitter:title", "twitter:title", fullTitle);
    if (description) {
      upsertMeta(
        "meta[name='twitter:description']",
        "name=twitter:description",
        "twitter:description",
        description,
      );
    }
    if (cardImage) {
      upsertMeta("meta[name='twitter:image']", "name=twitter:image", "twitter:image", cardImage);
    } else {
      document.head.querySelector("meta[name='twitter:image']")?.remove();
    }

    /* JSON-LD — one managed slot; stale schemas never linger. */
    const previous = document.head.querySelector("script[data-seo-managed]");
    previous?.remove();
    if (jsonLdKey) {
      try {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-managed", "");
        script.textContent = jsonLdKey;
        document.head.appendChild(script);
      } catch {
        /* Malformed schema must never break rendering. */
      }
    }

    return () => {
      document.head.querySelector("script[data-seo-managed]")?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, image, type, publishedTime, author, noIndex, jsonLdKey]);
}

/* ── Shared JSON-LD builders ──────────────────────────────────── */

/**
 * Person schema for the site owner — only claims visible on the
 * site (name, role, socials). No fake ratings or endorsements.
 */
export function personSchema({ url, sameAs = [] } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Shayan",
    jobTitle: "Personal Consultant",
    description:
      "Personal consultant and writer — insight-led guidance, editorial thinking and practical resources for ambitious people and brands.",
    url: url ?? SITE_URL,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/** WebSite schema for the homepage. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description:
      "Premium personal consulting brand and knowledge hub — essays, services, resources and a curated archive.",
    url: SITE_URL,
  };
}

/**
 * BlogPosting schema for an article — mirrors exactly what the
 * reader sees (title, excerpt, cover, dates, author).
 */
export function blogPostingSchema({ post, path }) {
  if (!post?.title) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? "",
    ...(post.cover ? { image: absoluteUrl(post.cover) } : {}),
    datePublished: post.date ? new Date(post.date).toISOString() : undefined,
    dateModified: post.date ? new Date(post.date).toISOString() : undefined,
    author: {
      "@type": "Person",
      name: post.author?.name ?? "Shayan",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: absoluteUrl(path),
  };
}

/**
 * ItemList of Service schemas for the services page — one entry
 * per visible service card, no invented pricing or ratings.
 */
export function serviceListSchema({ services, path }) {
  if (!services?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.slice(0, 24).map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.description ?? service.tagline ?? "",
        ...(service.format ? { category: service.format } : {}),
        provider: {
          "@type": "Person",
          name: "Shayan",
          url: SITE_URL,
        },
        url: absoluteUrl(path),
      },
    })),
  };
}

export default useSeo;
