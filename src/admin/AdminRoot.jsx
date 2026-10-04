import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { ToastProvider } from "./context/ToastContext";
import { useSeo } from "../utils/seo";
import AdminLayout, { RequireAdmin, RedirectIfAuthed } from "./components/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBlogs from "./pages/AdminBlogs";
import AdminBlogEditor from "./pages/AdminBlogEditor";
import AdminCategories from "./pages/AdminCategories";
import AdminServices from "./pages/AdminServices";
import AdminGallery from "./pages/AdminGallery";
import AdminDownloads from "./pages/AdminDownloads";
import AdminMessages from "./pages/AdminMessages";
import AdminPages from "./pages/AdminPages";
import AdminSettings from "./pages/AdminSettings";
import AdminNotFound from "./pages/AdminNotFound";

/**
 * AdminRoot — the CMS application tree, mounted at /admin/*.
 *
 * Route contract:
 *   /admin/login            → public (redirects authed admins in)
 *   /admin                  → dashboard
 *   /admin/blogs            → blog list
 *   /admin/blogs/new        → create
 *   /admin/blogs/:id/edit   → edit
 *   /admin/categories|services|gallery|downloads|messages|pages|settings
 *
 * Everything except /admin/login sits behind <RequireAdmin>, which
 * redirects unauthenticated visitors to /admin/login.
 */
export default function AdminRoot() {
  /* The CMS must never be indexed — one noindex covers every admin
     route (login included) without per-page work. */
  useSeo({ title: "Content Studio", noIndex: true });

  return (
    <AdminAuthProvider>
      <ToastProvider>
        <Routes>
          <Route
            path="login"
            element={
              <RedirectIfAuthed>
                <AdminLogin />
              </RedirectIfAuthed>
            }
          />

          <Route
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="blogs/new" element={<AdminBlogEditor />} />
            <Route path="blogs/:id/edit" element={<AdminBlogEditor />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="downloads" element={<AdminDownloads />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AdminAuthProvider>
  );
}
