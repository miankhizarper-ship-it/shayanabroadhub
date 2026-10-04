import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * ToastContext — lightweight notification system for the CMS.
 * Auto-dismissing, aria-live announcements, four tones. Rendered
 * bottom-right on desktop / top on mobile via <ToastViewport />.
 */

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CheckCircle2, ring: "border-emerald-500/30", iconClass: "text-emerald-400" },
  error: { icon: XCircle, ring: "border-red-500/30", iconClass: "text-red-400" },
  warning: { icon: AlertTriangle, ring: "border-amber-500/30", iconClass: "text-amber-400" },
  info: { icon: Info, ring: "border-bronze-500/40", iconClass: "text-bronze-400" },
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (tone, message, { duration = 4200 } = {}) => {
      const id = ++toastId;
      setToasts((current) => [...current.slice(-4), { id, tone, message }]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), duration),
      );
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      success: (message, options) => push("success", message, options),
      error: (message, options) => push("error", message, options),
      warning: (message, options) => push("warning", message, options),
      info: (message, options) => push("info", message, options),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      {toasts.map((toast) => {
        const tone = TONES[toast.tone] ?? TONES.info;
        const Icon = tone.icon;
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border bg-ink-deep px-4 py-3.5 text-cream shadow-lift",
              "animate-[toast-in_0.25s_cubic-bezier(0.22,1,0.36,1)_both]",
              tone.ring,
            )}
          >
            <Icon className={cn("mt-0.5 size-5 shrink-0", tone.iconClass)} aria-hidden="true" />
            <p className="flex-1 text-sm leading-relaxed text-cream/95">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-cream/60 transition-colors hover:bg-white/10 hover:text-cream"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
