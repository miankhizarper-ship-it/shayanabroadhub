import { useEffect, useMemo, useState } from "react";
import { Clock, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeading from "../components/common/PageHeading";
import Container from "../components/common/Container";
import Reveal from "../components/common/Reveal";
import CategoryFilter from "../components/common/CategoryFilter";
import SearchInput from "../components/common/SearchInput";
import Pagination from "../components/common/Pagination";
import EmptyState from "../components/common/EmptyState";
import LoadingState from "../components/common/LoadingState";
import BlogCard from "../components/sections/blogs/BlogCard";
import ImageWithFallback from "../components/common/ImageWithFallback";
import { publicApi } from "../lib/api";
import { useResource } from "../hooks/useResource";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { adaptBlogPost } from "../data/adapters";
import { formatDate } from "../utils/format";
import { useSeo } from "../utils/seo";

const PAGE_SIZE = 6;

/**
 * Blogs — the Journal index, powered by the public API.
 * Featured essay on the default view; server-side search, category
 * filter and pagination on the grid. Graceful empty/error states
 * keep the page working when the collection is empty or the API is
 * unreachable.
 */
export default function Blogs() {
  useSeo({
    title: "The Journal",
    description:
      "Essays on strategy, editorial craft and the quieter sides of building things well — new writing most fortnights.",
    path: "/blogs",
  });

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 350);
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  const isFiltering = debouncedQuery.trim() !== "" || category !== "All";

  /* Featured essay — only on the default view. */
  const featuredState = useResource(
    (signal) =>
      isFiltering
        ? Promise.resolve(null)
        : publicApi.blogs({ featured: true, limit: 1 }, signal),
    [isFiltering],
  );

  const gridParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      q: debouncedQuery.trim() || undefined,
      category: category !== "All" ? category : undefined,
      excludeFeatured: isFiltering ? undefined : "true",
    }),
    [page, debouncedQuery, category, isFiltering],
  );

  const gridState = useResource(
    (signal) => publicApi.blogs(gridParams, signal),
    [gridParams],
  );

  /* Reset to the first page whenever filters change. */
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, category]);

  const featured = featuredState.data?.items?.[0]
    ? adaptBlogPost(featuredState.data.items[0])
    : null;
  const gridPosts = (gridState.data?.items ?? []).map(adaptBlogPost);
  const totalPages = gridState.data?.totalPages ?? 1;
  const categories = gridState.data?.categories ?? [];

  const loading = gridState.loading;
  const error = gridState.error;

  return (
    <>
      <PageHeading
        eyebrow="The Journal"
        title="Essays, notes & thinking worth keeping."
        description="Long-form writing on strategy, craft and the practice of doing work that lasts. Filter by theme, or search the library."
      />

      <section className="py-14 sm:py-20">
        <Container>
          {/* Featured essay — default view only */}
          {!isFiltering && featured ? (
            <Reveal>
              <Link
                to={`/blogs/${featured.slug}`}
                className="group grid overflow-hidden rounded-2xl border border-line bg-card shadow-rest transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:-translate-y-1 lg:grid-cols-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[22rem]">
                  <ImageWithFallback
                    src={featured.cover}
                    alt={featured.alt}
                    className="absolute inset-0 size-full transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-5 top-5 rounded-full bg-cream/95 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-bronze-700">
                    Featured essay
                  </span>
                </div>

                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                  <div className="flex items-center gap-3 text-xs text-ink-muted">
                    <span>{featured.category}</span>
                    <span aria-hidden="true" className="size-1 rounded-full bg-bronze-300" />
                    <time dateTime={featured.date}>
                      {formatDate(featured.date)}
                    </time>
                    <span aria-hidden="true" className="size-1 rounded-full bg-bronze-300" />
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {featured.readingTime} min
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-2xl leading-snug font-medium text-ink transition-colors group-hover:text-bronze-700 sm:text-3xl lg:text-[2.1rem]">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
                    {featured.excerpt}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-bronze-700">
                    Read the essay
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path
                        d="M2 8h11M9 3.5 13.5 8 9 12.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            </Reveal>
          ) : null}

          {/* Filter bar */}
          <Reveal className="mt-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <CategoryFilter
              categories={categories}
              active={category}
              onChange={setCategory}
              label="Filter essays by category"
            />
            <SearchInput
              value={query}
              onChange={setQuery}
              id="blog-search"
              placeholder="Search essays…"
              label="Search the journal"
            />
          </Reveal>

          {/* Listing grid */}
          {loading ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3" aria-hidden="true">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-xl border border-line bg-card">
                  <div className="aspect-[16/10] animate-pulse bg-ink/[0.06]" />
                  <div className="space-y-3 p-6">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-ink/[0.05]" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-ink/[0.06]" />
                    <div className="h-3 w-full animate-pulse rounded bg-ink/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <EmptyState
              className="mt-8"
              title="The journal could not load"
              description={error.message ?? "Something went wrong reaching the server."}
              action={
                <button
                  type="button"
                  onClick={gridState.retry}
                  className="rounded-full border border-ink/15 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-bronze-500 hover:text-bronze-700"
                >
                  Try again
                </button>
              }
            />
          ) : null}

          {!loading && !error ? (
            gridPosts.length > 0 ? (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {gridPosts.map((post, index) => (
                  <Reveal key={post.slug} delay={index * 60}>
                    <BlogCard post={post} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <EmptyState
                className="mt-8"
                title={
                  <span className="inline-flex items-center gap-2">
                    <SearchX className="size-5 text-ink-muted" aria-hidden="true" />
                    No essays match
                  </span>
                }
                description="Try a different category or clear the search to see the whole journal."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setCategory("All");
                    }}
                    className="rounded-full border border-ink/15 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-bronze-500 hover:text-bronze-700"
                  >
                    Clear filters
                  </button>
                }
              />
            )
          ) : null}

          {!loading && !error && totalPages > 1 ? (
            <Pagination
              className="mt-12"
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              ariaLabel="Journal pagination"
            />
          ) : null}
        </Container>
      </section>
    </>
  );
}
