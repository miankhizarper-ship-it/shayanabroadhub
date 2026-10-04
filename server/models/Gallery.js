import mongoose from "mongoose";
import { imageAssetSchema } from "./common.js";

/**
 * Gallery — curated image archive.
 * `order` powers admin-controlled display sequencing.
 */
const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    image: { type: imageAssetSchema, required: true },
    category: { type: String, required: true, trim: true, maxlength: 60, index: true },
    caption: { type: String, default: "", maxlength: 300 },
    order: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

gallerySchema.index({ category: 1, order: 1 });

export const Gallery =
  mongoose.models.Gallery ?? mongoose.model("Gallery", gallerySchema);
