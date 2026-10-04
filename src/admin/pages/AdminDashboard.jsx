import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Download,
  FilePlus2,
  Image as ImageIcon,
  Inbox,
  Mail,
  Sparkles,
  Wrench,
} from "lucide-react";
import { dashboardApi } from "../../lib/api";
import { useResource } from "../../hooks/useResource";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  AdminErrorState,
  AdminLoading,
  AdminPageHeader,
  Panel,
  PanelHeader,
  StatusBadge,
} from "../components/ui";
import { formatDateTime } from "../../utils/format";

/**
 * AdminDashboard — the /admin landing screen. Every number comes
 * from GET /api/admin/dashboard (one efficient round-trip, no
 * hardcoded statistics).
 */
export default function AdminDashboard() {
  const { data, loading, error, retry } = useResource(
    (signal) => dashboardApi.get(signal),
    [],
  );
  const { admin } = useAdminAuth();

  const stats = data?.stats;

  const cards = [
    { label: "Total Blogs", value: stats?.blogs?.total, icon: BookOpen, to: "/admin/blogs" },
    { label: "Published", value: stats?.blogs?.published, icon: BookOpen, to: "/admin/blogs?status=published", accent: true },
    { label: "Drafts", value: stats?.blogs?.draft, icon: FilePlus2, to: "/admin/blogs?status=draft" },
    { label: "Services", value: stats?.services?.total, icon: Wrench, to: "/admin/services" },
    { label: "Gallery Images", value: stats?.gallery?.total, icon: ImageIcon, to: "/admin/gallery" },
    { label: "Downloads", value: stats?.downloads?.total, icon: Download, to: "/admin/downloads" },
    { label: "Unread Messages", value: stats?.messages?.unread, icon: Mail, to: "/admin/messages", alert: (stats?.messages?.unread ?? 0) > 0 },
  ];

  return (
    <div>
      <AdminPageHeader
        title={`Welcome back, ${admin?.name?.split(" ")[0] ?? "Admin"}.`}
        description="Here is where the site stands today."
        actions={
          <>
            <Link
              to="/admin/blogs/new"
              className="inline-flex items-center gap-2 rounded-lg bg-bronze-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-bronze-700"
            >
              <FilePlus2 className="size-4" aria-hidden="true" />
              New essay
            </Link>
            <Link
              to="/admin/messages"
              className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/30"
            >
              <Inbox className="size-4" aria-hidden="true" />
              Inbox
              {(stats?.messages?.unread ?? 0) > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-bronze-600 px-1.5 text-[11px] font-semibold text-white">
                  {stats.messages.unread}
                </span>
              ) : null}
            </Link>
          </>
        }
      />

      {loading ? (
        <AdminLoading label="Loading dashboard" />
      ) : error ? (
        <Panel>
          <AdminErrorState error={error} onRetry={retry} title="Dashboard could not load" />
        </Panel>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-7">
            {cards.map((card) => (
              <Link
                key={card.label}
                to={card.to}
                className="group rounded-xl border border-line bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-bronze-300 hover:shadow-[0_8px_24px_-12px_rgb(23_22_19/0.25)]"
              >
                <div className="flex items-center justify-between">
                  <card.icon
                    className={card.alert ? "size-4 text-bronze-600" : "size-4 text-ink-muted"}
                    aria-hidden="true"
                  />
                  {card.alert ? (
                    <span className="size-2 rounded-full bg-bronze-500" aria-hidden="true" />
                  ) : null}
                </div>
                <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-ink">
                  {card.value ?? "—"}
                </p>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
                  {card.label}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid min-w-0 gap-5 xl:grid-cols-2">
            {/* Recent blogs */}
            <Panel className="min-w-0 overflow-hidden">
              <PanelHeader
                title="Recent blog posts"
                description="The five most recently touched essays."
                actions={
                  <Link
                    to="/admin/blogs"
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-bronze-700 hover:text-bronze-800"
                  >
                    All blogs
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                }
              />
              {data?.recentBlogs?.length ? (
                <ul className="divide-y divide-line">
                  {data.recentBlogs.map((blog) => (
                    <li key={blog._id}>
                      <Link
                        to={`/admin/blogs/${blog._id}/edit`}
                        className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-cream-deep/40"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{blog.title}</p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {blog.category} · updated {formatDateTime(blog.updatedAt)}
                          </p>
                        </div>
                        <StatusBadge tone={blog.status}>
                          {blog.status === "published" ? "Published" : "Draft"}
                        </StatusBadge>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-ink-muted">
                  No essays yet — publish your first one.
                </p>
              )}
            </Panel>

            {/* Recent messages */}
            <Panel className="min-w-0 overflow-hidden">
              <PanelHeader
                title="Recent messages"
                description="Latest enquiries from the contact form."
                actions={
                  <Link
                    to="/admin/messages"
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-bronze-700 hover:text-bronze-800"
                  >
                    Open inbox
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                }
              />
              {data?.recentMessages?.length ? (
                <ul className="divide-y divide-line">
                  {data.recentMessages.map((message) => (
                    <li key={message._id}>
                      <Link
                        to="/admin/messages"
                        className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-cream-deep/40"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-cream-deep text-[11px] font-semibold text-ink-soft"
                        >
                          {message.name?.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">
                            {message.subject}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-ink-muted">
                            {message.name} · {message.email}
                          </p>
                        </div>
                        <StatusBadge tone={message.status}>
                          {message.status === "unread" ? "New" : message.status}
                        </StatusBadge>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-ink-muted">
                  The inbox is quiet — messages from the contact form land here.
                </p>
              )}
            </Panel>
          </div>

          {/* Admin identity strip */}
          <Panel className="mt-6">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4">
              <span className="flex items-center gap-2 text-[13px] text-ink-soft">
                <Sparkles className="size-4 text-bronze-600" aria-hidden="true" />
                Signed in as{" "}
                <span className="font-medium text-ink">{admin?.email}</span>
              </span>
              <span className="text-[13px] text-ink-soft">
                Role <span className="font-medium uppercase text-ink">{admin?.role}</span>
              </span>
              {admin?.lastLogin ? (
                <span className="text-[13px] text-ink-soft">
                  Last sign-in{" "}
                  <span className="font-medium text-ink">{formatDateTime(admin.lastLogin)}</span>
                </span>
              ) : null}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
