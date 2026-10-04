import { cn } from "../../utils/cn";

/**
 * EmptyState — shared "nothing matched" presentation for filtered
 * lists (blogs, gallery, downloads). Pairs with LoadingState for
 * the future API-backed views.
 */
export default function EmptyState({
  title = "Nothing matches those filters",
  description = "Try a different category or clear the search to see everything again.",
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-cream-deep/50 px-6 py-16 text-center",
        className,
      )}
    >
      <p
        aria-hidden="true"
        className="font-display text-4xl italic text-bronze-300"
      >
        ~
      </p>
      <h3 className="mt-3 font-display text-xl font-medium text-ink">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
