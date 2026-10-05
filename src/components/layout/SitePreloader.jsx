import { useEffect, useState } from "react";
import { onAppReady } from "../../utils/boot";

/**
 * SitePreloader — a branded first-load curtain.
 *
 * Covers the public site until it has FULLY loaded: both the first
 * data fetch (via the `shb:app-ready` signal from useResource) and
 * the browser's `load` event (all assets — images, fonts — done)
 * must settle before the curtain fades out and unmounts. A 4-second
 * failsafe guarantees the site always presents itself — even on
 * views that fetch nothing, or when a resource stalls (skeletons/
 * empty states take over gracefully).
 *
 * Rendered inside PublicLayout only, so the admin CMS (which has its
 * own boot screen) is never covered by it.
 */
export default function SitePreloader() {
  /* visible → fading (opacity transition) → gone (unmounted). */
  const [phase, setPhase] = useState("visible");

  useEffect(() => {
    let goneTimer;
    let dataReady = false;
    /* A navigation may mount this layout after `load` already fired. */
    let loadReady = document.readyState === "complete";

    const hide = () => {
      setPhase((current) => {
        if (current !== "visible") return current;
        goneTimer = setTimeout(() => setPhase("gone"), 500);
        return "fading";
      });
    };

    /* Present the site only once everything has settled. */
    const settle = () => {
      if (dataReady && loadReady) hide();
    };

    const off = onAppReady(() => {
      dataReady = true;
      settle();
    });
    const onLoad = () => {
      loadReady = true;
      settle();
    };
    window.addEventListener("load", onLoad);
    const failsafe = setTimeout(hide, 4000);

    return () => {
      off?.();
      window.removeEventListener("load", onLoad);
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
