import { useEffect, useState } from "react";

/**
 * Tracks whether the window has scrolled past a threshold.
 * Used by the Navbar to switch between the transparent and
 * the frosted/solid presentation.
 *
 * @param {number} [threshold=8] scroll distance in pixels
 * @returns {boolean}
 */
export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
