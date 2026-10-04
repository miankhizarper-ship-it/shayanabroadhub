import { useMemo } from "react";
import { ArrowRight, Download, FileText, FileSpreadsheet, FileArchive } from "lucide-react";
import Container from "../../common/Container";
import Reveal from "../../common/Reveal";
import SectionHeading from "../../common/SectionHeading";
import Button from "../../common/Button";
import SectionSkeleton from "./SectionSkeleton";
import { publicApi } from "../../../lib/api";
import { useResource } from "../../../hooks/useResource";
import { adaptResource } from "../../../data/adapters";

const typeIcon = {
  PDF: FileText,
  XLSX: FileSpreadsheet,
  DOCX: FileText,
  ZIP: FileArchive,
  EPUB: FileText,
};

/**
 * ResourcesPreview — three highlights from the download library,
 * served by the API. Hidden when the library is empty.
 */
export default function ResourcesPreview() {
  const { data, loading, error } = useResource(
    (signal) => publicApi.downloads(signal),
    [],
  );

  const preview = useMemo(
    () => (data?.items ?? []).map(adaptResource).slice(0, 3),
    [data],
  );

  if (!loading && (error || preview.length === 0)) return null;

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Resource library"
              title="Tools you can use today"
              description="Templates and worksheets from real client work — formatted, tested and free to download."
              className="max-w-xl"
            />
            <Button to="/downloads" variant="secondary" size="sm" className="shrink-0">
              Browse all resources
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </Reveal>

        {loading ? (
          <SectionSkeleton cards={3} />
        ) : (
          <ul className="mt-12 grid gap-5 sm:mt-14 md:grid-cols-3 sm:gap-6">
            {preview.map((resource, index) => {
              const Icon = typeIcon[resource.fileType] ?? FileText;
              return (
                <Reveal as="li" key={resource.id} delay={index * 100} className="h-full">
                  <div className="flex h-full flex-col rounded-xl border border-line bg-card p-6 shadow-rest transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-7">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        aria-hidden="true"
                        className="inline-flex size-10 items-center justify-center rounded-lg bg-bronze-100 text-bronze-700"
                      >
                        <Icon className="size-4.5" />
                      </span>
                      <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink-muted">
                        {resource.fileType}
                        {resource.fileSize ? ` · ${resource.fileSize}` : ""}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-lg leading-snug font-medium text-ink">
                      {resource.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft line-clamp-3">
                      {resource.description}
                    </p>
                    <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                      <Download className="size-3.5" aria-hidden="true" />
                      Free download
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}
