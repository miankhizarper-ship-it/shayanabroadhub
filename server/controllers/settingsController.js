import { Setting } from "../models/Setting.js";
import { connectDB } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendValidationError } from "../utils/apiResponse.js";
import { validateSettings } from "../validators/index.js";

/**
 * Site settings — /api/admin/settings.
 * Stored as a single Setting document (key "site") holding one
 * validated object. GET merges stored values over sane defaults so
 * the admin form and the public site always see a complete shape.
 */

const SETTINGS_KEY = "site";

export const DEFAULT_SETTINGS = {
  siteName: "Shayan Abroad Hub",
  siteDescription:
    "Insight-led guidance, editorial thinking and practical resources for ambitious people and brands.",
  email: "hello@shayanabroadhub.com",
  phone: "",
  whatsapp: "",
  location: "Working with clients worldwide",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com" },
    { label: "Instagram", href: "https://www.instagram.com" },
    { label: "X (Twitter)", href: "https://x.com" },
  ],
  seo: {
    title: "Shayan Abroad Hub — Personal Consulting & Knowledge Hub",
    description:
      "Insight-led guidance, editorial thinking and practical resources for ambitious people and brands.",
    ogImage: "",
  },
};

/** Read settings merged over defaults (shared with the public read). */
export async function readSettings() {
  await connectDB();
  const doc = await Setting.findOne({ key: SETTINGS_KEY }).lean();
  const stored = typeof doc?.value === "object" && doc?.value !== null ? doc.value : {};
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    socials: Array.isArray(stored.socials) ? stored.socials : DEFAULT_SETTINGS.socials,
    seo: { ...DEFAULT_SETTINGS.seo, ...(typeof stored.seo === "object" && stored.seo !== null ? stored.seo : {}) },
    updatedAt: doc?.updatedAt ?? null,
  };
}

/** GET /api/admin/settings */
export const getSettings = asyncHandler(async (_req, res) => {
  return sendSuccess(res, await readSettings());
});

/** PUT /api/admin/settings — partial update, validated + merged. */
export const updateSettings = asyncHandler(async (req, res) => {
  const { details, value } = validateSettings(req.body);
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  const current = await readSettings();
  const merged = {
    ...current,
    ...value,
    socials: value.socials ?? current.socials,
    seo: { ...current.seo, ...(value.seo ?? {}) },
  };
  delete merged.updatedAt;

  const setting = await Setting.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set: { value: merged } },
    { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();

  return sendSuccess(res, { ...merged, updatedAt: setting?.updatedAt ?? new Date().toISOString() });
});
