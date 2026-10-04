import mongoose from "mongoose";
import { imageAssetSchema, seoSchema, slugField } from "./common.js";

/**
 * Blog — journal essays.
 * `content` is stored as rich text (markdown). The public renderer
 * (BlogContent.jsx) consumes structured blocks; Phase 4's admin
 * editor will own the markdown → blocks conversion.
 */
const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { ...slugField },
    excerpt: { type: String, required: true, trim: true, maxlength: 400 },
    content: { type: String, required: true, minlength: 1 },
    coverImage: { type: imageAssetSchema, default: null },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    author: { type: String, default: "Shayan", trim: true, maxlength: 80 },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    featured: { type: Boolean, default: false },
    readingTime: { type: Number, default: 5, min: 1, max: 120 },
    seo: { type: seoSchema, default: () => ({}) },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });

export const Blog =
  mongoose.models.Blog ?? mongoose.model("Blog", blogSchema);
