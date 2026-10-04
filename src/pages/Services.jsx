import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import PageHeading from "../components/common/PageHeading";
import Container from "../components/common/Container";
import SectionHeading from "../components/common/SectionHeading";
import Reveal from "../components/common/Reveal";
import CtaBand from "../components/common/CtaBand";
import EmptyState from "../components/common/EmptyState";
import { publicApi } from "../lib/api";
import { useResource } from "../hooks/useResource";
import { adaptService } from "../data/adapters";
import { engagementSteps } from "../data/engagementSteps";
import { getIcon } from "../utils/iconMap";
import { useSeo, serviceListSchema } from "../utils/seo";

const benefits = [
  {
    title: "Written everything",
    text: "Every session produces a written summary with next steps — the thinking doesn't evaporate when the call ends.",
  },
  {
    title: "Small roster, real access",
    text: "A deliberately limited client list means your questions get answered between sessions, not queued behind a queue.",
  },
  {
    title: "Frameworks you keep",
    text: "Engagements end with worksheets and templates in your hands, so the method outlives the retainer.",
  },
];

/**
 * Services — the complete engagement catalogue, served by the
 * public API with graceful empty/error states.
 */
export default function Services() {
  const { data, loading, error, retry } = useResource(
    (signal) => publicApi.services(signal),
    [],
  );

  const services = (data?.items ?? []).map(adaptService);

  useSeo({
    title: "Services",
    description:
      "Five ways to work together, from a single unraveled decision to a standing advisory partnership. Clear scope, honest timelines, no theatre.",
    path: "/services",
    jsonLd: serviceListSchema({ services, path: "/services" }),
  });

  return (
    <>
      <PageHeading
        eyebrow="Services"
        title="Counsel shaped around your context."
        description="Five ways to work together, from a single unraveled decision to a standing advisory partnership. Clear scope, honest timelines, no theatre."
      />

      {/* Service cards */}
      <section className="py-16 sm:py-24">
        <Container>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-line bg-card p-6 sm:p-8">
                  <div className="h-11 w-11 animate-pulse rounded-full bg-ink/[0.06]" />
                  <div className="mt-5 h-5 w-2/3 animate-pulse rounded bg-ink/[0.06]" />
                  <div className="mt-3 space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-ink/[0.05]" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-ink/[0.04]" />
                    <div className="h-3 w-4/6 animate-pulse rounded bg-ink/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Services could not load"
              description={error.message ?? "Something went wrong reaching the server."}
              action={
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-full border border-ink/15 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-bronze-500 hover:text-bronze-700"
                >
                  Try again
                </button>
              }
            />
          ) : services.length === 0 ? (
            <EmptyState
              title="The catalogue is being curated"
              description="Services will appear here shortly. In the meantime, the fastest route is a direct note describing your situation."
              action={
                <Link
                  to="/contact"
                  className="rounded-full bg-bronze-600 px-6 py-3 text-sm font-medium text-cream transition-all hover:bg-bronze-700"
                >
                  Book a Consultation
                </Link>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              {services.map((service, index) => {
                const Icon = getIcon(service.icon);
                return (
                  <Reveal key={service.id} delay={index * 70} className="h-full">
                    <article className="flex h-full flex-col rounded-xl border border-line bg-card p-6 shadow-rest transition-all duration-300 hover:-translate-y-1 hover:border-bronze-300 hover:shadow-lift sm:p-8">
                      <div className="flex items-start justify-between gap-4">
                        <span
                          aria-hidden="true"
                          className="inline-flex size-11 items-center justify-center rounded-full bg-bronze-100 text-bronze-700"
                        >
                          <Icon className="size-5" />
                        </span>
                        {service.tag ? (
                          <span className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                            {service.tag}
                          </span>
                        ) : null}
                      </div>

                      <h2 className="mt-5 font-display text-2xl font-medium text-ink">
                        {service.title}
                      </h2>
                      {service.tagline ? (
                        <p className="mt-1 font-display text-base italic text-bronze-600">
                          {service.tagline}
                        </p>
                      ) : null}
                      <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-[15px]">
                        {service.description}
                      </p>

                      {service.benefits.length > 0 ? (
                        <ul className="mt-5 flex-1 space-y-2.5 border-t border-line pt-5">
                          {service.benefits.map((benefit) => (
                            <li
                              key={benefit}
                              className="flex items-start gap-2.5 text-sm text-ink-soft"
                            >
                              <Check
                                className="mt-0.5 size-4 shrink-0 text-bronze-600"
                                aria-hidden="true"
                              />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex-1" />
                      )}

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                        <div className="text-xs leading-relaxed text-ink-muted">
                          {service.format ? (
                            <p>
                              <span className="font-semibold uppercase tracking-[0.14em]">
                                Format:
                              </span>{" "}
                              {service.format}
                            </p>
                          ) : null}
                          {service.commitment ? (
                            <p className="mt-0.5">
                              <span className="font-semibold uppercase tracking-[0.14em]">
                                Commitment:
                              </span>{" "}
                              {service.commitment}
                            </p>
                          ) : null}
                        </div>
                        <Link
                          to={`/contact?service=${encodeURIComponent(service.id)}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-bronze-600 px-4 py-2 text-[13px] font-medium text-cream transition-all hover:bg-bronze-700"
                        >
                          Enquire
                          <ArrowUpRight className="size-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* Benefits band */}
      <section className="border-y border-line bg-cream-deep/60 py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Why it works"
              title="What every engagement includes"
              align="center"
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3 sm:gap-6">
            {benefits.map((benefit, index) => (
              <Reveal key={benefit.title} delay={index * 100}>
                <div className="h-full rounded-xl border border-line bg-card p-7 text-center shadow-rest">
                  <h3 className="font-display text-xl font-medium text-ink">
                    {benefit.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                    {benefit.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Process */}
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="A simple, honest engagement path"
              description="The same four steps whether we work together once or for a year — you always know where things stand."
            />
          </Reveal>

          <ol className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {engagementSteps.map((item, index) => (
              <Reveal key={item.step} as="li" delay={index * 80} className="h-full">
                <div className="h-full rounded-xl border border-line bg-card p-6 shadow-rest sm:p-7">
                  <p
                    aria-hidden="true"
                    className="font-display text-4xl font-medium text-bronze-300"
                  >
                    {item.step}
                  </p>
                  <h3 className="mt-4 font-display text-xl font-medium text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <CtaBand
        tone="bronze"
        eyebrow="Next step"
        title="Not sure which shape fits?"
        description="Describe the situation in the contact form — I will suggest the lightest engagement that solves it, even if that is a single session."
        primaryLabel="Book a Consultation"
        primaryTo="/contact"
        secondaryLabel="About Shayan"
        secondaryTo="/about"
        className="pb-20 sm:pb-28"
      />
    </>
  );
}
