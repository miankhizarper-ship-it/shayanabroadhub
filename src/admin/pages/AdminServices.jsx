import { useMemo, useState } from "react";
import { MoreVertical, Pencil, Plus, SearchX, Star, Trash2, Wrench } from "lucide-react";
import { servicesApi } from "../../lib/api";
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
import { ImageUploader } from "../components/MediaUploader";
import { iconMap } from "../../utils/iconMap";

/**
 * AdminServices — CRUD for the consulting catalogue with featured/
 * status toggles and display ordering (order ascending).
 */

const BLANK = {
  title: "",
  tagline: "",
  description: "",
  benefits: "",
  format: "",
  commitment: "",
  icon: "Compass",
  order: 0,
  featured: false,
  status: "draft",
  image: null,
};

export default function AdminServices() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [status, setStatus] = useState("");

  const { data, loading, error, retry } = useResource(
    (signal) => servicesApi.list({ q: debouncedSearch, status }, signal),
    [debouncedSearch, status],
  );

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [rowBusy, setRowBusy] = useState(null);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const items = data?.items ?? [];
  const iconNames = Object.keys(iconMap);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...BLANK, order: items.length + 1 });
    setFormErrors({});
    setEditorOpen(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    setForm({
      title: service.title ?? "",
      tagline: service.tagline ?? "",
      description: service.description ?? "",
      benefits: (service.benefits ?? []).join("\n"),
      format: service.format ?? "",
      commitment: service.commitment ?? "",
      icon: service.icon || "Compass",
      order: service.order ?? 0,
      featured: Boolean(service.featured),
      status: service.status ?? "draft",
      image: service.image?.url ? service.image : null,
    });
    setFormErrors({});
    setEditorOpen(true);
  };

  const validate = () => {
    const next = {};
    if (form.title.trim().length < 3) next.title = "Title must be at least 3 characters.";
    if (form.description.trim().length < 10) next.description = "Description must be at least 10 characters.";
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
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        benefits: form.benefits
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        format: form.format.trim(),
        commitment: form.commitment.trim(),
        icon: form.icon,
        order: Number(form.order) || 0,
        featured: form.featured,
        status: form.status,
        image: form.image,
      };
      if (editing) {
        await servicesApi.update(editing._id, payload);
        toast.success("Service updated.");
      } else {
        await servicesApi.create(payload);
        toast.success("Service created.");
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

  const toggleField = async (service, patch, message) => {
    setRowBusy(service._id);
    try {
      await servicesApi.update(service._id, patch);
      toast.success(message);
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
      await servicesApi.remove(pendingDelete._id);
      toast.success("Service deleted.");
      setPendingDelete(null);
      retry();
    } catch (cause) {
      toast.error(cause.message);
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(search || status);

  const parsedBenefits = useMemo(
    () =>
      form.benefits
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 12),
    [form.benefits],
  );

  return (
    <div>
      <AdminPageHeader
        title="Services"
        description="The consulting catalogue shown on the public site."
        actions={
          <AdminButton onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            New service
          </AdminButton>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <AdminSearchInput
          id="admin-service-search"
          value={search}
          onChange={setSearch}
          placeholder="Search services…"
          className="sm:max-w-xs"
        />
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="sm:w-36"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      </div>

      <DataTable
        columns={[
          {
            key: "title",
            header: "Service",
            render: (item) => (
              <div>
                <p className="flex items-center gap-1.5 font-medium text-ink">
                  {item.title}
                  {item.featured ? (
                    <Star className="size-3.5 fill-bronze-500 text-bronze-500" aria-hidden="true" />
                  ) : null}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{item.tagline}</p>
              </div>
            ),
          },
          {
            key: "order",
            header: "Order",
            render: (item) => (
              <span className="tabular-nums text-ink-soft">{item.order}</span>
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
        error={error}
        onRetry={retry}
        rowKey={(item) => item._id}
        emptyState={
          hasFilters ? (
            <AdminEmptyState
              icon={SearchX}
              title="No services match those filters"
              description="Adjust the search or status filter."
              action={
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatus("");
                  }}
                >
                  Clear filters
                </AdminButton>
              }
            />
          ) : (
            <AdminEmptyState
              icon={Wrench}
              title="No services yet"
              description="Add the first engagement to the catalogue."
              action={
                <AdminButton size="sm" onClick={openCreate}>
                  <Plus className="size-3.5" aria-hidden="true" />
                  New service
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
                label: item.featured ? "Remove featured" : "Mark featured",
                icon: Star,
                onSelect: () =>
                  toggleField(
                    item,
                    { featured: !item.featured },
                    item.featured ? "Removed from featured." : "Marked as featured.",
                  ),
              },
              {
                label: item.status === "published" ? "Unpublish" : "Publish",
                icon: Wrench,
                onSelect: () =>
                  toggleField(
                    item,
                    { status: item.status === "published" ? "draft" : "published" },
                    item.status === "published" ? "Service unpublished." : "Service published.",
                  ),
              },
              { divider: true },
              { label: "Delete", icon: Trash2, danger: true, onSelect: () => setPendingDelete(item) },
            ]}
          />
        )}
      />

      {/* Editor modal */}
      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? `Edit ${editing.title}` : "New service"}
        description="Published services appear on the public Services page, ordered below."
      >
        <form onSubmit={save} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" required error={formErrors.title} htmlFor="service-title">
              <TextInput
                id="service-title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                hasError={Boolean(formErrors.title)}
              />
            </Field>
            <Field label="Tagline" hint="optional" htmlFor="service-tagline">
              <TextInput
                id="service-tagline"
                value={form.tagline}
                onChange={(event) => setForm({ ...form, tagline: event.target.value })}
                placeholder="One memorable line"
              />
            </Field>
          </div>

          <Field label="Description" required error={formErrors.description} htmlFor="service-description">
            <TextArea
              id="service-description"
              rows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              hasError={Boolean(formErrors.description)}
            />
          </Field>

          <Field
            label="Benefits"
            hint="one per line"
            htmlFor="service-benefits"
          >
            <TextArea
              id="service-benefits"
              rows={4}
              value={form.benefits}
              onChange={(event) => setForm({ ...form, benefits: event.target.value })}
              placeholder={"A precise problem statement\nOptions mapped with trade-offs"}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Format" htmlFor="service-format">
              <TextInput
                id="service-format"
                value={form.format}
                onChange={(event) => setForm({ ...form, format: event.target.value })}
                placeholder="90-minute sessions, remote"
              />
            </Field>
            <Field label="Commitment" htmlFor="service-commitment">
              <TextInput
                id="service-commitment"
                value={form.commitment}
                onChange={(event) => setForm({ ...form, commitment: event.target.value })}
                placeholder="Single session or series"
              />
            </Field>
            <Field label="Icon" htmlFor="service-icon">
              <Select
                id="service-icon"
                value={form.icon}
                onChange={(event) => setForm({ ...form, icon: event.target.value })}
              >
                {iconNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Display order" hint="ascending" htmlFor="service-order">
              <TextInput
                id="service-order"
                type="number"
                min={0}
                value={form.order}
                onChange={(event) => setForm({ ...form, order: event.target.value })}
              />
            </Field>
          </div>

          <div>
            <p className="text-[13px] font-medium text-ink">Service image</p>
            <div className="mt-1.5">
              <ImageUploader
                id="service-image"
                value={form.image}
                onChange={(image) => setForm({ ...form, image })}
                folder="services"
                label="Service image"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-line bg-cream-deep/40 p-4">
            <Toggle
              id="service-featured"
              checked={form.featured}
              onChange={(checked) => setForm({ ...form, featured: checked })}
              label="Featured service"
              description="Featured services appear first on the homepage."
            />
            <Toggle
              id="service-status"
              checked={form.status === "published"}
              onChange={(checked) => setForm({ ...form, status: checked ? "published" : "draft" })}
              label="Published"
              description="Visible on the public site."
            />
          </div>

          {parsedBenefits.length > 0 ? (
            <p className="text-xs text-ink-muted">
              {parsedBenefits.length} benefit{parsedBenefits.length === 1 ? "" : "s"} will be listed.
            </p>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <AdminButton variant="secondary" type="button" onClick={() => setEditorOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" loading={saving}>
              {editing ? "Save changes" : "Create service"}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this service?"
        message={`"${pendingDelete?.title}" will be permanently removed from the catalogue.`}
      />
    </div>
  );
}
