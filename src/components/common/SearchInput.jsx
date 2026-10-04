import { Search, X } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * SearchInput — shared accessible search field used by the Blog
 * listing and the Downloads library. Controlled component.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  label,
  className,
  id = "search",
}) {
  return (
    <div className={cn("relative w-full sm:max-w-xs", className)}>
      <label htmlFor={id} className="sr-only">
        {label ?? placeholder}
      </label>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          "w-full rounded-full border border-line bg-card py-2.5 pl-11 text-sm text-ink placeholder:text-ink-muted",
          "transition-colors focus:border-bronze-400 focus:outline-none",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-muted transition-colors hover:text-ink"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
