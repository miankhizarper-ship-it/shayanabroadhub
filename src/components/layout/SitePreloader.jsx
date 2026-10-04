import { useEffect, useState } from "react";
import { onAppReady } from "../../utils/boot";

/**
 * SitePreloader — a branded first-load curtain.
 *
 * Covers the public site until its first data fetch settles (via the
 * `shb:app-ready` signal from useResource), then fades out and
 * unmounts. A 3-second failsafe guarantees the site always presents
 * itself — even on views that fetch nothing, or when the API is
 * unreachable (skeletons/empty states take over gracefully).
 *
 * Rendered inside PublicLayout only, so the admin CMS (which has its
 * own boot screen) is never covered by it.
 */
export default function SitePreloader() {
  /* visible → fading (opacity transition) → gone (unmounted). */
  const [phase, setPhase] = useState("visible");

  useEffect(() => {
    let goneTimer;
    const hide = () => {
      setPhase((current) => {
        if (current !== "visible") return current;
        goneTimer = setTimeout(() => setPhase("gone"), 500);
        return "fading";
      });
    };

    const off = onAppReady(hide);
    const failsafe = setTimeout(hide, 3000);

    return () => {
      off?.();
      clearTimeout(failsafe);
      clearTimeout(goneTimer);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-cream transition-opacity duration-500 ease-out ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Monogram */}
      <span className="flex size-14 items-center justify-center rounded-2xl bg-ink-deep font-display text-lg italic text-cream shadow-lift">
        SA
      </span>

      {/* Wordmark */}
      <p className="font-display text-2xl font-medium tracking-tight text-ink">
        Shayan <span className="italic text-bronze-600">Abroad</span> Hub
      </p>

      {/* Thin loading rule */}
      <span className="relative block h-px w-40 overflow-hidden bg-ink/10">
        <span className="preloader-bar absolute inset-y-0 left-0 w-1/3 bg-bronze-500" />
      </span>
    </div>
  );
}
