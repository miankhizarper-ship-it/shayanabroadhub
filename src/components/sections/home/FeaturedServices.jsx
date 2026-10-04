import { useMemo } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import Container from "../../common/Container";
import Reveal from "../../common/Reveal";
import SectionHeading from "../../common/SectionHeading";
import Card from "../../common/Card";
import Button from "../../common/Button";
import SectionSkeleton from "./SectionSkeleton";
import { publicApi } from "../../../lib/api";
import { useResource } from "../../../hooks/useResource";
import { adaptService } from "../../../data/adapters";
import { getIcon } from "../../../utils/iconMap";

/**
 * FeaturedServices — the first three engagements from the API
 * (featured first, then display order). Hides when the catalogue
 * is empty; shows skeletons, never a broken layout, while loading.
 */
export default function FeaturedServices() {
  const { data, loading, error } = useResource(
    (signal) => publicApi.services(signal),
    [],
  );

  const featured = useMemo(
    () => (data?.items ?? []).map(adaptService).slice(0, 3),
    [data],
  );

  if (!loading && (error || featured.length === 0)) return null;

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="What I do"
            title="Three ways we can work together"
            description="Every engagement is personal — shaped around your context, your pace and the outcome that actually matters to you."
          />
        </Reveal>

        {loading ? (
          <SectionSkeleton cards={3} />
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-3 sm:mt-14 sm:gap-6">
            {featured.map((service, index) => {
              const Icon = getIcon(service.icon);
              return (
                <Reveal key={service.id} delay={index * 100}>
                  <Card className="flex h-full flex-col">
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

                    <h3 className="mt-5 font-display text-2xl font-medium text-ink">
                      {service.title}
                    </h3>
                    {service.tagline ? (
                      <p className="mt-1 font-display text-base italic text-bronze-600">
                        {service.tagline}
                      </p>
                    ) : null}
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                      {service.description}
                    </p>

                    {service.benefits.length > 0 ? (
                      <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
                        {service.benefits.slice(0, 3).map((benefit) => (
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
                    ) : null}

                    <Button
                      to="/services"
                      variant="secondary"
                      size="sm"
                      className="mt-6 self-start"
                    >
                      Learn more
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Button>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
