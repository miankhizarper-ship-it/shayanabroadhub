import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Restores the scroll position to the top of the page whenever
 * the route changes — standard behavior for SPA navigation.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
