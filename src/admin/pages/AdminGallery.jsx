import { useState } from "react";
import { ImagePlus, MoreVertical, Pencil, Plus, SearchX, Trash2, Upload } from "lucide-react";
import { galleryApi } from "../../lib/api";
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
  TextArea,
  TextInput,
} from "../components/ui";
import Dropdown from "../components/Dropdown";
import Modal, { ConfirmDialog } from "../components/Modal";
import { ImageUploader } from "../components/MediaUploader";

/**
 * AdminGallery — image management: signed Cloudinary uploads
 * (with URL fallback), edit-in-place of title/caption/category,
 * ordering, search, category filter and confirmed deletes that
 * also attempt Cloudinary cleanup (gracefully).
 */
export default function AdminGallery() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useResource(
    (signal) => galleryApi.list({ limit: 100 }, signal),
    [],
  );

  const queryParams = { q: debouncedSearch, category, page, limit: 12 };
  const { data, loading, error, retry } = useResource(
    (signal) => galleryApi.list(queryParams, signal),
    [debouncedSearch, category, page],
  );

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", caption: "", category: "", order: 0, image: null });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const knownCategories = Array.from(
    new Set([...(categoriesData?.items ?? []).map((item) => item.category)]),
  );

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      caption: "",
      category: knownCategories[0] ?? "Editorial",
      order: (data?.total ?? 0) + 1,
      image: null,
    });
    setFormErrors({});
    setEditorOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title ?? "",
      caption: item.caption ?? "",
      category: item.category ?? "",
      order: item.order ?? 0,
      image: item.image?.url ? item.image : null,
    });
    setFormErrors({});
    setEditorOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (form.title.trim().length < 2) nextErrors.title = "Title must be at least 2 characters.";
    if (!form.category.trim()) nextErrors.category = "Category is required.";
    if (!editing && !form.image) nextErrors.image = "Attach an image first.";
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        caption: form.caption.trim(),
        category: form.category.trim(),
        order: Number(form.order) || 0,
        image: form.image,
      };
      if (editing) {
        await galleryApi.update(editing._id, payload);
        toast.success("Image updated.");
      } else {
        await galleryApi.create(payload);
        toast.success("Image added to the gallery.");
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

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const result = await galleryApi.remove(pendingDelete._id);
      toast.success(
        result?.mediaDeleted
          ? "Image deleted (Cloudinary asset removed too)."
          : "Gallery record deleted.",
      );
      setPendingDelete(null);
      retry();
    } catch (cause) {
      toast.error(cause.message);
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(search || category);
  const items = data?.items ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Gallery"
        description="The curated visual archive. Uploads stream directly to Cloudinary."
        actions={
          <AdminButton onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Add image
          </AdminButton>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <AdminSearchInput
          id="admin-gallery-search"
          value={search}
          onChange={setSearch}
          placeholder="Search titles and captions…"
          className="sm:max-w-xs"
        />
        <Select
          aria-label="Filter by category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          className="sm:w-44"
        >
          <option value="">All categories</option>
          {knownCategories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <Panel>
          <AdminEmptyState
            title="Gallery could not load"
            description={error.message}
            action={
              <AdminButton size="sm" variant="secondary" onClick={retry}>
                Retry
              </AdminButton>
            }
          />
        </Panel>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-xl border border-line bg-white">
              <div className="aspect-[4/3] animate-pulse bg-ink/[0.06]" />
              <div className="space-y-2 p-3">
                <div className="h-3 w-2/3 animate-pulse rounded bg-ink/[0.06]" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-ink/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Panel>
          <AdminEmptyState
            icon={hasFilters ? SearchX : ImagePlus}
            title={hasFilters ? "No images match" : "The gallery is empty"}
            description={
              hasFilters
                ? "Adjust the search or category filter."
                : "Upload the first image — it goes straight to Cloudinary."
            }
            action={
              hasFilters ? (
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                  }}
                >
                  Clear filters
                </AdminButton>
              ) : (
                <AdminButton size="sm" onClick={openCreate}>
                  <Upload className="size-3.5" aria-hidden="true" />
                  Add image
                </AdminButton>
              )
            }
          />
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <figure
                key={item._id}
                className="group overflow-hidden rounded-xl border border-line bg-white"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
                  <img
                    src={item.image?.url}
                    alt={item.caption || item.title}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-2 top-2 rounded-md bg-ink-deep/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cream backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>
                <figcaption className="flex items-start justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink" title={item.title}>
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      Order {item.order}
                      {item.image?.width ? ` · ${item.image.width}×${item.image.height}` : ""}
                    </p>
                  </div>
                  <Dropdown
                    align="right"
                    label={`Actions for ${item.title}`}
                    trigger={
                      <span className="inline-flex size-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink">
                        <MoreVertical className="size-4" aria-hidden="true" />
                      </span>
                    }
                    items={[
                      { label: "Edit", icon: Pencil, onSelect: () => openEdit(item) },
                      { divider: true },
                      { label: "Delete", icon: Trash2, danger: true, onSelect: () => setPendingDelete(item) },
                    ]}
                  />
                </figcaption>
              </figure>
            ))}
          </div>

          {data.totalPages > 1 ? (
            <div className="mt-5 flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
              <p className="text-xs text-ink-muted">
                Page {data.page} of {data.totalPages} · {data.total} images
              </p>
              <div className="flex gap-2">
                <AdminButton
                  size="xs"
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </AdminButton>
                <AdminButton
                  size="xs"
                  variant="secondary"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </AdminButton>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Editor modal */}
      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? "Edit image" : "Add image"}
        description="Title and caption are shown in the public lightbox."
      >
        <form onSubmit={save} noValidate className="space-y-4">
          <Field
            label="Image"
            required={!editing}
            error={formErrors.image}
          >
            <ImageUploader
              id="gallery-image"
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
              folder="gallery"
              label="Gallery image"
            />
          </Field>

          <Field label="Title" required error={formErrors.title} htmlFor="gallery-title">
            <TextInput
              id="gallery-title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              hasError={Boolean(formErrors.title)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" required error={formErrors.category} htmlFor="gallery-category">
              <TextInput
                id="gallery-category"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                list="gallery-category-options"
                hasError={Boolean(formErrors.category)}
                placeholder="e.g. Consulting"
              />
              <datalist id="gallery-category-options">
                {knownCategories.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </Field>
            <Field label="Display order" hint="ascending" htmlFor="gallery-order">
              <TextInput
                id="gallery-order"
                type="number"
                min={0}
                value={form.order}
                onChange={(event) => setForm({ ...form, order: event.target.value })}
              />
            </Field>
          </div>

          <Field label="Caption" hint="optional" htmlFor="gallery-caption">
            <TextArea
              id="gallery-caption"
              rows={2}
              value={form.caption}
              onChange={(event) => setForm({ ...form, caption: event.target.value })}
              placeholder="Shown beneath the image in the lightbox"
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <AdminButton variant="secondary" type="button" onClick={() => setEditorOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" loading={saving}>
              {editing ? "Save changes" : "Add to gallery"}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this image?"
        message={`"${pendingDelete?.title}" will be removed from the gallery and its Cloudinary asset will be deleted.`}
      />
    </div>
  );
}
