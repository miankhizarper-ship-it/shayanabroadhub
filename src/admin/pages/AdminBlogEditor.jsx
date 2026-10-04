import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bold,
  Code,
  Eye,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Save,
  Send,
} from "lucide-react";
import { blogsApi, categoriesApi } from "../../lib/api";
import { uploadsApi } from "../../lib/api/uploads";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useToast } from "../context/ToastContext";
import { useResource } from "../../hooks/useResource";
import {
  AdminButton,
  AdminPageHeader,
  Field,
  Panel,
  PanelHeader,
  Select,
  StatusBadge,
  TextArea,
  TextInput,
  Toggle,
} from "../components/ui";
import { ImageUploader } from "../components/MediaUploader";
import Modal from "../components/Modal";
import { markdownToBlocks, estimateReadingTime } from "../../utils/markdown";
import { cn } from "../../utils/cn";
import BlogContent from "../../components/sections/blogs/BlogContent";

/**
 * AdminBlogEditor — create/edit screen for journal essays.
 *
 * Content is authored as markdown (matching the backend Blog model)
 * through a structured toolbar + live preview that renders the exact
 * blocks the public site will show. Draft save keeps the essay out
 * of the public journal; Publish flips status and stamps
 * publishedAt server-side.
 */

const BLANK = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  author: "Shayan",
  status: "draft",
  featured: false,
  readingTime: 5,
  coverImage: null,
  seoTitle: "",
  seoDescription: "",
};

