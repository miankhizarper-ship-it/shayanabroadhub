import { Page } from "../models/Page.js";
import { connectDB } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendValidationError, sendError } from "../utils/apiResponse.js";
import { validatePageUpdate, isEditablePageSlug } from "../validators/index.js";

/**
 * Page management — /api/admin/pages.
 * Structured editing for the three canonical pages (home, about,
 * contact): whitelisted slugs, whitelisted section keys, capped
 * string values. No generic page builder, no arbitrary storage.
 */

const PAGE_TITLES = {
  home: "Home",
  about: "About",
  contact: "Contact",
};

/** GET /api/admin/pages — all three canonical documents. */
export const listPages = asyncHandler(async (_req, res) => {
  await connectDB();

  const docs = await Page.find({ slug: { $in: Object.keys(PAGE_TITLES) } })
    .sort({ slug: 1 })
    .lean();
  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));

  /* Missing pages appear as editable placeholders with empty sections
     (no eager writes — the DB only stores what admins actually save). */
  const items = Object.entries(PAGE_TITLES).map(([slug, title]) => {
    const doc = bySlug.get(slug);
    return doc
      ? {
          slug: doc.slug,
          title: doc.title,
          sections: doc.sections ?? {},
          seo: doc.seo ?? {},
          updatedAt: doc.updatedAt,
        }
      : { slug, title, sections: {}, seo: {}, updatedAt: null };
  });

  return sendSuccess(res, { items, total: items.length });
});

/** GET /api/admin/pages/:slug */
export const getPage = asyncHandler(async (req, res) => {
  if (!isEditablePageSlug(req.params.slug)) {
    return sendError(res, 404, "not_found", "That page is not editable.");
  }
  await connectDB();

  const doc = await Page.findOne({ slug: req.params.slug }).lean();
  if (!doc) {
    return sendSuccess(res, {
      slug: req.params.slug,
      title: PAGE_TITLES[req.params.slug],
      sections: {},
      seo: {},
      updatedAt: null,
    });
  }

  return sendSuccess(res, {
    slug: doc.slug,
    title: doc.title,
    sections: doc.sections ?? {},
    seo: doc.seo ?? {},
    updatedAt: doc.updatedAt,
  });
});

/** PUT /api/admin/pages/:slug — upserts the structured sections. */
export const updatePage = asyncHandler(async (req, res) => {
  const { details, value, slug } = validatePageUpdate(req.params.slug, req.body);
  if (Object.keys(details).length > 0) return sendValidationError(res, details);

  await connectDB();

  const page = await Page.findOneAndUpdate(
    { slug },
    {
      $set: {
        title: value.title ?? PAGE_TITLES[slug],
        sections: value.sections,
        ...(value.seo ? { seo: value.seo } : {}),
      },
    },
    { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();

  return sendSuccess(res, {
    slug: page.slug,
    title: page.title,
    sections: page.sections ?? {},
    seo: page.seo ?? {},
    updatedAt: page.updatedAt,
  });
});
