/**
 * SectionSkeleton — shared loading placeholder for the homepage's
 * API-backed preview sections (blogs / services / gallery /
 * resources). Keeps the page rhythm stable while data arrives.
 */
export default function SectionSkeleton({ cards = 3 }) {
  return (
    <div
      className="mt-12 grid gap-5 sm:mt-14 md:grid-cols-3 sm:gap-6"
      aria-hidden="true"
    >
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-line bg-card"
        >
          <div className="aspect-[16/10] animate-pulse bg-ink/[0.05]" />
          <div className="space-y-3 p-6">
            <div className="h-3 w-1/3 animate-pulse rounded bg-ink/[0.05]" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-ink/[0.06]" />
            <div className="h-3 w-full animate-pulse rounded bg-ink/[0.04]" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-ink/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}
