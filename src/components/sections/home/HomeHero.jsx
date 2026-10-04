import { ArrowUpRight, Sparkles } from "lucide-react";
import Container from "../../common/Container";
import { PrimaryButton, SecondaryButton } from "../../common/Button";
import ImageWithFallback from "../../common/ImageWithFallback";
import { publicApi } from "../../../lib/api";
import { useResource } from "../../../hooks/useResource";

/**
 * HomeHero — the editorial masthead.
 * Two-column: copy left, arch-framed portrait right with floating
 * credential cards; watermark word and radial warmth behind.
 * Hero copy/image come from the admin Pages editor ("home" page
 * content). While the page data loads, the portrait slot shows a
 * quiet skeleton — never a placeholder photo — and if no image has
 * been uploaded yet it settles on a branded monogram tile instead
 * of any stock imagery.
 */
export default function HomeHero() {
  const { data, loading } = useResource((signal) => publicApi.page("home", signal), []);
  const hero = data?.sections?.hero ?? {};
  const heroTitle = hero.title ?? null;
  const heroDescription = hero.description ??
    "Shayan Abroad Hub partners with founders, creators and professionals — turning complexity into strategy, strategy into writing, and writing into results you can point to.";
  const portrait = hero.image?.url ?? null;
  const portraitAlt = "Portrait of Shayan, principal consultant";

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-44 lg:pb-24">
      {/* Warm radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_78%_8%,rgba(176,141,87,0.13),transparent_65%)]"
      />
      {/* Editorial watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 font-display text-[22vw] leading-none italic text-ink/[0.035] select-none lg:left-auto lg:right-[-2rem] lg:translate-x-0 lg:text-[15rem]"
      >
        clarity
      </span>

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <p className="eyebrow justify-center animate-fade-in lg:justify-start">
              <span className="eyebrow-rule" aria-hidden="true" />
              Personal Consulting &amp; Knowledge Hub
            </p>

            {heroTitle ? (
              <h1 className="mt-6 font-display text-[2.7rem] leading-[1.05] font-medium tracking-tight text-ink animate-fade-up sm:text-6xl lg:text-[4.2rem]">
                {heroTitle}
              </h1>
            ) : (
              <h1 className="mt-6 font-display text-[2.7rem] leading-[1.05] font-medium tracking-tight text-ink animate-fade-up sm:text-6xl lg:text-[4.2rem]">
                The clarity behind{" "}
                <em className="italic text-bronze-600">confident</em> decisions.
              </h1>
            )}

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft animate-fade-up sm:text-lg lg:mx-0 [animation-delay:120ms]">
              {heroDescription}
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 animate-fade-up sm:flex-row lg:justify-start [animation-delay:240ms]">
              <PrimaryButton to="/contact">
                Book a Consultation
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </PrimaryButton>
              <SecondaryButton to="/services">Explore Services</SecondaryButton>
            </div>
          </div>

          {/* Portrait composition */}
          <div className="relative mx-auto w-full max-w-sm animate-fade-up lg:max-w-none [animation-delay:200ms]">
            {/* Offset arch frame */}
            <div
              aria-hidden="true"
              className="absolute -inset-3 translate-x-4 translate-y-4 rounded-t-[11rem] rounded-b-2xl border border-bronze-300/70 sm:rounded-t-[13rem]"
            />
            <figure className="relative overflow-hidden rounded-t-[11rem] rounded-b-2xl shadow-lift sm:rounded-t-[13rem]">
              {loading ? (
                /* Skeleton while the page data is in flight — the
                   uploaded image (or the monogram tile) takes over
                   the moment it resolves, with no stock-photo flash. */
                <div
                  aria-hidden="true"
                  className="aspect-[4/5] w-full animate-pulse bg-gradient-to-br from-cream-deep via-bronze-100/50 to-cream-deep"
                />
              ) : portrait ? (
                <ImageWithFallback
                  src={portrait}
                  alt={portraitAlt}
                  loading="eager"
                  fetchpriority="high"
                  className="aspect-[4/5] w-full"
                  wrapperClassName="aspect-[4/5] w-full"
                />
              ) : (
                <div
                  role="img"
                  aria-label={portraitAlt}
                  className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-bronze-100 via-cream-deep to-bronze-200"
                >
                  <span
                    aria-hidden="true"
                    className="font-display text-7xl italic text-bronze-600/80"
                  >
                    SA
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                    Shayan Abroad Hub
                  </span>
                </div>
              )}
            </figure>

            {/* Floating credential card */}
            <div className="absolute -bottom-6 -left-3 flex items-center gap-3 rounded-xl border border-line bg-card/95 px-5 py-4 shadow-lift backdrop-blur-sm sm:-left-8">
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-full bg-bronze-100 text-bronze-700"
              >
                <Sparkles className="size-4.5" />
              </span>
              <div>
                <p className="font-display text-lg leading-tight font-medium text-ink">
                  Personal counsel, one client at a time
                </p>
                <p className="text-xs text-ink-muted">
                  Founders, teams &amp; independent professionals
                </p>
              </div>
            </div>

            {/* Availability chip */}
            <div className="absolute -top-3 right-2 flex items-center gap-2 rounded-full border border-line bg-card/95 px-4 py-2 shadow-rest backdrop-blur-sm sm:right-6">
              <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-bronze-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-bronze-500" />
              </span>
              <span className="text-xs font-medium tracking-wide text-ink">
                Taking new consultations
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
