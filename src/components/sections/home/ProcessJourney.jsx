import Container from "../../common/Container";
import Reveal from "../../common/Reveal";
import { engagementSteps } from "../../../data/engagementSteps";
import { publicApi } from "../../../lib/api";
import { useResource } from "../../../hooks/useResource";

/**
 * ProcessJourney — the four-step "success journey" band on a dark
 * ink surface: Discover → Frame → Act → Review.
 * Title/description can be overridden by the admin Pages editor
 * (home → journey) and fall back to the built-ins.
 */
export default function ProcessJourney() {
  const { data } = useResource((signal) => publicApi.page("home", signal), []);
  const journey = data?.sections?.journey ?? {};

  return (
    <section className="bg-ink-deep py-20 text-cream sm:py-28">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-bronze-300">
              <span className="h-px w-9 bg-bronze-400/60" aria-hidden="true" />
              The success journey
              <span className="h-px w-9 bg-bronze-400/60" aria-hidden="true" />
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight font-medium sm:text-4xl">
              {journey.title ?? "A simple path, honestly walked"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-cream/65">
              {journey.description ??
                "The same four steps whether we work together once or for a year — you always know where things stand and what comes next."}
            </p>
          </div>
        </Reveal>

        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {engagementSteps.map((step, index) => (
            <Reveal
              key={step.step}
              as="li"
              delay={index * 100}
              className="relative"
            >
              {/* Connector line (desktop) */}
              {index < engagementSteps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-7 left-[calc(50%+2.5rem)] hidden h-px w-[calc(100%-5rem)] bg-gradient-to-r from-bronze-400/60 to-bronze-400/10 lg:block"
                />
              ) : null}

              <div className="flex flex-col items-center text-center">
                <span
                  aria-hidden="true"
                  className="flex size-14 items-center justify-center rounded-full border border-bronze-400/50 bg-bronze-400/10 font-display text-lg italic text-bronze-300"
                >
                  {step.step}
                </span>
                <h3 className="mt-5 font-display text-xl font-medium text-cream">
                  {step.title}
                </h3>
                <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-cream/60">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
