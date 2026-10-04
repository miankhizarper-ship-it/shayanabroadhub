/**
 * Vercel Serverless Function entry point.
 *
 * Vercel maps every request under `/api/*` to this file (see the
 * `api/` directory convention). The Express app is imported and
 * invoked as a handler — no `app.listen()` here, no long-running
 * server process: each invocation is cold-start friendly.
 *
 * Requests that do not match `/api/*` are served by the Vite SPA
 * (see the rewrites in vercel.json), so this handler never sees
 * frontend traffic.
 */
import app from "../server/app.js";

export default function handler(req, res) {
  return app(req, res);
}
