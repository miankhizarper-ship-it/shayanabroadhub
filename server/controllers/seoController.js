import { Blog } from "../models/Blog.js";
import { connectDB } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

/**
 * SEO infrastructure — production robots.txt and sitemap.xml served
 * by the serverless API (so blog URLs can come live from MongoDB)
 * and mapped to clean paths via vercel.json rewrites:
 *
 *   /robots.txt   →  /api/robots.txt
 *   /sitemap.xml  →  /api/sitemap.xml
 *
 * The absolute base URL is derived from the incoming request host
 * (Vercel forwards it), which keeps the endpoints environment-aware
 * without hardcoding a domain. Drafts are never included in the
 * sitemap — only status:"published" posts are queried.
 */

/** Hostnames look like hostnames — anything else is untrusted. */
const HOST_RE = /^[a-z0-9.-]+(:\d{2,5})?$/i;

/**
 * Resolve the public base URL for canonical/sitemap links.
 * Prefers proxy headers (Vercel), falls back to Express's own view,
 * then to the CLIENT_URL allowlist.
 * @returns {string} e.g. "https://shayanabroadhub.com"
 */
function siteBaseUrl(req) {
  const candidates = [
    req.headers?.["x-forwarded-host"],
    req.headers?.host,
  ];

  for (const candidate of candidates) {
    const host = String(candidate ?? "").split(",")[0].trim();
    if (host && HOST_RE.test(host)) {
      const proto = String(req.headers?.["x-forwarded-proto"] ?? req.protocol ?? "https")
        .split(",")[0]
        .trim() || "https";
      return `${proto}://${host}`;
    }
  }

  const configured = env.clientUrls[0];
  return configured ? configured.replace(/\/+$/, "") : "";
}

/* ── robots.txt ─────────────────────────────────────────────── */

/**
 * GET /api/robots.txt (rewritten from /robots.txt)
 * Allows the public site, disallows the CMS and API surface, and
 * points crawlers at the sitemap.
 */
export function getRobotsTxt(req, res) {
  const base = siteBaseUrl(req);
  const lines = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api",
  ];

  if (base) {
    lines.push("", `Sitemap: ${base}/sitemap.xml`);
  }

  return res
    .status(200)
    .type("text/plain")
    .set("Cache-Control", "public, max-age=3600")
    .send(`${lines.join("\n")}\n`);
}

/* ── sitemap.xml ────────────────────────────────────────────── */

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/blogs", priority: "0.9", changefreq: "weekly" },
  { path: "/services", priority: "0.9", changefreq: "monthly" },
  { path: "/gallery", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.8", changefreq: "yearly" },
  { path: "/downloads", priority: "0.7", changefreq: "weekly" },
];

const XML_COMMENT_RE = /--/g;

/** Escape a value for safe inclusion in an XML text node. */
function xmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(XML_COMMENT_RE, "&#45;&#45;");
}

/**
 * GET /api/sitemap.xml (rewritten from /sitemap.xml)
 * Static public routes + every published blog slug. When the
 * database is unreachable the sitemap still serves the static
 * routes — a partial sitemap beats a 500 for crawlers.
 */
export const getSitemapXml = asyncHandler(async (req, res) => {
  const base = siteBaseUrl(req);
  const entries = [];

  if (base) {
    for (const route of STATIC_ROUTES) {
      entries.push({
        loc: `${base}${route.path}`,
        changefreq: route.changefreq,
        priority: route.priority,
      });
    }

    try {
      await connectDB();
      const posts = await Blog.find({ status: "published" })
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(2000)
        .select("slug updatedAt publishedAt")
        .lean();

      for (const post of posts) {
        const lastmodSource = post.updatedAt ?? post.publishedAt;
        entries.push({
          loc: `${base}/blogs/${encodeURIComponent(post.slug)}`,
          lastmod: lastmodSource ? new Date(lastmodSource).toISOString() : null,
          changefreq: "monthly",
          priority: "0.6",
        });
      }
    } catch (error) {
      console.warn(
        "[seo] sitemap: database unavailable — serving static routes only:",
        error?.name ?? "Error",
      );
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${xmlEscape(entry.loc)}</loc>${
      entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""
    }
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return res
    .status(200)
    .type("application/xml")
    .set("Cache-Control", "public, max-age=3600")
    .send(xml);
});
