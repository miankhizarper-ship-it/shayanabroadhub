import mongoose from "mongoose";

/**
 * Message — contact-form enquiries.
 * Created publicly (Phase 4 endpoint), read/archived by admins.
 */
const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    },
    subject: { type: String, required: true, trim: true, minlength: 3, maxlength: 160 },
    message: { type: String, required: true, trim: true, minlength: 20, maxlength: 5000 },
    status: {
      type: String,
      enum: ["unread", "read", "archived"],
      default: "unread",
      index: true,
    },
  },
  { timestamps: true },
);

messageSchema.index({ status: 1, createdAt: -1 });

export const Message =
  mongoose.models.Message ?? mongoose.model("Message", messageSchema);
