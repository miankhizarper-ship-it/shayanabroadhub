import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "./config/cors.js";
import { env, validateProductionEnv } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import { apiNotFoundHandler, errorHandler } from "./middleware/errors.js";
import apiRouter from "./routes/index.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

/**
 * Express application — the backend half of Shayan Abroad Hub.
 *
 * Serverless contract:
 *  - this module NEVER listens; it is exported as a request
 *    handler and invoked by api/index.js on Vercel (and by
 *    server/local-dev.js during local development only);
 *  - MongoDB connections are created lazily on the first
 *    DB-bearing request and cached across warm invocations.
 *
 * Phase 3 scope: infrastructure only — health, admin auth,
 * signed-upload foundation. Domain CRUD arrives in Phase 4.
 */
const app = express();

/* Announce missing production configuration once per cold boot
   (no-op outside NODE_ENV=production; never prints secret values). */
validateProductionEnv();

app.disable("x-powered-by");
/* One proxy hop (Vercel edge) — required for correct client IPs
   behind the platform's load balancer and for rate limiting. */
app.set("trust proxy", 1);

/* ── Security ─────────────────────────────────────────────────
   Helmet sets sensible headers; CSP is disabled because this is a
   pure JSON API (the SPA ships its own policy via Vercel). */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(corsMiddleware);

/* ── Parsing ────────────────────────────────────────────────── */
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false, limit: "32kb" }));
app.use(cookieParser());

/* ── Routes ─────────────────────────────────────────────────── */
app.use("/api", apiLimiter);
app.use("/api", apiRouter);
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes);

/* Unknown API paths get a JSON 404, not the SPA. */
app.use("/api", apiNotFoundHandler);

/* Central error funnel. */
app.use(errorHandler);

export default app;
