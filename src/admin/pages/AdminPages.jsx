import { useEffect, useState } from "react";
import { FileStack, Save } from "lucide-react";
import { pagesApi } from "../../lib/api";
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
import { ImageUploader } from "../components/MediaUploader";
import { cn } from "../../utils/cn";

/**
 * AdminPages — structured content editing for the three canonical
 * pages (home / about / contact). No page builder: every section is
 * a fixed, labelled form backed by the Page model's whitelisted
 * `sections` object.
 */

const PAGE_TABS = [
  { slug: "home", label: "Home", hint: "Hero, about teaser, journey and contact CTA copy." },
  { slug: "about", label: "About", hint: "Intro, mission and vision statements." },
  { slug: "contact", label: "Contact", hint: "Intro heading and description." },
];

const SECTION_LABELS = {
  hero: "Hero",
  about: "About teaser",
  journey: "Journey",
  contactCta: "Contact CTA",
  intro: "Intro",
  mission: "Mission",
  vision: "Vision",
};

export default function AdminPages() {
  const toast = useToast();
  const [tab, setTab] = useState("home");

  const { data, loading, error, retry } = useResource(
    (signal) => pagesApi.list(signal),
    [],
  );

  const [sections, setSections] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const page = data?.items?.find((item) => item.slug === tab);

  /* Load sections whenever the page (or data) changes. */
  useEffect(() => {
    setSections(page?.sections ? structuredClone(page.sections) : {});
    setDirty(false);
  }, [page]);

  const updateField = (sectionKey, field) => (event) => {
    const value = event.target.value;
    setSections((current) => ({
      ...current,
      [sectionKey]: { ...current[sectionKey], [field]: value },
    }));
    setDirty(true);
  };

  const updateImage = (sectionKey, image) => {
    setSections((current) => ({
      ...current,
      [sectionKey]: { ...current[sectionKey], image },
    }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await pagesApi.update(tab, { sections });
      toast.success("Page content saved — the public site reflects it immediately.");
      setDirty(false);
      retry();
    } catch (cause) {
      toast.error(cause.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="Pages" description="Structured content for the public pages." />
        <AdminLoading label="Loading pages" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AdminPageHeader title="Pages" description="Structured content for the public pages." />
        <Panel>
          <AdminButton className="m-5" variant="secondary" size="sm" onClick={retry}>
            Retry
          </AdminButton>
        </Panel>
      </div>
    );
  }

  const sectionKeys = Object.keys(
    sections && Object.keys(sections).length > 0
      ? sections
      : defaultSectionsFor(tab),
  );

  return (
    <div>
      <AdminPageHeader
        title="Pages"
        description="Structured copy for the public pages — no layout changes, just words and imagery."
        actions={
          <AdminButton onClick={save} loading={saving} disabled={!dirty}>
            <Save className="size-4" aria-hidden="true" />
            Save changes
          </AdminButton>
        }
      />

      {/* Page tabs */}
      <div
        role="tablist"
        aria-label="Choose page"
        className="mb-5 inline-flex rounded-lg border border-line bg-white p-0.5"
      >
        {PAGE_TABS.map((item) => (
          <button
            key={item.slug}
            type="button"
            role="tab"
            aria-selected={tab === item.slug}
            onClick={() => setTab(item.slug)}
            className={cn(
              "rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors",
              tab === item.slug ? "bg-ink text-cream" : "text-ink-soft hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="mb-4 text-xs text-ink-muted">
        {PAGE_TABS.find((item) => item.slug === tab)?.hint}
      </p>

      <div className="space-y-5">
        {sectionKeys.map((sectionKey) => {
          const section = sections[sectionKey] ?? {};
          return (
            <Panel key={sectionKey}>
              <PanelHeader
                title={SECTION_LABELS[sectionKey] ?? sectionKey}
                description={
                  sections[sectionKey] === undefined
                    ? "Not customised yet — saved values override the built-in copy."
                    : undefined
                }
              />
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <Field
                  label="Title"
                  htmlFor={`page-${sectionKey}-title`}
                >
                  <TextInput
                    id={`page-${sectionKey}-title`}
                    value={section.title ?? ""}
                    onChange={updateField(sectionKey, "title")}
                  />
                </Field>
                <Field
                  label="Description"
                  htmlFor={`page-${sectionKey}-description`}
                  className="sm:col-span-2"
                >
                  <TextArea
                    id={`page-${sectionKey}-description`}
                    rows={2}
                    value={section.description ?? ""}
                    onChange={updateField(sectionKey, "description")}
                  />
                </Field>
                {sectionKey === "hero" ? (
                  <div className="sm:col-span-2">
                    <p className="text-[13px] font-medium text-ink">Hero image</p>
                    <div className="mt-1.5">
                      <ImageUploader
                        id={`page-${sectionKey}-image`}
                        value={section.image ?? null}
                        onChange={(image) => updateImage(sectionKey, image)}
                        folder="profile"
                        label="Hero image"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </Panel>
          );
        })}

        {sectionKeys.length === 0 ? (
          <Panel>
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <FileStack className="size-6 text-ink-muted" aria-hidden="true" />
              <p className="text-sm text-ink-soft">This page has no custom sections yet.</p>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

/** Fallback section skeletons so empty pages render editable forms. */
function defaultSectionsFor(slug) {
  switch (slug) {
    case "home":
      return { hero: {}, about: {}, journey: {}, contactCta: {} };
    case "about":
      return { intro: {}, mission: {}, vision: {} };
    case "contact":
      return { intro: {} };
    default:
      return {};
  }
}
