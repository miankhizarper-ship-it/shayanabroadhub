import mongoose from "mongoose";

/**
 * Admin — the only authentication principal in the system.
 * No public registration exists; accounts are created exclusively
 * via the seed script (server/scripts/seedAdmin.js).
 */
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "editor"],
      default: "admin",
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true },
);


/** Safe JSON — never leak the password hash. */
adminSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

export const Admin =
  mongoose.models.Admin ?? mongoose.model("Admin", adminSchema);
