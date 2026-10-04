import { cn } from "../../utils/cn";

/**
 * SectionHeading — consistent editorial heading block used across
 * sections: eyebrow label, display-serif title, optional description.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}) {
  const centered = align === "center";

  return (
    <div
      className={cn(centered && "mx-auto text-center", "max-w-2xl", className)}
    >
      {eyebrow ? (
        <p className={cn("eyebrow", centered && "justify-center")}>
          <span className="eyebrow-rule" aria-hidden="true" />
          {eyebrow}
          {centered && <span className="eyebrow-rule" aria-hidden="true" />}
        </p>
      ) : null}

      <h2 className="mt-4 font-display text-3xl leading-[1.15] font-medium text-ink sm:text-4xl">
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed text-ink-soft sm:text-lg",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
