import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Download,
  ExternalLink,
  FileStack,
  FolderTree,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings as SettingsIcon,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import Dropdown from "./Dropdown";
import { cn } from "../../utils/cn";
import { initials } from "../../utils/format";

/**
 * AdminLayout — the CMS chrome: dark fixed sidebar (desktop) /
 * slide-in drawer (mobile), sticky topbar with breadcrumbs and the
 * account menu, and the routed <Outlet /> in a neutral work area.
 * Visually distinct from the public editorial site by design.
 */

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/blogs", label: "Blogs", icon: BookOpen },
      { to: "/admin/categories", label: "Categories", icon: FolderTree },
      { to: "/admin/pages", label: "Pages", icon: FileStack },
    ],
  },
  {
    label: "Library",
    items: [
      { to: "/admin/services", label: "Services", icon: Wrench },
      { to: "/admin/gallery", label: "Gallery", icon: Images },
      { to: "/admin/downloads", label: "Downloads", icon: Download },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/messages", label: "Messages", icon: Mail },
      { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  /* Close the mobile drawer on navigation. */
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  /* Scroll lock while the mobile drawer is open. */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const nav = (
    <nav aria-label="Admin sections" className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/35">
            {section.label}
          </p>
          <ul className="mt-2 space-y-0.5">
            {section.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-white/10 text-cream"
                        : "text-cream/60 hover:bg-white/5 hover:text-cream",
                    )
                  }
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-3 border-b border-white/10 px-5 py-[1.15rem]">
      <span
        aria-hidden="true"
        className="inline-flex size-8 items-center justify-center rounded-lg bg-bronze-600 font-display text-sm italic text-white"
      >
        S
      </span>
      <div>
        <p className="text-[13px] font-semibold leading-tight text-cream">Shayan Abroad Hub</p>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-cream/40">
          Content Studio
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#f4f3ef]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink-deep lg:flex">
        {brand}
        {nav}
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-cream/60 transition-colors hover:bg-white/5 hover:text-cream"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          drawerOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!drawerOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ink-deep/50 transition-opacity duration-300",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 flex-col bg-ink-deep shadow-lift transition-transform duration-300",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 pr-2">
            <div className="flex-1">{brand}</div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="rounded-lg p-2 text-cream/60 transition-colors hover:bg-white/10 hover:text-cream"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          {nav}
          <div className="border-t border-white/10 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-cream/60 transition-colors hover:bg-white/5 hover:text-cream"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </aside>
      </div>

      {/* Main column */}
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open admin menu"
              className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>

            <Breadcrumbs />

            <div className="ml-auto flex items-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink sm:inline-flex"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                View site
              </a>

              <Dropdown
                align="right"
                label="Account menu"
                trigger={
                  <span className="flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-ink/5">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-cream"
                    >
                      {initials(admin?.name)}
                    </span>
                    <span className="hidden text-left sm:block">
                      <span className="block text-[13px] font-medium leading-tight text-ink">
                        {admin?.name}
                      </span>
                      <span className="block text-[11px] leading-tight text-ink-muted">
                        {admin?.role ?? "admin"}
                      </span>
                    </span>
                  </span>
                }
                items={[
                  { label: admin?.email ?? "Account", icon: Sparkles, disabled: true },
                  { divider: true },
                  { label: "Sign out", icon: LogOut, onSelect: handleLogout },
                ]}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8" id="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Breadcrumbs derived from the URL, with friendly segment names. */
const SEGMENT_NAMES = {
  admin: "Studio",
  blogs: "Blogs",
  new: "New",
  edit: "Edit",
  categories: "Categories",
  services: "Services",
  gallery: "Gallery",
  downloads: "Downloads",
  messages: "Messages",
  pages: "Pages",
  settings: "Settings",
};

function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-[13px]">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const to = `/${segments.slice(0, index + 1).join("/")}`;
          const name =
            SEGMENT_NAMES[segment] ??
            (segment.length > 18 ? `${segment.slice(0, 15)}…` : segment);
          return (
            <li key={to} className="flex items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden="true" className="text-ink-muted/60">
                  /
                </span>
              ) : null}
              {isLast ? (
                <span aria-current="page" className="truncate font-medium text-ink">
                  {name}
                </span>
              ) : (
                <span className="truncate text-ink-muted">{name}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * RequireAdmin — route guard. While the session is resolving the
 * shell shows a quiet loader; unauthenticated visitors are bounced
 * to /admin/login with the intended location preserved.
 */
export function RequireAdmin({ children }) {
  const { status } = useAdminAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ink-deep">
        <span className="flex items-center gap-3 text-sm text-cream/60">
          <span
            aria-hidden="true"
            className="inline-flex size-8 animate-pulse items-center justify-center rounded-lg bg-bronze-600 font-display text-sm italic text-white"
          >
            S
          </span>
          Checking your session…
        </span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children ?? <Outlet />;
}

/**
 * RedirectIfAuthed — /admin/login bounces authenticated admins
 * straight to the dashboard.
 */
export function RedirectIfAuthed({ children }) {
  const { status } = useAdminAuth();
  if (status === "authenticated") {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
