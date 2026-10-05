import { useCallback, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, File as FileIcon, Link2, LoaderCircle, RefreshCcw, UploadCloud, X } from "lucide-react";
import { uploadsApi } from "../../lib/api/uploads";
import { cn } from "../../utils/cn";
import { formatBytes } from "../../utils/format";
import { AdminButton, TextInput } from "./ui";

/**
 * MediaUploader — signed direct-to-Cloudinary uploads with a
 * pragmatic URL fallback.
 *
 * Primary flow (matches the platform upload sequence):
 *   signature (/api/uploads/signature) → direct browser upload →
 *   { url, publicId, width, height } handed back to the form.
 *
 * The fallback ("paste a URL") exists for environments without
 * Cloudinary credentials yet — same resulting shape, honest UX.
 */

const IMAGE_ACCEPT = "image/*";
const IMAGE_MAX_MB = 10;
const RAW_MAX_MB = 25;

export function ImageUploader({ value, onChange, folder = "gallery", label = "Image", id }) {
  const [mode, setMode] = useState("upload");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [urlDraft, setUrlDraft] = useState("");
  const inputRef = useRef(null);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setError(null);

      if (!file.type.startsWith("image/")) {
        setError("Choose an image file (PNG, JPG, WebP…).");
        return;
      }
      if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
        setError(`Images must be under ${IMAGE_MAX_MB} MB.`);
        return;
      }

      setUploading(true);
      setProgress(0);
      try {
        const asset = await uploadsApi.upload(file, {
          folder,
          resourceType: "image",
          onProgress: setProgress,
        });
        onChange({ url: asset.url, publicId: asset.publicId, width: asset.width, height: asset.height });
      } catch (cause) {
        setError(
          cause?.message ??
            "Upload failed. If Cloudinary is not configured yet, paste an image URL instead.",
        );
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange],
  );

  const handleRemove = () => {
    onChange(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input id={id} type="hidden" />
      {value?.url ? (
        <div className="flex items-start gap-3 rounded-lg border border-line bg-cream-deep/40 p-3">
          <img
            src={value.url}
            alt="Upload preview"
            className="h-20 w-28 shrink-0 rounded-md border border-line object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-medium text-ink">
              <CheckCircle2 className="size-3.5 text-emerald-500" aria-hidden="true" />
              Image attached
            </p>
            <p className="mt-0.5 truncate text-xs text-ink-muted" title={value.url}>
              {value.url}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <AdminButton size="xs" variant="secondary" onClick={() => setMode("upload")} type="button">
                <RefreshCcw className="size-3" aria-hidden="true" />
                Replace
              </AdminButton>
              <AdminButton size="xs" variant="danger-quiet" onClick={handleRemove} type="button">
                <X className="size-3" aria-hidden="true" />
                Remove
              </AdminButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-cream-deep/30">
          <div className="flex items-center gap-1 border-b border-line px-3 pt-2.5">
            <ModeTab active={mode === "upload"} onClick={() => setMode("upload")}>
              <UploadCloud className="size-3.5" aria-hidden="true" />
              Upload
            </ModeTab>
            <ModeTab active={mode === "url"} onClick={() => setMode("url")}>
              <Link2 className="size-3.5" aria-hidden="true" />
              Paste URL
            </ModeTab>
          </div>

          {mode === "upload" ? (
            <label
              htmlFor={id ? `${id}-file` : "image-upload"}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 px-4 py-6 text-center transition-colors",
                "hover:bg-cream-deep/60",
              )}
            >
              {uploading ? (
                <>
                  <LoaderCircle className="size-5 animate-spin text-bronze-600" aria-hidden="true" />
                  <span className="text-xs font-medium text-ink">Uploading… {progress}%</span>
                  <span className="h-1 w-40 overflow-hidden rounded-full bg-ink/10">
                    <span
                      className="block h-full rounded-full bg-bronze-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud className="size-5 text-ink-muted" aria-hidden="true" />
                  <span className="text-xs font-medium text-ink">
                    Click to upload {label.toLowerCase()}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    PNG, JPG or WebP · up to {IMAGE_MAX_MB} MB
                  </span>
                </>
              )}
              <input
                id={id ? `${id}-file` : "image-upload"}
                ref={inputRef}
                type="file"
                accept={IMAGE_ACCEPT}
                className="sr-only"
                disabled={uploading}
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>
          ) : (
            <div className="flex flex-col gap-2 px-3 py-3">
              <div className="flex gap-2">
                <TextInput
                  value={urlDraft}
                  onChange={(event) => setUrlDraft(event.target.value)}
                  placeholder="https://…"
                  aria-label={`${label} URL`}
                />
                <AdminButton
                  size="sm"
                  onClick={() => {
                    if (!/^https?:\/\/\S+$|^\//.test(urlDraft.trim())) {
                      setError("Enter a valid URL (https://…).");
                      return;
                    }
                    setError(null);
                    onChange({ url: urlDraft.trim(), publicId: "", width: 0, height: 0 });
                    setUrlDraft("");
                  }}
                  type="button"
                >
                  Attach
                </AdminButton>
              </div>
              <p className="text-[11px] leading-relaxed text-ink-muted">
                Direct uploads use signed Cloudinary parameters — configure the
                Cloudinary environment variables to enable the Upload tab in production.
              </p>
            </div>
          )}
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FileUploader({ value, onChange, folder = "downloads", id }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [urlDraft, setUrlDraft] = useState("");

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setError(null);
      if (file.size > RAW_MAX_MB * 1024 * 1024) {
        setError(`Files must be under ${RAW_MAX_MB} MB.`);
        return;
      }
      setUploading(true);
      setProgress(0);
      try {
        const asset = await uploadsApi.upload(file, {
          folder,
          resourceType: "raw",
          onProgress: setProgress,
        });
        onChange({
          url: asset.url,
          publicId: asset.publicId,
          name: file.name,
          bytes: asset.bytes || file.size,
        });
      } catch (cause) {
        setError(cause?.message ?? "Upload failed. You can paste a file URL instead.");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange],
  );

  return (
    <div>
      {value?.url ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-cream-deep/40 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <FileIcon className="size-4 shrink-0 text-bronze-600" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-ink">{value.name || "Attached file"}</p>
              {value.bytes ? (
                <p className="text-[11px] text-ink-muted">{formatBytes(value.bytes)}</p>
              ) : null}
            </div>
          </div>
          <AdminButton size="xs" variant="danger-quiet" onClick={() => onChange(null)} type="button">
            <X className="size-3" aria-hidden="true" />
            Remove
          </AdminButton>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-cream-deep/30 px-3 py-4">
          <label className="flex cursor-pointer flex-col items-center gap-1.5 text-center transition-colors hover:bg-cream-deep/60">
            {uploading ? (
              <>
                <LoaderCircle className="size-5 animate-spin text-bronze-600" aria-hidden="true" />
                <span className="text-xs font-medium text-ink">Uploading… {progress}%</span>
              </>
            ) : (
              <>
                <UploadCloud className="size-5 text-ink-muted" aria-hidden="true" />
                <span className="text-xs font-medium text-ink">Click to upload the file</span>
                <span className="text-[11px] text-ink-muted">PDF, XLSX, DOCX or ZIP · up to {RAW_MAX_MB} MB</span>
              </>
            )}
            <input
              id={id ? `${id}-file` : "file-upload"}
              type="file"
              accept=".pdf,.xlsx,.docx,.zip,.epub"
              className="sr-only"
              disabled={uploading}
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </label>
          <div className="mt-3 flex gap-2">
            <TextInput
              value={urlDraft}
              onChange={(event) => setUrlDraft(event.target.value)}
              placeholder="…or paste a file URL (https://example.com/guide.pdf)"
              aria-label="File URL"
            />
            <AdminButton
              size="sm"
              type="button"
              onClick={() => {
                const url = urlDraft.trim();
                if (!/^https?:\/\/\S+$|^\//.test(url)) {
                  setError("Enter a valid URL.");
                  return;
                }
                setError(null);
                const name = url.split("/").pop()?.split("?")[0] || "resource";
                onChange({ url, publicId: "", name, bytes: 0 });
                setUrlDraft("");
              }}
            >
              Attach
            </AdminButton>
          </div>
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ModeTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px inline-flex items-center gap-1.5 rounded-t-md border border-b-0 px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-line bg-white text-ink"
          : "border-transparent text-ink-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
