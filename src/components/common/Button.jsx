import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200 active:translate-y-px select-none";

const sizes = {
  md: "px-6 py-3 text-sm",
  sm: "px-5 py-2.5 text-[13px]",
  lg: "px-7 py-3.5 text-[15px]",
};

const variants = {
  /** Solid bronze — the primary action of any view. */
  primary:
    "bg-bronze-600 text-cream hover:bg-bronze-700 hover:shadow-lift focus-visible:outline-bronze-700",
  /** Quiet outline — secondary actions. */
  secondary:
    "border border-ink/15 bg-transparent text-ink hover:border-bronze-500 hover:text-bronze-700 focus-visible:outline-bronze-600",
  /** On dark surfaces (footer, ink bands). */
  light:
    "bg-cream text-ink hover:bg-bronze-100 hover:text-bronze-800 focus-visible:outline-cream",
};

/**
 * Button — polymorphic CTA. Renders:
 *   - a react-router <Link>  when `to` is provided
 *   - an <a>                 when `href` is provided
 *   - a <button>             otherwise
 */
export default function Button({
  to,
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}) {
  const classes = cn(base, sizes[size], variants[variant], className);

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}

/** Convenience aliases so call-sites read naturally. */
export function PrimaryButton(props) {
  return <Button {...props} />;
}

export function SecondaryButton(props) {
  return <Button variant="secondary" {...props} />;
}
