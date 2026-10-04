import cors from "cors";
import { env } from "./env.js";

/**
 * CORS allowlist.
 *
 * - Same-origin requests (Vercel serving the SPA and /api from one
 *   domain) send no Origin header → always allowed.
 * - Origins listed in CLIENT_URL (comma-separated) are echoed back
 *   with credentials enabled, so httpOnly cookies work across a
 *   custom domain split if that ever exists.
 * - Unknown origins simply receive no CORS headers (the browser
 *   blocks them); the request itself still completes for
 *   non-browser clients.
 */
export const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowlisted = env.clientUrls.includes(origin);
    const isLocalhost =
      !env.isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

    if (isAllowlisted || isLocalhost) {
      return callback(null, true);
    }
    return callback(null, false);
  },
};

export const corsMiddleware = cors(corsOptions);
