import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * ImageWithFallback — resilient <img> wrapper.
 *
 * Shows a styled tonal placeholder if the remote source fails to
 * load (offline, CDN hiccup, dead id), so layouts never show a
 * broken-image glyph. Everything else forwards to <img>.
 */
export default function ImageWithFallback({
  src,
  alt,
  className,
  wrapperClassName,
  iconClassName,
  ...rest
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-bronze-100 via-cream-deep to-bronze-200",
          className,
          wrapperClassName,
        )}
      >
        <ImageOff
          className={cn("size-6 text-bronze-400", iconClassName)}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("bg-cream-deep object-cover", className)}
      {...rest}
    />
  );
}
