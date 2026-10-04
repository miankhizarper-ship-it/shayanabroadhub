import mongoose from "mongoose";
import { dbState, isDbConnected } from "../config/db.js";
import { isCloudinaryConfigured, isAuthConfigured, isDbConfigured } from "../config/env.js";

/**
 * GET /api/health — deployment probe.
 * Never connects to the database; only reports live state.
 * Kept backward-compatible with Phase 1 monitors (status key).
 */
export async function healthController(_req, res) {
  return res.status(200).json({
    status: "ok",
    success: true,
    service: "shayanabroadhub-api",
    version: "0.3.0",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    integrations: {
      database: {
        configured: isDbConfigured,
        state: isDbConnected() ? dbState() : (isDbConfigured ? "ready_to_connect" : "not_configured"),
      },
      cloudinary: { configured: isCloudinaryConfigured },
      auth: { configured: isAuthConfigured },
    },
    mongooseDriver: mongoose.version,
  });
}
