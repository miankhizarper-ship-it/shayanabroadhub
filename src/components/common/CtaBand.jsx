import { ArrowUpRight } from "lucide-react";
import Container from "./Container";
import Reveal from "./Reveal";
import Button, { PrimaryButton, SecondaryButton } from "./Button";

/**
 * CtaBand — shared closing call-to-action used at the foot of most
 * pages. One place to evolve the conversion message site-wide.
 */
export default function CtaBand({
  eyebrow = "Next step",
  title = "Ready to trade noise for clarity?",
  description = "Start with a single conversation. We will map where you are, where you want to be, and the shortest honest path between the two.",
  primaryLabel = "Book a Consultation",
  primaryTo = "/contact",
  secondaryLabel = "Explore Services",
  secondaryTo = "/services",
  tone = "bronze",
  className,
}) {
  const isInk = tone === "ink";

  return (
    <section className={className}>
      <Container>
        <Reveal>
          <div
            className={
              isInk
                ? "rounded-2xl bg-ink-deep px-6 py-14 text-center sm:px-12 sm:py-20"
                : "rounded-2xl border border-bronze-200 bg-bronze-50 px-6 py-14 text-center sm:px-12 sm:py-20"
            }
          >
            {eyebrow ? (
              <p
                className={
                  isInk
                    ? "text-xs font-semibold uppercase tracking-[0.22em] text-bronze-300"
                    : "text-xs font-semibold uppercase tracking-[0.22em] text-bronze-700"
                }
              >
                {eyebrow}
              </p>
            ) : null}

            <h2
              className={
                isInk
                  ? "mx-auto mt-4 max-w-2xl font-display text-3xl leading-tight font-medium text-cream sm:text-4xl"
                  : "mx-auto mt-4 max-w-2xl font-display text-3xl leading-tight font-medium text-ink sm:text-4xl"
              }
            >
              {title}
            </h2>

            <p
              className={
                isInk
                  ? "mx-auto mt-4 max-w-xl text-base leading-relaxed text-cream/70"
                  : "mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft"
              }
            >
              {description}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {isInk ? (
                <Button to={primaryTo} variant="light">
                  {primaryLabel}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Button>
              ) : (
                <PrimaryButton to={primaryTo}>
                  {primaryLabel}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </PrimaryButton>
              )}
              <SecondaryButton to={secondaryTo}>{secondaryLabel}</SecondaryButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
