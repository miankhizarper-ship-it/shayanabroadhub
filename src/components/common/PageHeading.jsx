import { cn } from "../../utils/cn";

/**
 * PageHeading — shared masthead for all interior pages.
 * Gives every route the same editorial opening: eyebrow, large
 * serif title, supporting line and a hairline base rule.
 */
export default function PageHeading({ eyebrow, title, description, className }) {
  return (
    <header
      className={cn(
        "border-b border-line bg-cream-deep/60 pt-32 pb-12 sm:pt-40 sm:pb-16",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-site px-5 sm:px-8">
        {eyebrow ? (
          <p className="eyebrow animate-fade-in">
            <span className="eyebrow-rule" aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}

        <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.08] font-medium text-ink animate-fade-up sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft animate-fade-up sm:text-lg [animation-delay:120ms]">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
