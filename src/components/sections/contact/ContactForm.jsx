import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Send,
} from "lucide-react";
import { publicApi } from "../../../lib/api";
import { site } from "../../../utils/site";
import { cn } from "../../../utils/cn";

/**
 * ContactForm — full client-side validation, then a REAL submission
 * to POST /api/contact (rate-limited, validated, stored as an unread
 * admin message). Success and failure are reported honestly; the
 * mailto hand-off remains as a fallback on error.
 */

const initialValues = { name: "", email: "", subject: "", message: "" };
const initialHoneypot = "";

function validate(values) {
  const errors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Please share your name (at least 2 characters).";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "That email address doesn't look right yet.";
  }

  if (values.subject.trim().length < 3) {
    errors.subject = "A short subject helps me route your note (3+ characters).";
  }

  if (values.message.trim().length < 20) {
    errors.message = "Tell me a little more — at least 20 characters.";
  }

  return errors;
}

function buildMailto(values) {
  const subject = `Consultation enquiry — ${values.subject.trim()}`;
  const body = [
    `Name: ${values.name.trim()}`,
    `Email: ${values.email.trim()}`,
    "",
    values.message.trim(),
  ].join("\n");
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const fieldClasses = (hasError) =>
  cn(
    "w-full rounded-xl border bg-card px-4 py-3 text-sm text-ink placeholder:text-ink-muted",
    "transition-colors focus:outline-none",
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-line focus:border-bronze-400",
  );

export default function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [honeypot, setHoneypot] = useState(initialHoneypot);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [serverError, setServerError] = useState(null);

  const handleChange = (field) => (event) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    /* Re-validate live once a field has been touched/errored. */
    if (touched[field]) {
      setErrors(validate(next));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, subject: true, message: true });

    if (Object.keys(nextErrors).length > 0) {
      /* Move focus to the first invalid field for keyboard users. */
      const firstInvalid = ["name", "email", "subject", "message"].find(
        (field) => nextErrors[field],
      );
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    setStatus("sending");
    setServerError(null);

    try {
      await publicApi.contact({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        /* Honeypot — hidden field; humans never fill it. A filled
           value is silently dropped server-side (bot signal). */
        companyWebsite: honeypot,
      });
      setStatus("sent");
    } catch (cause) {
      setServerError(cause);
      setStatus("error");
    }
  };

  const handleReset = () => {
    setValues(initialValues);
    setHoneypot(initialHoneypot);
    setErrors({});
    setTouched({});
    setStatus("idle");
    setServerError(null);
  };

  /* ── Success state ─────────────────────────────────────────── */
  if (status === "sent") {
    return (
      <div
        role="status"
        className="flex h-full flex-col items-center justify-center rounded-2xl border border-line bg-card p-8 text-center shadow-rest sm:p-10"
      >
        <span
          aria-hidden="true"
          className="inline-flex size-14 items-center justify-center rounded-full bg-bronze-100 text-bronze-700"
        >
          <CheckCircle2 className="size-6" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-medium text-ink">
          Your note is on its way, {values.name.trim().split(" ")[0]}.
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          It has landed safely in the inbox — expect a personal reply within
          two business days, usually sooner.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-7 rounded-full border border-ink/15 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-bronze-500 hover:text-bronze-700"
        >
          Write another note
        </button>
      </div>
    );
  }

  /* ── Form state ────────────────────────────────────────────── */
  const fieldOrder = [
    { field: "name", label: "Your name", type: "text", autoComplete: "name", placeholder: "Amara Osei" },
    { field: "email", label: "Email address", type: "email", autoComplete: "email", placeholder: "you@company.com" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-line bg-card p-6 shadow-rest sm:p-8"
      aria-label="Consultation enquiry form"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {fieldOrder.map(({ field, label, type, autoComplete, placeholder }) => (
          <div key={field}>
            <label
              htmlFor={`contact-${field}`}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft"
            >
              {label}
            </label>
            <input
              id={`contact-${field}`}
              type={type}
              value={values[field]}
              onChange={handleChange(field)}
              onBlur={handleBlur(field)}
              autoComplete={autoComplete}
              placeholder={placeholder}
              aria-invalid={Boolean(errors[field])}
              aria-describedby={errors[field] ? `contact-${field}-error` : undefined}
              className={cn(fieldClasses(Boolean(errors[field])), "mt-2")}
            />
            {errors[field] ? (
              <p
                id={`contact-${field}-error`}
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
              >
                <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                {errors[field]}
              </p>
            ) : null}
          </div>
        ))}

        <div className="sm:col-span-2">
          <label
            htmlFor="contact-subject"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft"
          >
            Subject
          </label>
          <input
            id="contact-subject"
            type="text"
            value={values.subject}
            onChange={handleChange("subject")}
            onBlur={handleBlur("subject")}
            placeholder="e.g. Positioning review for a product launch"
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? "contact-subject-error" : undefined}
            className={cn(fieldClasses(Boolean(errors.subject)), "mt-2")}
          />
          {errors.subject ? (
            <p
              id="contact-subject-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
            >
              <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
              {errors.subject}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="contact-message"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            rows={6}
            value={values.message}
            onChange={handleChange("message")}
            onBlur={handleBlur("message")}
            placeholder="What are you working on, and where are you stuck? Rough is fine — clarity is my job."
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            className={cn(fieldClasses(Boolean(errors.message)), "mt-2 resize-y")}
          />
          {errors.message ? (
            <p
              id="contact-message-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
            >
              <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
              {errors.message}
            </p>
          ) : null}
        </div>
      </div>

      {status === "error" ? (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm leading-relaxed text-red-700"
        >
          <p className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {serverError?.message ??
              "Your note could not be sent just now — the service may be briefly unavailable."}
          </p>
          <p className="mt-2">
            No message was lost from your side:{" "}
            <a
              href={buildMailto(values)}
              className="inline-flex items-center gap-1 font-semibold underline decoration-red-300 underline-offset-2"
            >
              hand it off via your email app
              <ArrowRight className="size-3" aria-hidden="true" />
            </a>{" "}
            or try again in a moment.
          </p>
        </div>
      ) : null}

      <div className="mt-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-xs leading-relaxed text-ink-muted">
          Replies within two business days. Your details are never shared.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 rounded-full bg-bronze-600 px-6 py-3 text-sm font-medium text-cream transition-all hover:bg-bronze-700 hover:shadow-lift disabled:cursor-wait disabled:opacity-70"
        >
          {status === "sending" ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden="true" />
              Send message
            </>
          )}
        </button>
      </div>

      {/* Honeypot field — visually hidden and untabbable for humans;
          bots that auto-fill it never reach the inbox. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Company website</label>
        <input
          id="contact-website"
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      {/* Hidden live region announces error count to screen readers. */}
      <p className="sr-only" aria-live="polite">
        {Object.keys(errors).length > 0
          ? `${Object.keys(errors).length} field${Object.keys(errors).length > 1 ? "s" : ""} need attention.`
          : "All fields valid."}
      </p>

    </form>
  );
}
