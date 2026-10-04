import mongoose from "mongoose";

/**
 * Setting — simple key/value store for site-wide configuration
 * (contact details, availability flag, …) editable by admins
 * without redeploying.
 */
const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 80,
    },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);


export const Setting =
  mongoose.models.Setting ?? mongoose.model("Setting", settingSchema);
