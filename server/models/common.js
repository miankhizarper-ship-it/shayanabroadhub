import mongoose from "mongoose";

/**
 * Shared sub-schemas reused across models.
 * Small on purpose — Cloudinary-backed assets store both the
 * delivery URL and the publicId (needed for future deletion).
 */

export const imageAssetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    /** Intrinsic dimensions (px) from the upload — used to derive
     *  orientation for responsive tiles without extra requests. */
    width: { type: Number, default: 0, min: 0 },
    height: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

export const fileAssetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    name: { type: String, default: "" },
    bytes: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

export const seoSchema = new mongoose.Schema(
  {
    title: { type: String, default: "", maxlength: 70 },
    description: { type: String, default: "", maxlength: 200 },
  },
  { _id: false },
);

export const slugField = {
  type: String,
  required: true,
  lowercase: true,
  trim: true,
  match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};
