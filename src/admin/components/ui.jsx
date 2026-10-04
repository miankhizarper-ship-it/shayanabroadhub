import { LoaderCircle, RotateCcw } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Admin UI primitives — the shared visual language of the CMS.
 *
 * Deliberately distinct from the public editorial site: neutral
 * surfaces, compact rhythm, squared corners, Inter throughout,
 * semantic status colors. All built on the same Tailwind tokens.
 */

/* ── Buttons ───────────────────────────────────────────────── */

const buttonVariants = {
  primary:
    "bg-bronze-600 text-white hover:bg-bronze-700 disabled:hover:bg-bronze-600",
  secondary:
    "border border-ink/15 bg-white text-ink hover:border-ink/30 hover:bg-ink/[0.03]",
  ghost:
    "text-ink-soft hover:bg-ink/5 hover:text-ink",
  danger:
    "bg-red-600 text-white hover:bg-red-700 disabled:hover:bg-red-600",
  "danger-quiet":
    "border border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50",
  "on-dark":
    "bg-white/10 text-cream hover:bg-white/15",
};

const buttonSizes = {
  xs: "px-2.5 py-1.5 text-xs rounded-lg gap-1.5",
  sm: "px-3 py-2 text-[13px] rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-lg gap-2",
};

export function AdminButton({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600",
        "disabled:cursor-not-allowed disabled:opacity-60",
        buttonSizes[size],
        buttonVariants[variant],
        className,
      )}
      {...rest}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/* ── Form fields ───────────────────────────────────────────── */

const controlClasses = (hasError) =>
  cn(
    "w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70",
    "transition-colors focus:outline-none disabled:cursor-not-allowed disabled:bg-ink/[0.03]",
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-line focus:border-bronze-400 focus:ring-2 focus:ring-bronze-100",
  );

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-medium text-ink"
        >
          {label}
          {required ? (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {hint ? <span className="text-xs text-ink-muted">{hint}</span> : null}
      </div>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({ hasError, invalid, className, ...rest }) {
  return (
    <input
      aria-invalid={invalid || Boolean(hasError) || undefined}
      className={cn(controlClasses(hasError ?? invalid), className)}
      {...rest}
    />
  );
}

export function TextArea({ hasError, invalid, className, ...rest }) {
  return (
    <textarea
      aria-invalid={invalid || Boolean(hasError) || undefined}
      className={cn(controlClasses(hasError ?? invalid), "resize-y", className)}
      {...rest}
    />
  );
}

export function Select({ hasError, invalid, className, children, ...rest }) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || Boolean(hasError) || undefined}
        className={cn(controlClasses(hasError ?? invalid), "appearance-none pr-9", className)}
        {...rest}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 12 12"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-ink-muted"
      >
        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Accessible toggle switch. */
export function Toggle({ checked, onChange, label, description, disabled, id }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        {label ? (
          <label htmlFor={id} className="text-[13px] font-medium text-ink">
            {label}
          </label>
        ) : null}
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-bronze-600" : "bg-ink/20",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block size-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}

/* ── Status badges ─────────────────────────────────────────── */

const badgeTones = {
  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  draft: "bg-amber-50 text-amber-700 ring-amber-600/20",
  unread: "bg-bronze-50 text-bronze-800 ring-bronze-600/25",
  read: "bg-ink/5 text-ink-soft ring-ink/10",
  archived: "bg-ink/5 text-ink-muted ring-ink/10",
  featured: "bg-bronze-600 text-white ring-bronze-700",
  neutral: "bg-ink/5 text-ink-soft ring-ink/10",
};

export function StatusBadge({ tone = "neutral", children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        badgeTones[tone] ?? badgeTones.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── Surfaces ──────────────────────────────────────────────── */

export function Panel({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-white shadow-[0_1px_2px_rgb(23_22_19/0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PanelHeader({ title, description, actions, className }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4",
        className,
      )}
    >
      <div>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* ── Skeletons / loading / error / empty ───────────────────── */

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="divide-y divide-line" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div
              key={colIndex}
              className="h-3.5 animate-pulse rounded bg-ink/[0.07]"
              style={{ width: colIndex === 0 ? "28%" : `${14 + ((rowIndex + colIndex) % 3) * 6}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminLoading({ label = "Loading" }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-16 text-ink-soft">
      <LoaderCircle className="size-5 animate-spin text-bronze-600" aria-hidden="true" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function AdminErrorState({ error, onRetry, title = "Something went wrong" }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <RotateCcw className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
        {error?.message ?? "The request could not be completed. Try again in a moment."}
      </p>
      {onRetry ? (
        <AdminButton variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Retry
        </AdminButton>
      ) : null}
    </div>
  );
}

export function AdminEmptyState({ title, description, action, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon ? (
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-cream-deep text-ink-muted">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* ── Page header (title + breadcrumbs area actions) ────────── */

export function AdminPageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-ink-soft">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* ── Search input (toolbar size) ───────────────────────────── */

export function AdminSearchInput({ value, onChange, placeholder = "Search…", id, className }) {
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          controlClasses(false),
          "h-9 w-full py-0 [&::-webkit-search-cancel-button]:hidden",
        )}
      />
    </div>
  );
}
