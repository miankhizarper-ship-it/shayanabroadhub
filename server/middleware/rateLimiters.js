import rateLimit from "express-rate-limit";

/**
 * Rate limiters — basic per-instance, in-memory buckets.
 *
 * Serverless caveat: each warm Vercel container keeps its own
 * counters, so these are a blunt first line (abuse mitigation),
 * not a distributed quota. A shared store (e.g. Upstash) can be
 * plugged into express-rate-limit later without call-site changes.
 *
 * `validate: false` disables express-rate-limit's startup warnings
 * about trust-proxy configurations it cannot inspect in serverless.
 */

/** General API bucket — generous ceiling against scraping bursts. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: false,
  message: {
    success: false,
    error: {
      code: "rate_limited",
      message: "Too many requests — please slow down and retry shortly.",
    },
  },
});

/** Contact bucket — public form abuse ceiling (per IP). */
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: false,
  message: {
    success: false,
    error: {
      code: "rate_limited",
      message: "Too many messages sent recently — please try again a little later.",
    },
  },
});

/** Login bucket — strict, per IP + account-attempt pacing. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: "rate_limited",
      message: "Too many sign-in attempts. Try again in a few minutes.",
    },
  },
});

/** Download-counter bucket — keeps the public +1 ping from being
 *  trivially inflated by scripted bursts (per IP, per instance). */
export const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: false,
  message: {
    success: false,
    error: {
      code: "rate_limited",
      message: "Too many requests — please slow down and retry shortly.",
    },
  },
});
