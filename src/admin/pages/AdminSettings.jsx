import { useEffect, useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { settingsApi } from "../../lib/api";
import { useToast } from "../context/ToastContext";
import { useResource } from "../../hooks/useResource";
import {
  AdminButton,
  AdminLoading,
  AdminPageHeader,
  Field,
  Panel,
  PanelHeader,
  TextArea,
  TextInput,
} from "../components/ui";

/**
 * AdminSettings — site-wide configuration (site name, contact
 * details, social links, default SEO). Only admins reach this
 * screen; every change is validated server-side too.
 */

const BLANK = {
  siteName: "",
  siteDescription: "",
  email: "",
  phone: "",
  whatsapp: "",
  location: "",
  socials: [],
  seo: { title: "", description: "", ogImage: "" },
};

export default function AdminSettings() {
  const toast = useToast();
  const { data, loading, error, retry } = useResource(
    (signal) => settingsApi.get(signal),
    [],
  );

  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      siteName: data.siteName ?? "",
      siteDescription: data.siteDescription ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      whatsapp: data.whatsapp ?? "",
      location: data.location ?? "",
      socials: Array.isArray(data.socials) ? data.socials.map((s) => ({ ...s })) : [],
      seo: {
        title: data.seo?.title ?? "",
        description: data.seo?.description ?? "",
        ogImage: data.seo?.ogImage ?? "",
      },
    });
  }, [data]);

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const setSeo = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, seo: { ...current.seo, [key]: value } }));
  };

  const updateSocial = (index, field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      socials: current.socials.map((social, i) =>
        i === index ? { ...social, [field]: value } : social,
      ),
    }));
  };

  const validate = () => {
    const next = {};
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      next.email = "Enter a valid email address.";
    }
    return next;
  };

  const save = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await settingsApi.update(form);
      toast.success("Settings saved.");
      retry();
    } catch (cause) {
      if (cause.isValidationError) setErrors(cause.details);
      else toast.error(cause.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="Settings" description="Site-wide configuration." />
        <AdminLoading label="Loading settings" />
      </div>
    );
  }

  return (
    <form onSubmit={save} noValidate>
      <AdminPageHeader
        title="Settings"
        description="Site-wide configuration — applied across the public site."
        actions={
          <AdminButton type="submit" loading={saving}>
            <Save className="size-4" aria-hidden="true" />
            Save settings
          </AdminButton>
        }
      />

      {error ? (
        <Panel className="mb-5 p-5 text-sm text-red-600">
          {error.message} —{" "}
          <button type="button" className="underline" onClick={retry}>
            retry
          </button>
        </Panel>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Identity */}
        <Panel>
          <PanelHeader title="Site identity" description="Name and default description." />
          <div className="space-y-4 p-5">
            <Field label="Site name" htmlFor="settings-name">
              <TextInput id="settings-name" value={form.siteName} onChange={set("siteName")} />
            </Field>
            <Field label="Site description" htmlFor="settings-description">
              <TextArea
                id="settings-description"
                rows={3}
                value={form.siteDescription}
                onChange={set("siteDescription")}
              />
            </Field>
          </div>
        </Panel>

        {/* Contact */}
        <Panel>
          <PanelHeader title="Contact details" description="Shown on the contact page and footer." />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Email" error={errors.email} htmlFor="settings-email">
              <TextInput
                id="settings-email"
                type="email"
                value={form.email}
                onChange={set("email")}
                hasError={Boolean(errors.email)}
              />
            </Field>
            <Field label="Phone" hint="optional" htmlFor="settings-phone">
              <TextInput id="settings-phone" value={form.phone} onChange={set("phone")} />
            </Field>
            <Field
              label="WhatsApp number"
              hint="international format"
              htmlFor="settings-whatsapp"
            >
              <TextInput
                id="settings-whatsapp"
                value={form.whatsapp}
                onChange={set("whatsapp")}
                placeholder="e.g. 15550100"
              />
            </Field>
            <Field label="Location" htmlFor="settings-location">
              <TextInput id="settings-location" value={form.location} onChange={set("location")} />
            </Field>
          </div>
        </Panel>

        {/* Socials */}
        <Panel>
          <PanelHeader
            title="Social links"
            description="Up to six profiles."
            actions={
              <AdminButton
                variant="secondary"
                size="xs"
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    socials: [...current.socials, { label: "", href: "https://" }],
                  }))
                }
                disabled={form.socials.length >= 6}
              >
                <Plus className="size-3" aria-hidden="true" />
                Add link
              </AdminButton>
            }
          />
          <div className="space-y-3 p-5">
            {form.socials.length === 0 ? (
              <p className="py-2 text-sm text-ink-muted">No social links configured.</p>
            ) : (
              form.socials.map((social, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* Fixed-width wrapper (input base is w-full; a bare
                      w-28 on the input would lose the cascade). */}
                  <div className="w-28 shrink-0 sm:w-32">
                    <TextInput
                      value={social.label ?? ""}
                      onChange={updateSocial(index, "label")}
                      placeholder="Label"
                      aria-label={`Social ${index + 1} label`}
                    />
                  </div>
                  <TextInput
                    value={social.href ?? ""}
                    onChange={updateSocial(index, "href")}
                    placeholder="https://…"
                    aria-label={`Social ${index + 1} URL`}
                    className="min-w-0 flex-1"
                  />
                  <button
                    type="button"
                    aria-label={`Remove social ${index + 1}`}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        socials: current.socials.filter((_, i) => i !== index),
                      }))
                    }
                    className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Panel>

        {/* SEO */}
        <Panel>
          <PanelHeader title="Default SEO" description="Fallbacks for pages without their own." />
          <div className="space-y-4 p-5">
            <Field label="Default SEO title" hint={`${form.seo.title.length}/70`} htmlFor="settings-seo-title">
              <TextInput id="settings-seo-title" value={form.seo.title} onChange={setSeo("title")} />
            </Field>
            <Field
              label="Default SEO description"
              hint={`${form.seo.description.length}/200`}
              htmlFor="settings-seo-description"
            >
              <TextArea
                id="settings-seo-description"
                rows={3}
                value={form.seo.description}
                onChange={setSeo("description")}
              />
            </Field>
            <Field label="Default OG image URL" hint="optional" htmlFor="settings-seo-og">
              <TextInput
                id="settings-seo-og"
                value={form.seo.ogImage}
                onChange={setSeo("ogImage")}
                placeholder="https://…"
              />
            </Field>
          </div>
        </Panel>
      </div>
    </form>
  );
}
