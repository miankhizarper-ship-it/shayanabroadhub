import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SitePreloader from "./SitePreloader";

/**
 * PublicLayout — chrome for the public website (skip link, fixed
 * Navbar, main content, Footer). Admin routes render their own
 * completely separate CMS shell instead of this layout.
 *
 * The `#root` element is a flex column with min-height 100dvh
 * (see styles/index.css); `<main className="flex-1">` grows to
 * fill the viewport and `mt-auto` on the Footer keeps it pinned
 * to the bottom on short pages — no floating gap, no overlap.
 */
export default function PublicLayout() {
  return (
    <>
      <SitePreloader />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:text-cream"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}
