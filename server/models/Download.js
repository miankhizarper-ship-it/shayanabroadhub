import mongoose from "mongoose";
import { fileAssetSchema, imageAssetSchema, slugField } from "./common.js";

/**
 * Download — resource library entries.
 * `file` carries the Cloudinary asset; `fileSize` is the human
 * label shown on cards, `file.bytes` the precise size.
 */
const downloadSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { ...slugField },
    description: { type: String, required: true, minlength: 1 },
    file: { type: fileAssetSchema, required: true },
    coverImage: { type: imageAssetSchema, default: null },
    category: { type: String, required: true, trim: true, maxlength: 60, index: true },
    fileType: {
      type: String,
      required: true,
      enum: ["PDF", "XLSX", "DOCX", "ZIP", "EPUB"],
    },
    fileSize: { type: String, default: "", maxlength: 20 },
    downloadCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true },
);

downloadSchema.index({ slug: 1 }, { unique: true });
downloadSchema.index({ category: 1, status: 1 });

export const Download =
  mongoose.models.Download ?? mongoose.model("Download", downloadSchema);
