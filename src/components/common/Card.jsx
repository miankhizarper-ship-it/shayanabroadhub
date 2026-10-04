import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

/**
 * Card — the standard white surface used for services, journal
 * teasers, resources and more. Lifts gently on hover; becomes a
 * link automatically when `to` or `href` is supplied.
 */
export default function Card({ to, href, className, children, ...rest }) {
  const classes = cn(
    "group block rounded-xl border border-line bg-card p-6 shadow-rest transition-all duration-300",
    "sm:p-8",
    (to || href) &&
      "hover:-translate-y-1 hover:border-bronze-300 hover:shadow-lift focus-visible:-translate-y-1",
    className,
  );

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
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
