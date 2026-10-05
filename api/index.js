/**
 * Vercel Serverless Function entry point.
 *
 * vercel.json rewrites every `/api/*` request (plus /robots.txt and
 * /sitemap.xml) to this function. The Express app is imported and
 * invoked as a handler — no `app.listen()` here, no long-running
 * server process: each invocation is cold-start friendly.
 *
 * Requests that do not match the rewrites are served by the Vite SPA
 * (static build output), so this handler never sees frontend traffic.
 */
import app from "../server/app.js";

/**
 * Normalize the request path for the Express app.
 *
 * When Vercel invokes this function through a rewrite it preserves
 * the original path (e.g. `/api/auth/me`), which is what the Express
 * mounts expect (`app.use("/api/…")`). Some routing modes strip the
 * function's `/api` base before invocation — in that case the path
 * arrives as `/auth/me`, so we re-add the prefix defensively. Either
 * way the app always sees `/api/…` paths, and /robots.txt maps to
 * /api/robots.txt where the SEO controller serves it.
 */
function withApiPrefix(url) {
  const raw = url || "/";
  const path = raw.split("?")[0];
  if (path === "/api" || path.startsWith("/api/")) return raw;
  return `/api${raw.startsWith("/") ? raw : `/${raw}`}`;
}

export default function handler(req, res) {
  req.url = withApiPrefix(req.url);
  return app(req, res);
}
