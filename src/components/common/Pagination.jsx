import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Pagination — shared client-side pagination UI for the Blog
 * listing and Downloads library. Renders an ellipsised page list
 * with previous/next controls; fully keyboard accessible.
 */
export default function Pagination({
  page,
  totalPages,
  onChange,
  className,
  ariaLabel = "Pagination",
}) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav aria-label={ariaLabel} className={cn("flex items-center justify-center gap-1.5", className)}>
      <PageButton
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </PageButton>

      {pages.map((item, index) =>
        item === "…" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="px-1.5 text-sm text-ink-muted"
          >
            …
          </span>
        ) : (
          <PageButton
            key={item}
            onClick={() => onChange(item)}
            active={item === page}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </PageButton>
        ),
      )}

      <PageButton
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </PageButton>
    </nav>
  );
}

function PageButton({ active, className, children, ...rest }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border text-sm font-medium transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-bronze-600 bg-bronze-600 text-cream"
          : "border-line bg-card text-ink-soft hover:border-bronze-300 hover:text-bronze-700",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Build a compact page list with ellipses, e.g. 1 … 4 5 6 … 12 */
function buildPageList(page, totalPages) {
  const shown = new Set([1, totalPages, page - 1, page, page + 1]);
  const list = [];
  let previous = 0;

  for (const p of [...shown].sort((a, b) => a - b)) {
    if (p < 1 || p > totalPages) continue;
    if (p - previous > 1) list.push("…");
    list.push(p);
    previous = p;
  }
  return list;
}