export default function AdminBlogEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { admin } = useAdminAuth();

  const [values, setValues] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEdit);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: categoriesData } = useResource(
    (signal) => categoriesApi.list(signal),
    [],
  );

  /* Load the post in edit mode. */
  useEffect(() => {
    if (!isEdit) return undefined;
    let active = true;
    blogsApi
      .get(id)
      .then((post) => {
        if (!active || !post) return;
        setValues({
          title: post.title ?? "",
          slug: post.slug ?? "",
          excerpt: post.excerpt ?? "",
          content: post.content ?? "",
          category: post.category ?? "",
          author: post.author ?? "Shayan",
          status: post.status ?? "draft",
          featured: Boolean(post.featured),
          readingTime: post.readingTime ?? 5,
          coverImage: post.coverImage?.url ? post.coverImage : null,
          seoTitle: post.seo?.title ?? "",
          seoDescription: post.seo?.description ?? "",
        });
      })
      .catch((cause) => {
        if (active) toast.error(cause.message ?? "This essay could not be loaded.");
      })
      .finally(() => {
        if (active) setLoadingPost(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const setValue = (key) => (eventOrValue) => {
    const value =
      typeof eventOrValue === "object" && eventOrValue !== null && "target" in eventOrValue
        ? eventOrValue.target.value
        : eventOrValue;
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const slugPreview = useMemo(() => {
    const source = values.slug || values.title;
    return source
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, [values.slug, values.title]);

  /* ── validation ─────────────────────────────────────────── */

  const validate = () => {
    const next = {};
    if (values.title.trim().length < 3) next.title = "Title must be at least 3 characters.";
    if (values.excerpt.trim().length < 10) next.excerpt = "Excerpt must be at least 10 characters.";
    if (!values.content.trim()) next.content = "Content cannot be empty.";
    if (!values.category) next.category = "Choose a category.";
    if (values.readingTime < 1 || values.readingTime > 120) {
      next.readingTime = "Reading time must be 1–120 minutes.";
    }
    return next;
  };

  const buildPayload = () => ({
    title: values.title.trim(),
    slug: values.slug.trim() || undefined,
    excerpt: values.excerpt.trim(),
    content: values.content,
    category: values.category,
    author: values.author.trim() || "Shayan",
    featured: values.featured,
    readingTime: Number(values.readingTime) || estimateReadingTime(values.content),
    coverImage: values.coverImage,
    seo: {
      title: values.seoTitle.trim(),
      description: values.seoDescription.trim(),
    },
  });

  const save = async ({ publish = false }) => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.warning("Some fields need attention before saving.");
      return;
    }

    publish ? setPublishing(true) : setSaving(true);
    try {
      const payload = {
        ...buildPayload(),
        status: publish ? "published" : values.status,
      };
      const saved = isEdit
        ? await blogsApi.update(id, payload)
        : await blogsApi.create(payload);

      if (publish) {
        toast.success(isEdit ? "Essay published." : "Essay created and published.");
      } else {
        toast.success(isEdit ? "Draft saved." : "Draft created.");
      }

      if (!isEdit && saved?._id) {
        navigate(`/admin/blogs/${saved._id}/edit`, { replace: true });
      } else if (publish) {
        setValues((current) => ({ ...current, status: "published" }));
      }
    } catch (cause) {
      if (cause.isValidationError) {
        setErrors(cause.details);
        toast.warning("The server flagged some fields — check the form.");
      } else {
        toast.error(cause.message);
      }
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  /* ── markdown toolbar ───────────────────────────────────── */

  const contentRef = useRef(null);

  const insertAroundSelection = useCallback((before, after = "", placeholder = "") => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || placeholder;
    const next =
      value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
    setValues((current) => ({ ...current, content: next }));

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = selectionStart + before.length + selected.length + after.length;
      textarea.setSelectionRange(selectionStart + before.length, cursor - after.length);
    });
  }, []);

  const insertPrefixLines = useCallback((prefix) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const selected = value.slice(lineStart, selectionEnd) || "Section heading";
    const prefixed = selected
      .split("\n")
      .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
      .join("\n");
    const next = value.slice(0, lineStart) + prefixed + value.slice(selectionEnd);
    setValues((current) => ({ ...current, content: next }));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + prefix.length, lineStart + prefixed.length);
    });
  }, []);

  const insertImage = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const loadingToast = toast.info("Uploading image…");
      try {
        const asset = await uploadsApi.upload(file, { folder: "blogs", resourceType: "image" });
        insertAroundSelection(`![${file.name.replace(/\.[^.]+$/, "")}]`, `(${asset.url})`, asset.url);
        toast.success("Image inserted into the essay.");
      } catch (cause) {
        toast.error(cause?.message ?? "Upload failed — paste the image markdown manually.");
      } finally {
        loadingToast && toast.dismiss(loadingToast);
      }
    };
    input.click();
  }, [insertAroundSelection, toast]);

  const toolbar = [
    { icon: Heading2, label: "Heading", onClick: () => insertPrefixLines("## ") },
    { icon: Bold, label: "Bold", onClick: () => insertAroundSelection("**", "**", "bold text") },
    { icon: Italic, label: "Italic", onClick: () => insertAroundSelection("*", "*", "italic text") },
    {
      icon: Link2,
      label: "Link",
      onClick: () => insertAroundSelection("[", "](https://)", "link text"),
    },
    { icon: List, label: "Bulleted list", onClick: () => insertPrefixLines("- ") },
    { icon: ListOrdered, label: "Numbered list", onClick: () => insertPrefixLines("1. ") },
    { icon: Quote, label: "Quote", onClick: () => insertPrefixLines("> ") },
    { icon: Code, label: "Code block", onClick: () => insertAroundSelection("\n```\n", "\n```\n", "code") },
    { icon: ImagePlus, label: "Insert image", onClick: insertImage },
  ];

  const previewBlocks = useMemo(() => markdownToBlocks(values.content), [values.content]);

  if (loadingPost) {
    return (
      <div className="py-20 text-center text-sm text-ink-muted">Loading essay…</div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title={isEdit ? "Edit essay" : "New essay"}
        description={
          isEdit ? (
            <span className="inline-flex items-center gap-2">
              <StatusBadge tone={values.status}>
                {values.status === "published" ? "Published" : "Draft"}
              </StatusBadge>
              <span className="text-xs text-ink-muted">/{slugPreview}</span>
            </span>
          ) : (
            "Write in markdown — the public journal renders it beautifully."
          )
        }
        actions={
          <>
            <AdminButton variant="secondary" onClick={() => navigate("/admin/blogs")}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => setPreviewOpen(true)}>
              <Eye className="size-4" aria-hidden="true" />
              Preview
            </AdminButton>
            <AdminButton onClick={() => save({ publish: false })} loading={saving} disabled={publishing}>
              <Save className="size-4" aria-hidden="true" />
              {isEdit ? "Save draft" : "Create draft"}
            </AdminButton>
            <AdminButton onClick={() => save({ publish: true })} loading={publishing} disabled={saving}>
              <Send className="size-4" aria-hidden="true" />
              Publish
            </AdminButton>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="space-y-5">
          <Panel className="p-5">
            <div className="space-y-4">
              <Field label="Title" required error={errors.title} htmlFor="blog-title">
                <TextInput
                  id="blog-title"
                  value={values.title}
                  onChange={setValue("title")}
                  placeholder="An essay title worth keeping"
                  hasError={Boolean(errors.title)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Slug"
                  hint={slugPreview ? `/${slugPreview}` : undefined}
                  error={errors.slug}
                  htmlFor="blog-slug"
                >
                  <TextInput
                    id="blog-slug"
                    value={values.slug}
                    onChange={setValue("slug")}
                    placeholder="auto-generated from the title"
                  />
                </Field>
                <Field label="Category" required error={errors.category} htmlFor="blog-category">
                  <Select
                    id="blog-category"
                    value={values.category}
                    onChange={setValue("category")}
                    hasError={Boolean(errors.category)}
                  >
                    <option value="">Choose a category…</option>
                    {(categoriesData?.items ?? []).map((item) => (
                      <option key={item._id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field
                label="Excerpt"
                required
                hint={`${values.excerpt.length}/400`}
                error={errors.excerpt}
                htmlFor="blog-excerpt"
              >
                <TextArea
                  id="blog-excerpt"
                  rows={2}
                  value={values.excerpt}
                  onChange={setValue("excerpt")}
                  placeholder="One or two sentences that make the essay irresistible in a listing."
                  hasError={Boolean(errors.excerpt)}
                />
              </Field>
            </div>
          </Panel>

          {/* Markdown editor */}
          <Panel>
            <PanelHeader
              title="Content"
              description="Markdown — headings, lists, quotes, links, images and code are supported."
              actions={
                <div className="flex items-center gap-0.5 rounded-lg border border-line bg-cream-deep/50 p-0.5">
                  {toolbar.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      aria-label={item.label}
                      title={item.label}
                      className="inline-flex size-8 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-white hover:text-ink"
                    >
                      <item.icon className="size-4" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              }
            />
            <div className="p-2">
              <textarea
                ref={contentRef}
                value={values.content}
                onChange={setValue("content")}
                rows={18}
                aria-label="Essay content (markdown)"
                aria-invalid={Boolean(errors.content)}
                placeholder={"## Start with a heading\n\nWrite the essay here…"}
                className={cn(
                  "w-full resize-y rounded-lg border bg-white px-4 py-3 font-mono text-[13px] leading-relaxed text-ink placeholder:text-ink-muted/60",
                  "transition-colors focus:outline-none",
                  errors.content
                    ? "border-red-300 focus:border-red-400"
                    : "border-line focus:border-bronze-400",
                )}
                spellCheck
              />
              {errors.content ? (
                <p role="alert" className="px-2 pb-1 pt-1 text-xs text-red-600">
                  {errors.content}
                </p>
              ) : null}
            </div>
          </Panel>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <Panel className="p-5">
            <h2 className="text-sm font-semibold text-ink">Publication</h2>
            <div className="mt-4 space-y-4">
              <Toggle
                id="blog-featured"
                checked={values.featured}
                onChange={(checked) => setValue("featured")(checked)}
                label="Featured essay"
                description="Featured essays lead the public journal."
              />
              <Field
                label="Reading time"
                hint={`auto: ${estimateReadingTime(values.content)} min`}
                error={errors.readingTime}
                htmlFor="blog-reading-time"
              >
                <TextInput
                  id="blog-reading-time"
                  type="number"
                  min={1}
                  max={120}
                  value={values.readingTime}
                  onChange={setValue("readingTime")}
                />
              </Field>
              <Field label="Author" htmlFor="blog-author">
                <TextInput
                  id="blog-author"
                  value={values.author}
                  onChange={setValue("author")}
                  placeholder={admin?.name ?? "Shayan"}
                />
              </Field>
            </div>
          </Panel>

          <Panel className="p-5">
            <h2 className="text-sm font-semibold text-ink">Cover image</h2>
            <p className="mb-3 mt-1 text-xs text-ink-muted">
              Uploads go straight to Cloudinary with a signed request.
            </p>
            <ImageUploader
              id="blog-cover"
              value={values.coverImage}
              onChange={setValue("coverImage")}
              folder="blogs"
              label="Cover image"
            />
          </Panel>

          <Panel className="p-5">
            <h2 className="text-sm font-semibold text-ink">SEO</h2>
            <div className="mt-4 space-y-4">
              <Field
                label="SEO title"
                hint={`${values.seoTitle.length}/70`}
                htmlFor="blog-seo-title"
              >
                <TextInput
                  id="blog-seo-title"
                  value={values.seoTitle}
                  onChange={setValue("seoTitle")}
                  placeholder="Defaults to the essay title"
                />
              </Field>
              <Field
                label="SEO description"
                hint={`${values.seoDescription.length}/200`}
                htmlFor="blog-seo-description"
              >
                <TextArea
                  id="blog-seo-description"
                  rows={3}
                  value={values.seoDescription}
                  onChange={setValue("seoDescription")}
                  placeholder="Defaults to the excerpt"
                />
              </Field>
            </div>
          </Panel>
        </div>
      </div>

      {/* Preview modal — renders exactly like the public article */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Public preview"
        description="This is how the essay renders on the site."
        size="lg"
      >
        <article>
          <h1 className="font-display text-3xl font-medium leading-tight text-ink">
            {values.title || "Untitled essay"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{values.excerpt}</p>
          {values.coverImage?.url ? (
            <img
              src={values.coverImage.url}
              alt=""
              className="mt-6 aspect-[2/1] w-full rounded-xl object-cover"
            />
          ) : null}
          <div className="mt-8">
            <BlogContent blocks={previewBlocks} />
          </div>
        </article>
      </Modal>
    </div>
  );
}
