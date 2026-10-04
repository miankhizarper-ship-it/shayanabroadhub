import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { AdminButton } from "./ui";

/**
 * Modal — accessible dialog (Escape close, backdrop close, focus
 * handoff, scroll lock, aria-modal). Content is portaled to body
 * so nothing can clip it.
 */
export default function Modal({ open, onClose, title, description, children, size = "md" }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  /* Latest-callback ref — call sites pass inline arrows whose identity
     changes on every keystroke of the form inside this modal. Keeping
     `onClose` out of the open-effect deps means the effect (and its
     cleanup, which restores focus to the pre-modal element) only runs
     when the dialog actually opens or closes, so typing never steals
     focus from inputs. */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onCloseRef.current?.();
    };
    document.addEventListener("keydown", handleKey);

    /* Initial focus lands on the panel for keyboard users. */
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", handleKey);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink-deep/50 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative z-10 max-h-[92dvh] w-full overflow-hidden rounded-t-2xl bg-white shadow-lift outline-none sm:rounded-2xl",
          "animate-[modal-in_0.22s_cubic-bezier(0.22,1,0.36,1)_both]",
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[calc(92dvh-4rem)] overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * ConfirmDialog — danger-confirmation modal for destructive actions
 * (deletes, unpublish flows). Requires an explicit click.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm leading-relaxed text-ink-soft">{message}</p>
      <div className="mt-6 flex items-center justify-end gap-2">
        <AdminButton variant="secondary" size="sm" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </AdminButton>
        <AdminButton variant="danger" size="sm" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </AdminButton>
      </div>
    </Modal>
  );
}
