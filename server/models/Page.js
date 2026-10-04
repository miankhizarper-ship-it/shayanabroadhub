import mongoose from "mongoose";
import { seoSchema, slugField } from "./common.js";

/**
 * Page — editable structured pages (home, about, contact).
 * `sections` holds the page's structured content blocks (a safe,
 * whitelisted object per page type — no generic page builder).
 * `content` remains a plain-text fallback for simple pages.
 */
const pageSchema = new mongoose.Schema(
  {
    slug: { ...slugField },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    content: { type: String, default: "" },
    sections: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

pageSchema.index({ slug: 1 }, { unique: true });

export const Page =
  mongoose.models.Page ?? mongoose.model("Page", pageSchema);
