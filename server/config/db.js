import mongoose from "mongoose";
import { env, isDbConfigured } from "./env.js";

/**
 * MongoDB connection utility — serverless-safe.
 *
 * Vercel warm invocations reuse the same Node runtime, so the live
 * Mongoose connection is cached on `globalThis` (survives module
 * reloads between invocations in the same container) and reused.
 * Cold starts connect lazily: the first query-bearing request pays
 * the connection cost, /api/health never triggers a connection.
 *
 * A custom error class (`ConfigurationError`) distinguishes "not
 * configured" from "configured but unreachable".
 */

export class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigurationError";
    this.status = 503;
    this.code = "db_not_configured";
  }
}

const globalKey = "__shayanabroadhub_mongoose";

/* mongoose.set options — stable, once. */
mongoose.set("strictQuery", true);

function getCache() {
  if (!globalThis[globalKey]) {
    globalThis[globalKey] = { promise: null };
  }
  return globalThis[globalKey];
}

/**
 * Connect (or reuse) the MongoDB connection.
 * @returns {Promise<typeof mongoose>}
 */
export async function connectDB() {
  if (!isDbConfigured) {
    throw new ConfigurationError(
      "Database is not configured — set the MONGODB_URI environment variable.",
    );
  }

  const cache = getCache();

  /* Connection already established (warm invocation) → reuse. */
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  /* A connection attempt is in flight → await the same promise. */
  if (cache.promise) {
    return cache.promise;
  }

  cache.promise = mongoose
    .connect(env.mongodbUri, {
      /* Serverless tuning: fail fast, keep pools small. */
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 30000,
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
    })
    .then((mongooseInstance) => {
      if (env.nodeEnv !== "production") {
        console.log("[db] connected:", mongooseInstance.connection.name);
      }
      return mongooseInstance;
    })
    .catch((error) => {
      /* Reset the cached promise so the next request can retry. */
      cache.promise = null;
      console.error(
        "[db] connection failed:",
        error?.name ?? "Error",
        "—", (error?.message ?? "").slice(0, 120),
      );
      throw error;
    });

  return cache.promise;
}

/** Current connection state string (readyState → human label). */
export function dbState() {
  const labels = [
    "disconnected",
    "connected",
    "connecting",
    "disconnecting",
    "uninitialized",
  ];
  return labels[mongoose.connection.readyState] ?? "unknown";
}

/** True when the live connection is ready (never initiates one). */
export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
