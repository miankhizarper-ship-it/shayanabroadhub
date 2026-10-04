import { v2 as cloudinary } from "cloudinary";
import { env, isCloudinaryConfigured } from "./env.js";

/**
 * Cloudinary configuration — server-side only.
 *
 * The API secret never leaves this module. The rest of the app
 * only interacts through `getUploadSignature()` (signed-upload
 * foundation) and `isCloudinaryConfigured`.
 *
 * No media CRUD is implemented in this phase by design.
 */

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

/** Folders admins may upload into (allowlist — never free-form). */
export const uploadFolders = {
  blogs: "shayanabroadhub/blogs",
  services: "shayanabroadhub/services",
  gallery: "shayanabroadhub/gallery",
  downloads: "shayanabroadhub/downloads",
  profile: "shayanabroadhub/profile",
};

/** Resource types permitted for signed uploads. */
export const uploadResourceTypes = ["image", "raw"];

/**
 * Build signed upload parameters for a single upload.
 *
 * @param {{ folder: keyof typeof uploadFolders, resourceType: string }} params
 * @returns {{ cloudName, apiKey, timestamp, signature, folder, resourceType, uploadUrl }}
 */
export function getUploadSignature({ folder, resourceType = "image" }) {
  if (!isCloudinaryConfigured) {
    const error = new Error(
      "Cloudinary is not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    );
    error.name = "ConfigurationError";
    error.status = 503;
    error.code = "cloudinary_not_configured";
    throw error;
  }

  const resolvedFolder = uploadFolders[folder];
  if (!resolvedFolder) {
    const error = new Error("Unknown upload folder.");
    error.name = "ValidationError";
    error.status = 422;
    error.code = "validation_failed";
    throw error;
  }

  if (!uploadResourceTypes.includes(resourceType)) {
    const error = new Error("Unsupported resource type.");
    error.name = "ValidationError";
    error.status = 422;
    error.code = "validation_failed";
    throw error;
  }

  const timestamp = Math.round(Date.now() / 1000);

  /* Only these params are signed — keep the surface minimal. */
  const signature = cloudinary.utils.api_sign_request(
    { folder: resolvedFolder, timestamp },
    env.cloudinary.apiSecret,
  );

  return {
    cloudName: env.cloudinary.cloudName,
    apiKey: env.cloudinary.apiKey,
    timestamp,
    signature,
    folder: resolvedFolder,
    resourceType,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/${resourceType}/upload`,
  };
}

/**
 * Attempt to delete a Cloudinary asset by publicId.
 *
 * Best-effort by design: the caller deletes the MongoDB record
 * first (source of truth) and treats a Cloudinary failure as a
 * logged warning, never as a request failure — a broken CDN link
 * is preferable to a stuck admin delete flow.
 *
 * @param {string} publicId
 * @param {string} [resourceType] "image" | "raw"
 * @returns {Promise<{ deleted: boolean, reason?: string }>}
 */
export async function deleteCloudinaryAsset(publicId, resourceType = "image") {
  if (!publicId) return { deleted: false, reason: "no_public_id" };
  if (!isCloudinaryConfigured) {
    return { deleted: false, reason: "cloudinary_not_configured" };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: uploadResourceTypes.includes(resourceType)
        ? resourceType
        : "image",
    });
    /* Cloudinary returns { result: "deleted" | "not found", … }. */
    return { deleted: result?.result === "deleted", reason: result?.result };
  } catch (error) {
    console.warn(
      "[cloudinary] asset deletion failed:",
      error?.message?.slice(0, 120) ?? "unknown error",
    );
    return { deleted: false, reason: "deletion_request_failed" };
  }
}
