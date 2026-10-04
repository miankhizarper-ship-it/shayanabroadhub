import { useState } from "react";
import {
  Download as DownloadIcon,
  Eye,
  FileArchive,
  FileSpreadsheet,
  FileText,
  MoreVertical,
  Pencil,
  Plus,
  SearchX,
  Trash2,
  Upload,
} from "lucide-react";
import { downloadsApi } from "../../lib/api";
import { useResource } from "../../hooks/useResource";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useToast } from "../context/ToastContext";
import {
  AdminButton,
  AdminEmptyState,
  AdminPageHeader,
  AdminSearchInput,
  Field,
  Panel,
  Select,
  StatusBadge,
  TextArea,
  TextInput,
  Toggle,
} from "../components/ui";
import DataTable from "../components/DataTable";
import Dropdown from "../components/Dropdown";
import Modal, { ConfirmDialog } from "../components/Modal";
import { FileUploader, ImageUploader } from "../components/MediaUploader";

/**
 * AdminDownloads — resource library management: file + cover
 * uploads, metadata editing, publish toggle, category filter,
 * search and the download counter from the public site.
 */

const FILE_TYPES = ["PDF", "XLSX", "DOCX", "ZIP", "EPUB"];

const typeIcons = {
  PDF: FileText,
  XLSX: FileSpreadsheet,
  DOCX: FileText,
  ZIP: FileArchive,
  EPUB: FileText,
};

const detectFileType = (name = "") => {
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "PDF";
  if (extension === "xlsx" || extension === "xls") return "XLSX";
  if (extension === "docx" || extension === "doc") return "DOCX";
  if (extension === "epub") return "EPUB";
  return "ZIP";
};

const BLANK = {
  title: "",
  description: "",
  category: "",
  fileType: "PDF",
  fileSize: "",
  status: "draft",
  file: null,
  coverImage: null,
};

