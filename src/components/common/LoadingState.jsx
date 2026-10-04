import { LoaderCircle } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * LoadingState — accessible shared loading presentation for data
 * views arriving in later phases (journal, gallery, resources).
 */
export default function LoadingState({
  label = "Loading",
  className,
  as: Tag = "div",
}) {
  return (
    <Tag
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-20 text-ink-soft",
        className,
      )}
    >
      <LoaderCircle
        className="size-6 animate-spin text-bronze-600"
        aria-hidden="true"
      />
      <p className="text-sm tracking-wide">
        {label}
        <span aria-hidden="true">…</span>
        <span className="sr-only">, please wait</span>
      </p>
    </Tag>
  );
}
