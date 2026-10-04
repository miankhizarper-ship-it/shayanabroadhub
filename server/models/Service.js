import mongoose from "mongoose";
import { imageAssetSchema, seoSchema, slugField } from "./common.js";

/**
 * Service — consulting engagement catalogue.
 */
const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { ...slugField },
    tagline: { type: String, default: "", maxlength: 160 },
    description: { type: String, required: true, minlength: 1 },
    image: { type: imageAssetSchema, default: null },
    benefits: { type: [String], default: [], maxlength: 200 },
    format: { type: String, default: "", maxlength: 120 },
    commitment: { type: String, default: "", maxlength: 120 },
    /** Optional lucide icon name (admin-selected, public iconMap lookup). */
    icon: { type: String, default: "", maxlength: 40 },
    /** Admin-controlled display ordering (ascending). */
    order: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

serviceSchema.index({ slug: 1 }, { unique: true });
serviceSchema.index({ status: 1, order: 1 });

export const Service =
  mongoose.models.Service ?? mongoose.model("Service", serviceSchema);
