import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * AdminPagination — compact server-side pagination for CMS tables.
 * Shows an explicit range ("1–10 of 42") plus prev/next controls.
 */
export default function AdminPagination({ page, totalPages, total, limit, onChange, className }) {
  if (totalPages <= 1 && !total) return null;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3",
        className,
      )}
    >
      <p className="text-xs text-ink-muted" aria-live="polite">
        {total > 0 ? (
          <>
            Showing <span className="font-medium text-ink">{from}–{to}</span> of{" "}
            <span className="font-medium text-ink">{total}</span>
          </>
        ) : (
          "No results"
        )}
      </p>
      <div className="flex items-center gap-1.5">
        <PageButton
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </PageButton>
        <span className="px-1.5 text-xs tabular-nums text-ink-soft">
          Page {page} of {totalPages}
        </span>
        <PageButton
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({ className, children, ...rest }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg border border-line bg-white text-ink-soft",
        "transition-colors hover:border-ink/25 hover:text-ink",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-soft",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
