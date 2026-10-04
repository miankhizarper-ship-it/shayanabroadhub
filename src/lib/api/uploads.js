/**
 * Uploads API — signed, direct browser→Cloudinary uploads.
 *
 * Flow (the Express function never touches file bytes):
 *   1. POST /api/uploads/signature   → signed params (admin-only)
 *   2. POST to Cloudinary uploadUrl  → { secure_url, public_id, … }
 *
 * The Cloudinary API secret never reaches the browser; only the
 * short-lived signature for the allowlisted folder does.
 */

import { apiPost } from "./client.js";

export const uploadsApi = {
  /**
   * Request signature params for one upload.
   * @param {{ folder: "blogs"|"services"|"gallery"|"downloads"|"profile", resourceType?: "image"|"raw" }} params
   */
  signature: (params) => apiPost("/uploads/signature", params),

  /**
   * Upload a file straight to Cloudinary with progress reporting.
   * @param {File} file
   * @param {{ folder: string, resourceType?: "image"|"raw", onProgress?: (percent:number)=>void, signal?: AbortSignal }} options
   * @returns {Promise<{ url: string, publicId: string, width: number, height: number, bytes: number, format: string }>}
   */
  upload(file, { folder, resourceType = "image", onProgress, signal } = {}) {
    return this.signature({ folder, resourceType }).then((signature) =>
      new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signature.apiKey);
        formData.append("timestamp", String(signature.timestamp));
        formData.append("signature", signature.signature);
        formData.append("folder", signature.folder);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", signature.uploadUrl);
        xhr.responseType = "json";

        if (signal) {
          signal.addEventListener("abort", () => {
            xhr.abort();
            reject(new DOMException("Upload aborted", "AbortError"));
          });
        }

        if (onProgress) {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              onProgress(Math.round((event.loaded / event.total) * 100));
            }
          });
        }

        xhr.addEventListener("load", () => {
          const result = xhr.response;
          if (xhr.status >= 200 && xhr.status < 300 && result?.secure_url) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id ?? "",
              width: result.width ?? 0,
              height: result.height ?? 0,
              bytes: result.bytes ?? file.size,
              format: result.format ?? "",
            });
          } else {
            reject(
              new Error(
                result?.error?.message ?? `Upload failed (HTTP ${xhr.status}).`,
              ),
            );
          }
        });
        xhr.addEventListener("error", () =>
          reject(new Error("Upload failed — network error.")),
        );
        xhr.addEventListener("abort", () =>
          reject(new DOMException("Upload aborted", "AbortError")),
        );

        xhr.send(formData);
      }),
    );
  },
};
