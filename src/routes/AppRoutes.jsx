import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import Home from "../pages/Home";
import About from "../pages/About";
import Blogs from "../pages/Blogs";
import BlogDetails from "../pages/BlogDetails";
import Services from "../pages/Services";
import Gallery from "../pages/Gallery";
import Contact from "../pages/Contact";
import Downloads from "../pages/Downloads";
import NotFound from "../pages/NotFound";

/* The admin CMS is a separate application tree — code-split so the
   public bundle never carries it. */
const AdminRoot = lazy(() => import("../admin/AdminRoot"));

function AdminBoot() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-deep">
      <span
        aria-hidden="true"
        className="inline-flex size-9 animate-pulse items-center justify-center rounded-lg bg-bronze-600 font-display text-sm italic text-white"
      >
        S
      </span>
      <span className="sr-only">Loading the content studio…</span>
    </div>
  );
}

/**
 * Application route table.
 *
 * Public site (inside PublicLayout — Navbar + Footer):
 *   /              Home
 *   /about         About
 *   /blogs         Journal index
 *   /blogs/:slug   Single article
 *   /services      Services
 *   /gallery       Gallery
 *   /contact       Contact & consultation
 *   /downloads     Resource library
 *   *              Custom 404
 *
 * Admin CMS (own shell, lazy-loaded, session-guarded):
 *   /admin/login   Sign-in
 *   /admin/*       Dashboard + CRUD screens (see admin/AdminRoot.jsx)
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:slug" element={<BlogDetails />} />
        <Route path="/services" element={<Services />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<AdminBoot />}>
            <AdminRoot />
          </Suspense>
        }
      />
    </Routes>
  );
}
