import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  Download,
  FileArchive,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import PageHeading from "../components/common/PageHeading";
import Container from "../components/common/Container";
import Reveal from "../components/common/Reveal";
import CategoryFilter from "../components/common/CategoryFilter";
import SearchInput from "../components/common/SearchInput";
import Pagination from "../components/common/Pagination";
import EmptyState from "../components/common/EmptyState";
import LoadingState from "../components/common/LoadingState";
import { publicApi } from "../lib/api";
import { useResource } from "../hooks/useResource";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { adaptResource } from "../data/adapters";
import { cn } from "../utils/cn";
import { useSeo } from "../utils/seo";

const PAGE_SIZE = 6;

const typeIcon = {
  PDF: FileText,
  XLSX: FileSpreadsheet,
  DOCX: FileText,
  ZIP: FileArchive,
  EPUB: FileText,
};

const typeBadge = {
  PDF: "bg-bronze-100 text-bronze-800",
  XLSX: "bg-ink/5 text-ink",
  DOCX: "bg-ink/5 text-ink",
  ZIP: "bg-bronze-600/10 text-bronze-800",
  EPUB: "bg-ink/5 text-ink",
};

/**
 * Downloads — the resource library, served by the public API.
 * Published resources with a real file URL download directly and
 * ping the counter; the card metadata (type · size) comes from the
 * document, exactly as before.
 */
export default function Downloads() {
  useSeo({
    title: "Resource Library",
    description:
      "Practical worksheets, templates and guides from the practice — free to download, built for real decisions.",
    path: "/downloads",
  });

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 350);
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  const { data, loading, error, retry } = useResource(
    (signal) => publicApi.downloads(signal),
    [],
  );

  const categories = data?.categories ?? [];
  const allResources = useMemo(
    () => (data?.items ?? []).map(adaptResource),
    [data],
  );

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    return allResources.filter((resource) => {
      const inCategory =
        category === "All" || resource.category === category;
      const inSearch =
        needle === "" ||
        resource.title.toLowerCase().includes(needle) ||
        resource.description.toLowerCase().includes(needle);
      return inCategory && inSearch;
    });
  }, [allResources, debouncedQuery, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageResources = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [debouncedQuery, category]);

  const handleDownload = (resource) => {
    if (resource.fileUrl) {
      /* Fire-and-forget counter ping — never blocks the download. */
      publicApi.trackDownload(resource.id).catch(() => {});
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="Downloads"
        title="A resource library you can actually use."
        description="Templates, guides and tools from real client work — free to download, built to be put to work immediately."
      />

      <section className="py-14 sm:py-20">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <CategoryFilter
              categories={categories}
              active={category}
              onChange={setCategory}
              label="Filter resources by category"
            />
            <SearchInput
              value={query}
              onChange={setQuery}
              id="downloads-search"
              placeholder="Search resources…"
              label="Search the resource library"
            />
          </Reveal>

          {loading ? (
            <LoadingState label="Loading resources" className="mt-8" />
          ) : error ? (
            <EmptyState
              className="mt-8"
              title="Resources could not load"
              description={error.message ?? "Something went wrong reaching the server."}
              action={
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-full border border-ink/15 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-bronze-500 hover:text-bronze-700"
                >
                  Try again
                </button>
              }
            />
          ) : pageResources.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {pageResources.map((resource, index) => {
                const Icon = typeIcon[resource.fileType] ?? FileText;
                return (
                  <Reveal key={resource.id} delay={index * 60} className="h-full">
                    <article className="flex h-full flex-col rounded-xl border border-line bg-card p-6 shadow-rest transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-7">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "inline-flex size-11 items-center justify-center rounded-lg",
                            typeBadge[resource.fileType] ?? "bg-ink/5 text-ink",
                          )}
                        >
                          <Icon className="size-5" />
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-ink-muted">
                          <span className="rounded-full border border-line px-2.5 py-1">
                            {resource.fileType}
                            {resource.fileSize ? ` · ${resource.fileSize}` : ""}
                          </span>
                          {resource.version ? (
                            <span className="rounded-full border border-line px-2.5 py-1">
                              {resource.version}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <h2 className="mt-4 font-display text-xl leading-snug font-medium text-ink">
                        {resource.title}
                      </h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                        {resource.description}
                      </p>

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                          {resource.category}
                        </span>
                        {resource.fileUrl ? (
                          <a
                            href={resource.fileUrl}
                            download
                            onClick={() => handleDownload(resource)}
                            aria-label={`Download ${resource.title} (${resource.fileType}${resource.fileSize ? `, ${resource.fileSize}` : ""})`}
                            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-cream transition-all hover:bg-bronze-700"
                          >
                            <ArrowDownToLine
                              className="size-4"
                              aria-hidden="true"
                            />
                            Download
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-line px-4 py-2 text-[13px] font-medium text-ink-muted">
                            <Download
                              className="size-4"
                              aria-hidden="true"
                            />
                            Coming soon
                          </span>
                        )}
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <EmptyState
              className="mt-8"
              title="No resources match"
              description="Try a different category or clear the search to see the full library."
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
          )}

          {!loading && !error ? (
            <Pagination
              className="mt-12"
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              ariaLabel="Resource library pagination"
            />
          ) : null}
        </Container>
      </section>
    </>
  );
}
