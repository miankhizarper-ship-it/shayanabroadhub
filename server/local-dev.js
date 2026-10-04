/**
 * LOCAL DEVELOPMENT RUNNER — never used in production.
 *
 * Vercel invokes the exported app directly (see api/index.js);
 * this file exists only so `bun run dev:server` can serve the API
 * beside the Vite dev server (which proxies /api → :3001).
 * It is the ONLY file in the project that calls app.listen().
 *
 * Memory mode: when MONGODB_URI is not configured, the runner
 * transparently boots an in-memory MongoDB (mongodb-memory-server,
 * devDependency only — never bundled for Vercel), seeds it with the
 * demo content set and continues. This keeps `bun run dev:server`
 * a one-command full-stack demo without external credentials.
 *
 * Import ordering matters: server/config/env.js snapshots
 * process.env at module load, so the memory URI + a dev JWT secret
 * are installed BEFORE any server module is imported here.
 */

const PORT = Number(process.env.PORT ?? 3001);

async function bootstrapEnvironment() {
  const extras = [];

  if (!process.env.MONGODB_URI) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const memory = await MongoMemoryServer.create();
    process.env.MONGODB_URI = memory.getUri("shayanabroadhub");
    extras.push({ memory });
  }

  /* Ephemeral signing key for the demo session (in-memory only). */
  if (!process.env.JWT_SECRET) {
    const { randomBytes } = await import("node:crypto");
    process.env.JWT_SECRET = randomBytes(32).toString("hex");
    extras.push({ devJwtSecret: true });
  }

  return extras;
}

const extras = await bootstrapEnvironment();

/* Server modules are imported only after the environment is final. */
const { default: app } = await import("./app.js");

let seeded = null;
if (extras.some((extra) => extra.memory)) {
  const { connectDB } = await import("./config/db.js");
  const { seedDemoData, DEMO_ADMIN } = await import("./scripts/seedDemo.js");
  await connectDB();
  seeded = await seedDemoData();

  console.log("[local-dev] demo data seeded:", JSON.stringify(seeded.created));
  console.log(
    `[local-dev] demo admin: ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password} (in-memory only)`,
  );
}

const server = app.listen(PORT, () => {
  console.log(`[local-dev] API listening on http://localhost:${PORT}`);
  console.log(`[local-dev] node env: ${process.env.NODE_ENV ?? "development"}`);
  if (!process.env.CLOUDINARY_API_SECRET) {
    console.warn(
      "[local-dev] Cloudinary not configured — /api/uploads/signature returns 503 (uploaders fall back to URL entry).",
    );
  }
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(async () => {
      for (const extra of extras) {
        if (extra.memory) await extra.memory.stop();
      }
      process.exit(0);
    });
  });
}
