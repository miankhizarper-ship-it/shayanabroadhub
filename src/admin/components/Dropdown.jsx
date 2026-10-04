import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";

/**
 * Dropdown — small accessible menu (click outside / Escape close,
 * aria-expanded). Used for row actions and the topbar admin menu.
 */
export default function Dropdown({
  trigger,
  items,
  align = "left",
  label,
  className,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex"
      >
        {trigger}
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-40 mt-1.5 min-w-44 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lift",
            "animate-[menu-in_0.16s_ease-out_both]",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item, index) =>
            item.divider ? (
              <div key={`divider-${index}`} className="my-1 h-px bg-line" role="separator" />
            ) : (
              <button
                key={item.label}
                role="menuitem"
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-ink-soft hover:bg-cream-deep hover:text-ink",
                )}
              >
                {item.icon ? <item.icon className="size-4 shrink-0" aria-hidden="true" /> : null}
                {item.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
