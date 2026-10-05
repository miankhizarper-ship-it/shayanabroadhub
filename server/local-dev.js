/**
 * LOCAL DEVELOPMENT RUNNER — never used in production.
 *
 * Vercel invokes the exported app directly (see api/index.js);
 * this file exists only so `npm run dev:server` can serve the API
 * beside the Vite dev server (which proxies /api → :3001).
 * It is the ONLY file in the project that calls app.listen().
 *
 * Memory mode: when MONGODB_URI is not configured, the runner
 * transparently boots an in-memory MongoDB (mongodb-memory-server,
 * devDependency only — never bundled for Vercel) and creates a
 * throwaway admin account so you can sign in at /admin/login.
 * No demo/bulk content is seeded — the database starts empty and
 * you add your real data through the admin panel.
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

  /* Ephemeral signing key for the dev session (in-memory only). */
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

/* Memory mode — create ONLY the dev admin (content stays empty). */
if (extras.some((extra) => extra.memory)) {
  const { connectDB } = await import("./config/db.js");
  const { Admin } = await import("./models/Admin.js");
  const { hashPassword } = await import("./utils/password.js");
  await connectDB();

  const email = (process.env.ADMIN_EMAIL ?? "admin@shayanabroadhub.test").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "LocalDev2026";

  const existing = await Admin.findOne({ email });
  if (!existing) {
    await Admin.create({
      name: process.env.ADMIN_NAME ?? "Shayan",
      email,
      passwordHash: await hashPassword(password),
      role: "admin",
      isActive: true,
    });
  }

  console.log(
    `[local-dev] in-memory database — empty content (no demo data). ` +
      `Admin login: ${email} / ${password} (local session only)`,
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