export default function AdminDownloads() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data: allData } = useResource(
    (signal) => downloadsApi.list({ limit: 100 }, signal),
    [],
  );

  const queryParams = { q: debouncedSearch, category, status, page, limit: 10 };
  const { data, loading, error, retry } = useResource(
    (signal) => downloadsApi.list(queryParams, signal),
    [debouncedSearch, category, status, page],
  );

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [rowBusy, setRowBusy] = useState(null);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const knownCategories = Array.from(
    new Set((allData?.items ?? []).map((item) => item.category)),
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...BLANK, category: knownCategories[0] ?? "Templates" });
    setFormErrors({});
    setEditorOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title ?? "",
      description: item.description ?? "",
      category: item.category ?? "",
      fileType: item.fileType ?? "PDF",
      fileSize: item.fileSize ?? "",
      status: item.status ?? "draft",
      file: item.file?.url ? item.file : null,
      coverImage: item.coverImage?.url ? item.coverImage : null,
    });
    setFormErrors({});
    setEditorOpen(true);
  };

  const handleFileChange = (file) => {
    setForm((current) => {
      const next = { ...current, file };
      if (file?.name) {
        next.fileType = detectFileType(file.name);
        if (!current.fileSize && file.bytes) {
          next.fileSize = `${(file.bytes / (1024 * 1024)).toFixed(1)} MB`;
        }
      }
      return next;
    });
  };

  const validate = () => {
    const next = {};
    if (form.title.trim().length < 3) next.title = "Title must be at least 3 characters.";
    if (form.description.trim().length < 10) next.description = "Description must be at least 10 characters.";
    if (!form.category.trim()) next.category = "Category is required.";
    if (!form.file) next.file = "Attach the downloadable file.";
    return next;
  };

  const save = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        fileType: form.fileType,
        fileSize: form.fileSize.trim(),
        status: form.status,
        file: form.file,
        coverImage: form.coverImage,
      };
      if (editing) {
        await downloadsApi.update(editing._id, payload);
        toast.success("Resource updated.");
      } else {
        await downloadsApi.create(payload);
        toast.success("Resource added to the library.");
      }
      setEditorOpen(false);
      retry();
    } catch (cause) {
      if (cause.isValidationError) setFormErrors(cause.details);
      else toast.error(cause.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item) => {
    setRowBusy(item._id);
    try {
      await downloadsApi.update(item._id, {
        status: item.status === "published" ? "draft" : "published",
      });
      toast.success(item.status === "published" ? "Resource unpublished." : "Resource published.");
      retry();
    } catch (cause) {
      toast.error(cause.message);
    } finally {
      setRowBusy(null);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await downloadsApi.remove(pendingDelete._id);
      toast.success("Resource deleted.");
      setPendingDelete(null);
      retry();
    } catch (cause) {
      toast.error(cause.message);
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(search || category || status);
  const items = data?.items ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Downloads"
        description="The public resource library — files live in Cloudinary, counters update live."
        actions={
          <AdminButton onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            New resource
          </AdminButton>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <AdminSearchInput
          id="admin-download-search"
          value={search}
          onChange={setSearch}
          placeholder="Search resources…"
          className="sm:max-w-xs"
        />
        <Select
          aria-label="Filter by category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          className="sm:w-40"
        >
          <option value="">All categories</option>
          {knownCategories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="sm:w-36"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      </div>

      {error ? (
        <Panel>
          <AdminEmptyState
            title="Downloads could not load"
            description={error.message}
            action={
              <AdminButton size="sm" variant="secondary" onClick={retry}>
                Retry
              </AdminButton>
            }
          />
        </Panel>
      ) : (
        <DataTable
          columns={[
            {
              key: "title",
              header: "Resource",
              render: (item) => {
                const Icon = typeIcons[item.fileType] ?? FileText;
                return (
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-bronze-50 text-bronze-700">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{item.title}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {item.fileType}
                        {item.fileSize ? ` · ${item.fileSize}` : ""} · {item.category}
                      </p>
                    </div>
                  </div>
                );
              },
            },
            {
              key: "downloadCount",
              header: "Downloads",
              render: (item) => (
                <span className="inline-flex items-center gap-1.5 tabular-nums text-ink-soft">
                  <DownloadIcon className="size-3.5 text-ink-muted" aria-hidden="true" />
                  {item.downloadCount ?? 0}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (item) => (
                <StatusBadge tone={item.status}>
                  {item.status === "published" ? "Published" : "Draft"}
                </StatusBadge>
              ),
            },
          ]}
          items={items}
          loading={loading}
          rowKey={(item) => item._id}
          pagination={
            data
              ? { page: data.page, totalPages: data.totalPages, total: data.total, limit: data.limit }
              : undefined
          }
          onPageChange={setPage}
          emptyState={
            hasFilters ? (
              <AdminEmptyState
                icon={SearchX}
                title="No resources match"
                description="Adjust the search or filters."
                action={
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setCategory("");
                      setStatus("");
                    }}
                  >
                    Clear filters
                  </AdminButton>
                }
              />
            ) : (
              <AdminEmptyState
                icon={Upload}
                title="The library is empty"
                description="Add the first downloadable resource."
                action={
                  <AdminButton size="sm" onClick={openCreate}>
                    <Plus className="size-3.5" aria-hidden="true" />
                    New resource
                  </AdminButton>
                }
              />
            )
          }
          rowActions={(item) => (
            <Dropdown
              align="right"
              label={`Actions for ${item.title}`}
              trigger={
                <span className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink">
                  {rowBusy === item._id ? (
                    <span className="size-4 animate-pulse rounded-full bg-ink/10" aria-hidden="true" />
                  ) : (
                    <MoreVertical className="size-4" aria-hidden="true" />
                  )}
                </span>
              }
              items={[
                { label: "Edit", icon: Pencil, onSelect: () => openEdit(item) },
                {
                  label: item.status === "published" ? "Unpublish" : "Publish",
                  icon: Eye,
                  onSelect: () => toggleStatus(item),
                },
                { divider: true },
                { label: "Delete", icon: Trash2, danger: true, onSelect: () => setPendingDelete(item) },
              ]}
            />
          )}
        />
      )}

      {/* Editor modal */}
      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? "Edit resource" : "New resource"}
        description="The file uploads directly to Cloudinary; metadata appears on the public card."
      >
        <form onSubmit={save} noValidate className="space-y-4">
          <Field label="Downloadable file" required={!editing} error={formErrors.file}>
            <FileUploader
              id="download-file"
              value={form.file}
              onChange={handleFileChange}
              folder="downloads"
            />
          </Field>

          <Field label="Title" required error={formErrors.title} htmlFor="download-title">
            <TextInput
              id="download-title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              hasError={Boolean(formErrors.title)}
            />
          </Field>

          <Field label="Description" required error={formErrors.description} htmlFor="download-description">
            <TextArea
              id="download-description"
              rows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              hasError={Boolean(formErrors.description)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Category" required error={formErrors.category} htmlFor="download-category">
              <TextInput
                id="download-category"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                list="download-category-options"
                hasError={Boolean(formErrors.category)}
              />
              <datalist id="download-category-options">
                {knownCategories.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </Field>
            <Field label="File type" error={formErrors.fileType} htmlFor="download-filetype">
              <Select
                id="download-filetype"
                value={form.fileType}
                onChange={(event) => setForm({ ...form, fileType: event.target.value })}
              >
                {FILE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="File size label" hint="shown on card" htmlFor="download-filesize">
              <TextInput
                id="download-filesize"
                value={form.fileSize}
                onChange={(event) => setForm({ ...form, fileSize: event.target.value })}
                placeholder="1.2 MB"
              />
            </Field>
          </div>

          <Field label="Cover image" hint="optional" error={formErrors.coverImage}>
            <ImageUploader
              id="download-cover"
              value={form.coverImage}
              onChange={(coverImage) => setForm({ ...form, coverImage })}
              folder="downloads"
              label="Cover image"
            />
          </Field>

          <div className="rounded-lg border border-line bg-cream-deep/40 p-4">
            <Toggle
              id="download-status"
              checked={form.status === "published"}
              onChange={(checked) => setForm({ ...form, status: checked ? "published" : "draft" })}
              label="Published"
              description="Visible in the public resource library."
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <AdminButton variant="secondary" type="button" onClick={() => setEditorOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" loading={saving}>
              {editing ? "Save changes" : "Add resource"}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this resource?"
        message={`"${pendingDelete?.title}" will be removed from the library and its Cloudinary file will be deleted.`}
      />
    </div>
  );
}
