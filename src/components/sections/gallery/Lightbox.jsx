import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import ImageWithFallback from "../../common/ImageWithFallback";

/**
 * Lightbox — full-screen image viewer for the gallery.
 * Keyboard: Escape closes, ←/→ navigate. Backdrop click closes.
 * Locks body scroll while open and restores focus to the close
 * button on mount so keyboard users aren't stranded.
 */
export default function Lightbox({ images, index, onClose, onNavigate }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const image = images[index];

  const goPrev = useCallback(() => {
    onNavigate((index - 1 + images.length) % images.length);
  }, [index, images.length, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate((index + 1) % images.length);
  }, [index, images.length, onNavigate]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
      /* Focus trap — Tab cycles inside the dialog so keyboard users
         never land behind the modal. */
      if (event.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
        );
        if (focusables.length > 0) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, goPrev, goNext]);

  if (!image) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer — ${image.alt}`}
      className="fixed inset-0 z-[70] flex flex-col bg-ink-deep/95 animate-fade-in"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 sm:px-8 sm:py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cream/60">
          {image.category} · {index + 1} / {images.length}
        </p>
        <button
          type="button"
          ref={closeRef}
          onClick={onClose}
          aria-label="Close image viewer"
          className="inline-flex size-10 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors hover:border-bronze-300 hover:text-bronze-300"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Image stage */}
      <div
        className="relative flex flex-1 items-center justify-center px-4 pb-6 sm:px-16"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/20 bg-ink-deep/60 text-cream backdrop-blur-sm transition-colors hover:border-bronze-300 hover:text-bronze-300 sm:left-6"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>

        <figure className="flex max-h-full flex-col items-center gap-4">
          <ImageWithFallback
            key={image.id}
            src={image.src}
            alt={image.alt}
            className="max-h-[68vh] w-auto max-w-full rounded-lg object-contain shadow-lift"
            iconClassName="text-bronze-300"
          />
          <figcaption className="max-w-xl text-center text-sm leading-relaxed text-cream/75">
            {image.alt}
          </figcaption>
        </figure>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next image"
          className="absolute right-2 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/20 bg-ink-deep/60 text-cream backdrop-blur-sm transition-colors hover:border-bronze-300 hover:text-bronze-300 sm:right-6"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
