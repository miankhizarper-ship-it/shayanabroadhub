import { useMemo, useState } from "react";
import { FolderTree, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { categoriesApi } from "../../lib/api";
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
  TextArea,
  TextInput,
} from "../components/ui";
import DataTable from "../components/DataTable";
import Dropdown from "../components/Dropdown";
import Modal, { ConfirmDialog } from "../components/Modal";

/**
 * AdminCategories — create/edit/delete categories with duplicate
 * guards (server 422s surface on the form), live usage counts and
 * a 409-protected delete (in-use categories cannot be deleted).
 */
export default function AdminCategories() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, loading, error, retry } = useResource(
    (signal) => categoriesApi.list({ q: debouncedSearch }, signal),
    [debouncedSearch],
  );

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create
  const [form, setForm] = useState({ name: "", description: "" });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const items = data?.items ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setFormErrors({});
    setEditorOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({ name: category.name, description: category.description ?? "" });
    setFormErrors({});
    setEditorOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Name must be at least 2 characters.";
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      if (editing) {
        await categoriesApi.update(editing._id, form);
        toast.success("Category updated — references were kept in sync.");
      } else {
        await categoriesApi.create(form);
        toast.success("Category created.");
      }
      setEditorOpen(false);
      retry();
    } catch (cause) {
      if (cause.isValidationError) {
        setFormErrors(cause.details);
      } else {
        toast.error(cause.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await categoriesApi.remove(pendingDelete._id);
      toast.success("Category deleted.");
      setPendingDelete(null);
      retry();
    } catch (cause) {
      setPendingDelete(null);
      if (cause.status === 409) {
        toast.warning(cause.message);
      } else {
        toast.error(cause.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  const totalUsage = useMemo(
    () =>
      items.reduce((sum, item) => sum + (item.usage?.blogs ?? 0) + (item.usage?.gallery ?? 0) + (item.usage?.downloads ?? 0), 0),
    [items],
  );

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description={`${items.length} categor${items.length === 1 ? "y" : "ies"} · ${totalUsage} tagged item${totalUsage === 1 ? "" : "s"}`}
        actions={
          <AdminButton onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            New category
          </AdminButton>
        }
      />

      <div className="mb-4">
        <AdminSearchInput
          id="admin-category-search"
          value={search}
          onChange={setSearch}
          placeholder="Search categories…"
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Category",
            render: (item) => (
              <div>
                <p className="font-medium text-ink">{item.name}</p>
                <p className="mt-0.5 text-xs text-ink-muted">/{item.slug}</p>
              </div>
            ),
          },
          {
            key: "usage",
            header: "Used by",
            render: (item) => (
              <span className="text-[13px] text-ink-soft">
                {item.usage?.blogs ?? 0} blogs · {item.usage?.gallery ?? 0} images ·{" "}
                {item.usage?.downloads ?? 0} resources
              </span>
            ),
          },
          {
            key: "description",
            header: "Description",
            className: "hidden lg:table-cell",
            render: (item) => (
              <span className="line-clamp-1 text-[13px] text-ink-muted">
                {item.description || "—"}
              </span>
            ),
          },
        ]}
        items={items}
        loading={loading}
        error={error}
        onRetry={retry}
        rowKey={(item) => item._id}
        emptyState={
          <AdminEmptyState
            icon={FolderTree}
            title={search ? "No categories match" : "No categories yet"}
            description={
              search
                ? "Try a different search term."
                : "Categories organise blogs, gallery images and downloads."
            }
            action={
              search ? undefined : (
                <AdminButton size="sm" onClick={openCreate}>
                  <Plus className="size-3.5" aria-hidden="true" />
                  New category
                </AdminButton>
              )
            }
          />
        }
        rowActions={(item) => (
          <Dropdown
            align="right"
            label={`Actions for ${item.name}`}
            trigger={
              <span className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink">
                <MoreVertical className="size-4" aria-hidden="true" />
              </span>
            }
            items={[
              { label: "Edit", icon: Pencil, onSelect: () => openEdit(item) },
              { divider: true },
              { label: "Delete", icon: Trash2, danger: true, onSelect: () => setPendingDelete(item) },
            ]}
          />
        )}
      />

      {/* Create / edit modal */}
      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? `Edit ${editing.name}` : "New category"}
        description="Category names also label blogs, gallery images and downloads."
        size="sm"
      >
        <form onSubmit={save} noValidate className="space-y-4">
          <Field label="Name" required error={formErrors.name} htmlFor="category-name">
            <TextInput
              id="category-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="e.g. Strategy"
              hasError={Boolean(formErrors.name)}
            />
          </Field>
          <Field
            label="Description"
            hint="optional"
            error={formErrors.description}
            htmlFor="category-description"
          >
            <TextArea
              id="category-description"
              rows={2}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="What belongs in this category?"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <AdminButton variant="secondary" size="sm" onClick={() => setEditorOpen(false)} type="button">
              Cancel
            </AdminButton>
            <AdminButton type="submit" size="sm" loading={saving}>
              {editing ? "Save changes" : "Create category"}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this category?"
        message={`"${pendingDelete?.name}" will be removed. Categories still referenced by blogs, images or resources are protected and cannot be deleted.`}
      />
    </div>
  );
}
