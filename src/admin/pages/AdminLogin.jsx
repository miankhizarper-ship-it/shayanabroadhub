import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { cn } from "../../utils/cn";

/**
 * AdminLogin — the only unauthenticated CMS screen. On success the
 * visitor continues to their originally requested admin route.
 */
export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      const from = location.state?.from;
      navigate(from && from.startsWith("/admin") ? from : "/admin", { replace: true });
    } catch (cause) {
      setFormError(
        cause?.status === 422
          ? "Check the highlighted fields and try again."
          : cause?.message ?? "Sign-in failed. Try again in a moment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-ink-deep">
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-flex size-10 items-center justify-center rounded-xl bg-bronze-600 font-display text-lg italic text-white"
            >
              S
            </span>
            <div>
              <p className="text-sm font-semibold text-cream">Shayan Abroad Hub</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-cream/40">
                Content Studio
              </p>
            </div>
          </div>

          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-cream">
            Sign in to the studio
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-cream/55">
            The dashboard is restricted to the site owner. Your session lives in
            a secure, httpOnly cookie — no tokens are kept in the browser.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-7"
            aria-label="Admin sign-in form"
          >
            {formError ? (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-400/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-200"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {formError}
              </div>
            ) : null}

            <div>
              <label htmlFor="admin-email" className="text-[13px] font-medium text-cream/90">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "admin-email-error" : undefined}
                placeholder="you@example.com"
                className={cn(
                  "mt-1.5 w-full rounded-lg border bg-ink-deep/60 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30",
                  "transition-colors focus:outline-none",
                  errors.email
                    ? "border-red-400/60 focus:border-red-300"
                    : "border-white/15 focus:border-bronze-400",
                )}
              />
              {errors.email ? (
                <p id="admin-email-error" role="alert" className="mt-1.5 text-xs text-red-300">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="mt-4">
              <label htmlFor="admin-password" className="text-[13px] font-medium text-cream/90">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "admin-password-error" : undefined}
                  placeholder="••••••••••"
                  className={cn(
                    "w-full rounded-lg border bg-ink-deep/60 px-3.5 py-2.5 pr-11 text-sm text-cream placeholder:text-cream/30",
                    "transition-colors focus:outline-none",
                    errors.password
                      ? "border-red-400/60 focus:border-red-300"
                      : "border-white/15 focus:border-bronze-400",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-cream/40 transition-colors hover:text-cream"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p id="admin-password-error" role="alert" className="mt-1.5 text-xs text-red-300">
                  {errors.password}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-bronze-600 px-4 py-3 text-sm font-semibold text-white",
                "transition-colors hover:bg-bronze-500",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-300",
                "disabled:cursor-wait disabled:opacity-70",
              )}
            >
              {submitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  <LockKeyhole className="size-4" aria-hidden="true" />
                  Sign in
                </>
              )}
            </button>

            {import.meta.env.DEV ? (
              <p className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[11px] leading-relaxed text-cream/45">
                Demo environment — sign in with{" "}
                <span className="font-medium text-cream/70">admin@shayanabroadhub.com</span> /{" "}
                <span className="font-medium text-cream/70">Broadhub2026</span>. This hint never
                appears in production builds.
              </p>
            ) : null}
          </form>

          <a
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-cream/50 transition-colors hover:text-cream"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to the public site
          </a>
        </div>
      </div>
    </div>
  );
}
