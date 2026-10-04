import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Eye, FilePlus2, MoreVertical, Pencil, SearchX, Star, Trash2 } from "lucide-react";
import { blogsApi, categoriesApi } from "../../lib/api";
import { useResource } from "../../hooks/useResource";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useToast } from "../context/ToastContext";
import {
  AdminButton,
  AdminEmptyState,
  AdminPageHeader,
  AdminSearchInput,
  Panel,
  Select,
  StatusBadge,
} from "../components/ui";
import DataTable, { AdminEmptyState as EmptyState } from "../components/DataTable";
import Dropdown from "../components/Dropdown";
import { ConfirmDialog } from "../components/Modal";
import { formatDateTime } from "../../utils/format";

/**
 * AdminBlogs — blog management: server-side search, status/category/
 * featured filters, pagination, quick actions (publish toggle,
 * feature toggle) and confirmed deletes.
 */
export default function AdminBlogs() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [category, setCategory] = useState("");
  const [featured, setFeatured] = useState("");
  const [page, setPage] = useState(1);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [rowBusy, setRowBusy] = useState(null);

  const { data: categoriesData } = useResource(
    (signal) => categoriesApi.list(signal),
    [],
  );

  const queryParams = useMemo(
    () => ({
      q: debouncedSearch,
      status,
      category,
      featured,
      page,
      limit: 10,
      sort: "updatedAt",
    }),
    [debouncedSearch, status, category, featured, page],
  );

  const { data, loading, error, retry } = useResource(
    (signal) => blogsApi.list(queryParams, signal),
    [queryParams],
  );

  const resetToFirstPage = () => setPage(1);

  const toggleField = async (blog, patch, successMessage) => {
    setRowBusy(blog._id);
    try {
      await blogsApi.update(blog._id, patch);
      toast.success(successMessage);
      retry();
    } catch (cause) {
      toast.error(cause.message);
    } finally {
      setRowBusy(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await blogsApi.remove(pendingDelete._id);
      toast.success(`"${pendingDelete.title}" deleted.`);
      setPendingDelete(null);
      retry();
    } catch (cause) {
      toast.error(cause.message);
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(search || status || category || featured);

  return (
    <div>
      <AdminPageHeader
        title="Blogs"
        description="Essays in the journal — draft, publish and feature them."
        actions={
          <AdminButton onClick={() => navigate("/admin/blogs/new")}>
            <FilePlus2 className="size-4" aria-hidden="true" />
            New essay
          </AdminButton>
        }
      />

      {/* Toolbar */}
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_repeat(3,auto)]">
        <AdminSearchInput
          id="admin-blog-search"
          value={search}
          onChange={(value) => {
            setSearch(value);
            resetToFirstPage();
          }}
          placeholder="Search title, excerpt, category…"
          className="sm:col-span-2 lg:col-span-1"
        />
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            resetToFirstPage();
          }}
          className="lg:w-36"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
        <Select
          aria-label="Filter by category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            resetToFirstPage();
          }}
          className="lg:w-44"
        >
          <option value="">All categories</option>
          {(categoriesData?.items ?? []).map((item) => (
            <option key={item._id} value={item.name}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter by featured flag"
          value={featured}
          onChange={(event) => {
            setFeatured(event.target.value);
            resetToFirstPage();
          }}
          className="lg:w-36"
        >
          <option value="">All posts</option>
          <option value="true">Featured only</option>
          <option value="false">Not featured</option>
        </Select>
      </div>

      {error ? (
        <Panel>
          <ErrorPanel error={error} onRetry={retry} />
        </Panel>
      ) : (
        <DataTable
          columns={[
            {
              key: "title",
              header: "Essay",
              render: (blog) => (
                <div className="flex items-center gap-3">
                  {blog.coverImage?.url ? (
                    <img
                      src={blog.coverImage.url}
                      alt=""
                      className="h-10 w-14 shrink-0 rounded-md border border-line object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="inline-flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-cream-deep text-ink-muted">
                      <BookOpen className="size-4" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate font-medium text-ink">
                      {blog.title}
                      {blog.featured ? (
                        <Star className="size-3.5 shrink-0 fill-bronze-500 text-bronze-500" aria-hidden="true" />
                      ) : null}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      /{blog.slug}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: "category",
              header: "Category",
              className: "hidden md:table-cell",
              render: (blog) => (
                <span className="text-ink-soft">{blog.category}</span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (blog) => (
                <StatusBadge tone={blog.status}>
                  {blog.status === "published" ? "Published" : "Draft"}
                </StatusBadge>
              ),
            },
            {
              key: "updatedAt",
              header: "Updated",
              className: "hidden sm:table-cell",
              render: (blog) => (
                <span className="text-xs text-ink-muted">{formatDateTime(blog.updatedAt)}</span>
              ),
            },
          ]}
          items={data?.items ?? []}
          loading={loading}
          error={error}
          rowKey={(blog) => blog._id}
          pagination={
            data
              ? {
                  page: data.page,
                  totalPages: data.totalPages,
                  total: data.total,
                  limit: data.limit,
                }
              : undefined
          }
          onPageChange={setPage}
          emptyState={
            hasFilters ? (
              <AdminEmptyState
                icon={SearchX}
                title="No essays match those filters"
                description="Adjust the search or filters to find what you are looking for."
                action={
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setStatus("");
                      setCategory("");
                      setFeatured("");
                    }}
                  >
                    Clear filters
                  </AdminButton>
                }
              />
            ) : (
              <AdminEmptyState
                icon={FilePlus2}
                title="No essays yet"
                description="Write your first essay and it will appear in the public journal once published."
                action={<AdminButton size="sm" onClick={() => navigate("/admin/blogs/new")}>New essay</AdminButton>}
              />
            )
          }
          rowActions={(blog) => (
            <Dropdown
              align="right"
              label={`Actions for ${blog.title}`}
              trigger={
                <span className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink">
                  {rowBusy === blog._id ? (
                    <span className="size-4 animate-pulse rounded-full bg-ink/10" aria-hidden="true" />
                  ) : (
                    <MoreVertical className="size-4" aria-hidden="true" />
                  )}
                </span>
              }
              items={[
                {
                  label: "Edit",
                  icon: Pencil,
                  onSelect: () => navigate(`/admin/blogs/${blog._id}/edit`),
                },
                {
                  label: "View public page",
                  icon: Eye,
                  disabled: blog.status !== "published",
                  onSelect: () => window.open(`/blogs/${blog.slug}`, "_blank"),
                },
                {
                  label: blog.status === "published" ? "Unpublish" : "Publish",
                  icon: BookOpen,
                  onSelect: () =>
                    toggleField(
                      blog,
                      { status: blog.status === "published" ? "draft" : "published" },
                      blog.status === "published" ? "Essay unpublished." : "Essay published.",
                    ),
                },
                {
                  label: blog.featured ? "Remove featured" : "Mark featured",
                  icon: Star,
                  onSelect: () =>
                    toggleField(
                      blog,
                      { featured: !blog.featured },
                      blog.featured ? "Removed from featured." : "Marked as featured.",
                    ),
                },
                { divider: true },
                {
                  label: "Delete",
                  icon: Trash2,
                  danger: true,
                  onSelect: () => setPendingDelete(blog),
                },
              ]}
            />
          )}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this essay?"
        message={`"${pendingDelete?.title}" will be permanently removed from the journal. This cannot be undone.`}
      />
    </div>
  );
}

function ErrorPanel({ error, onRetry }) {
  return (
    <EmptyState
      title="Blogs could not load"
      description={error?.message}
      action={<AdminButton size="sm" variant="secondary" onClick={onRetry}>Retry</AdminButton>}
    />
  );
}
