import { Blog } from "../models/Blog.js";
import { Service } from "../models/Service.js";
import { Gallery } from "../models/Gallery.js";
import { Download } from "../models/Download.js";
import { Message } from "../models/Message.js";
import { connectDB } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

/**
 * GET /api/admin/dashboard — single efficient statistics endpoint.
 *
 * All counts run as parallel countDocuments calls with projection-
 * free filters (indexes cover status/category); recents are lean
 * queries with tight projections. One request powers the whole
 * dashboard instead of the frontend fanning out.
 */
export const getDashboard = asyncHandler(async (req, res) => {
  await connectDB();

  const [
    totalBlogs,
    publishedBlogs,
    draftBlogs,
    totalServices,
    publishedServices,
    totalGallery,
    totalDownloads,
    unreadMessages,
    recentBlogs,
    recentMessages,
  ] = await Promise.all([
    Blog.countDocuments({}),
    Blog.countDocuments({ status: "published" }),
    Blog.countDocuments({ status: "draft" }),
    Service.countDocuments({}),
    Service.countDocuments({ status: "published" }),
    Gallery.countDocuments({}),
    Download.countDocuments({}),
    Message.countDocuments({ status: "unread" }),
    Blog.find({})
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title slug status category featured readingTime updatedAt createdAt")
      .lean(),
    Message.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email subject status createdAt")
      .lean(),
  ]);

  const { id, name, email, role, lastLogin } = req.admin;

  return sendSuccess(res, {
    stats: {
      blogs: { total: totalBlogs, published: publishedBlogs, draft: draftBlogs },
      services: { total: totalServices, published: publishedServices },
      gallery: { total: totalGallery },
      downloads: { total: totalDownloads },
      messages: { unread: unreadMessages },
    },
    recentBlogs: recentBlogs.map((blog) => ({
      ...blog,
      _id: blog._id.toString(),
    })),
    recentMessages: recentMessages.map((message) => ({
      ...message,
      _id: message._id.toString(),
    })),
    admin: { id, name, email, role, lastLogin },
    generatedAt: new Date().toISOString(),
  });
});
