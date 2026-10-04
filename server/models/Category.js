import mongoose from "mongoose";
import { slugField } from "./common.js";

/**
 * Category — shared taxonomy for blogs, gallery and downloads.
 * Kept as a flat collection; documents reference categories by
 * their display name to stay query-friendly for the public site.
 */
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { ...slugField },
    description: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: true },
);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ name: 1 }, { unique: true });

export const Category =
  mongoose.models.Category ?? mongoose.model("Category", categorySchema);
