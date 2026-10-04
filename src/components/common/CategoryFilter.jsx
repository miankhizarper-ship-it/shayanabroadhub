import { cn } from "../../utils/cn";

/**
 * CategoryFilter — the shared pill filter used by Blogs, Gallery
 * and Downloads. Accessible radiogroup semantics with one active pill.
 */
export default function CategoryFilter({
  categories,
  active,
  onChange,
  allLabel = "All",
  className,
  label = "Filter by category",
}) {
  const options = [allLabel, ...categories];

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {options.map((option) => {
        const isActive = option === active;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] font-medium tracking-wide transition-all duration-200",
              isActive
                ? "border-bronze-600 bg-bronze-600 text-cream shadow-rest"
                : "border-line bg-card text-ink-soft hover:border-bronze-300 hover:text-bronze-700",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
