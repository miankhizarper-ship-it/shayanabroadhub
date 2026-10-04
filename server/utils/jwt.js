import jwt from "jsonwebtoken";
import { env, isAuthConfigured } from "../config/env.js";

/**
 * JWT session tokens for admin authentication.
 *
 * Tokens are short-lived, issued only by the login controller, and
 * always verified against the DB-loaded admin in requireAdmin —
 * the payload alone never grants access.
 */

export class AuthConfigurationError extends Error {
  constructor() {
    super("Authentication is not configured — set the JWT_SECRET environment variable.");
    this.name = "ConfigurationError";
    this.status = 503;
    this.code = "auth_not_configured";
  }
}

const ISSUER = "shayanabroadhub-api";
const AUDIENCE = "shayanabroadhub-admin";

/**
 * Sign an admin session token.
 * @param {{ id: string, role: string }} admin
 */
export function signAdminToken(admin) {
  if (!isAuthConfigured) throw new AuthConfigurationError();

  return jwt.sign({ role: admin.role }, env.jwtSecret, {
    subject: admin.id,
    expiresIn: env.jwtExpiresIn,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

/**
 * Verify a session token. Throws jsonwebtoken errors on tampering/
 * expiry — callers treat every failure as a 401.
 * @returns {{ sub: string, role: string }}
 */
export function verifyAdminToken(token) {
  if (!isAuthConfigured) throw new AuthConfigurationError();

  return jwt.verify(token, env.jwtSecret, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}
