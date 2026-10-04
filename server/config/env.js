/**
 * Environment configuration for the server layer.
 *
 * Reads from process.env (populated locally via `.env`, and in
 * production via Vercel → Settings → Environment Variables).
 *
 * Design rules:
 *  - Importing this module never throws: the API must boot (and
 *    serve /api/health) even when optional credentials are absent.
 *  - Validation errors are raised at the point a credential is
 *    actually consumed (db.js, cloudinary.js, jwt.js), so the
 *    failure message is specific and actionable.
 *  - Secret values are never logged, only their presence.
 */

const raw = (name) => process.env[name]?.trim() ?? "";

/**comma-separated CLIENT_URL → array of allowlisted origins. */
function parseClientUrls(value) {
  return value
    .split(",")
    .map((url) => url.replace(/\/+$/, ""))
    .filter(Boolean);
}

export const env = {
  nodeEnv: raw("NODE_ENV") || "development",
  get isProduction() {
    return this.nodeEnv === "production";
  },

  /** MongoDB Atlas connection string (Phase 3+). */
  mongodbUri: raw("MONGODB_URI"),

  /** Auth / signing secret for admin sessions. */
  jwtSecret: raw("JWT_SECRET"),
  jwtExpiresIn: raw("JWT_EXPIRES_IN") || "7d",

  /** Allowlisted browser origins for CORS (comma-separated). */
  clientUrls: parseClientUrls(raw("CLIENT_URL")),

  /** Cloudinary media credentials (server-side only). */
  cloudinary: {
    cloudName: raw("CLOUDINARY_CLOUD_NAME"),
    apiKey: raw("CLOUDINARY_API_KEY"),
    apiSecret: raw("CLOUDINARY_API_SECRET"),
  },
};

/** True when every Cloudinary credential is present. */
export const isCloudinaryConfigured = Boolean(
  env.cloudinary.cloudName &&
    env.cloudinary.apiKey &&
    env.cloudinary.apiSecret,
);

/** True when a MongoDB URI is present. */
export const isDbConfigured = Boolean(env.mongodbUri);

/** True when JWT signing is possible. */
export const isAuthConfigured = Boolean(env.jwtSecret);

/* ── Production environment gate ─────────────────────────────── */

let productionCheckDone = false;

/**
 * validateProductionEnv — one-shot audit of the variables a real
 * deployment needs. Runs only when NODE_ENV=production and logs
 * actionable problems WITHOUT ever printing secret values.
 *
 * The API still boots (health stays reachable, failures fail safe
 * as 503s) — this exists so a misconfigured deployment announces
 * itself loudly in the function logs instead of failing silently.
 */
export function validateProductionEnv() {
  if (!env.isProduction || productionCheckDone) return;
  productionCheckDone = true;

  const problems = [];

  if (!env.mongodbUri) {
    problems.push("MONGODB_URI is not set — every DB-bearing request will answer 503.");
  }
  if (!env.jwtSecret) {
    problems.push("JWT_SECRET is not set — admin sign-in will answer 503.");
  } else if (env.jwtSecret.length < 32) {
    problems.push(
      "JWT_SECRET is shorter than 32 characters — use a long random value (openssl rand -base64 48).",
    );
  }
  if (env.clientUrls.length === 0) {
    problems.push(
      "CLIENT_URL is not set — same-origin traffic still works, but cross-origin browser clients will be blocked by CORS.",
    );
  }
  if (!isCloudinaryConfigured) {
    console.warn(
      "[env] Cloudinary credentials incomplete — signed uploads will answer 503 (paste-URL fallback still works).",
    );
  }

  if (problems.length > 0) {
    console.error(
      "[env] production configuration problems:\n - " + problems.join("\n - "),
    );
  }
}
