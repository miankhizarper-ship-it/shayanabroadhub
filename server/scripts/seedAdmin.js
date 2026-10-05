/**
 * Secure admin seed script — creates or resets the single admin
 * account from environment variables. Run manually, never in a
 * pipeline without secrets:
 *
 *   npm run seed:admin
 *
 * Required env:
 *   MONGODB_URI                                — Atlas connection string
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD    — the account itself
 *
 * Guards:
 *   - refuses to run without all required variables;
 *   - enforces a minimum password strength;
 *   - in NODE_ENV=production additionally requires
 *     ALLOW_ADMIN_SEED=true (explicit production override);
 *   - no default credentials exist anywhere in this repository.
 */
import mongoose from "mongoose";
import { Admin } from "../models/Admin.js";
import { hashPassword } from "../utils/password.js";
import { isDbConfigured } from "../config/env.js";

function fail(message) {
  console.error(`[seed:admin] ${message}`);
  process.exit(1);
}

/* ── Guards ─────────────────────────────────────────────────── */
if (!isDbConfigured) {
  fail("MONGODB_URI is required. Add it to .env (local) or your shell environment.");
}

const name = process.env.ADMIN_NAME?.trim() ?? "";
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
const password = process.env.ADMIN_PASSWORD ?? "";
const reset = process.argv.includes("--reset");

if (!name || !email || !password) {
  fail(
    "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are all required " +
      "(never commit them — export them in your shell or use a local .env).",
  );
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  fail("ADMIN_EMAIL does not look like a valid email address.");
}

if (password.length < 10 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
  fail("ADMIN_PASSWORD must be at least 10 characters and include letters and numbers.");
}

if (process.env.NODE_ENV === "production" && process.env.ALLOW_ADMIN_SEED !== "true") {
  fail(
    "Refusing to seed in production without ALLOW_ADMIN_SEED=true " +
      "(seed runs should be deliberate, one-off operations).",
  );
}

/* ── Seed ───────────────────────────────────────────────────── */
try {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  });

  const passwordHash = await hashPassword(password);
  const existing = await Admin.findOne({ email });

  if (existing && !reset) {
    console.error(
      `[seed:admin] An admin with ${email} already exists. Re-run with --reset to update its password.`,
    );
    process.exitCode = 1;
  } else if (existing) {
    existing.name = name;
    existing.passwordHash = passwordHash;
    existing.isActive = true;
    await existing.save();
    console.log(`[seed:admin] Admin ${email} updated (password reset).`);
  } else {
    await Admin.create({ name, email, passwordHash, role: "admin", isActive: true });
    console.log(`[seed:admin] Admin ${email} created.`);
  }
} catch (error) {
  fail(`Seed failed — ${error.name}: ${error.message}`);
} finally {
  await mongoose.disconnect();
}
