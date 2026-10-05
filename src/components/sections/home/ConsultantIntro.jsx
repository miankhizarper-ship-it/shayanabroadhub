import { ArrowUpRight, Quote } from "lucide-react";
import Container from "../../common/Container";
import Reveal from "../../common/Reveal";
import Button from "../../common/Button";
import ImageWithFallback from "../../common/ImageWithFallback";
import { publicApi } from "../../../lib/api";
import { useResource } from "../../../hooks/useResource";
import { optimizedImageSrc } from "../../../utils/images";

/**
 * ConsultantIntro — first-person introduction with the working
 * portrait and a signature close. The portrait is uploaded from the
 * admin Pages editor (home → intro); until then the slot shows a
 * branded monogram tile — never a stock photo.
 */
export default function ConsultantIntro() {
  const { data, loading } = useResource((signal) => publicApi.page("home", signal), []);
  const intro = data?.sections?.intro ?? {};
  const portrait = intro.image?.url
    ? optimizedImageSrc(intro.image.url, { width: 900 })
    : null;
  const portraitAlt = "Shayan reviewing client notes at his desk";

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* Working portrait */}
          <Reveal className="relative order-2 mx-auto w-full max-w-md lg:order-1">
            <div
              aria-hidden="true"
              className="absolute -top-5 -left-5 size-24 rounded-tl-3xl border-t-2 border-l-2 border-bronze-300"
            />
            <figure className="overflow-hidden rounded-2xl shadow-lift">
              {loading ? (
                <div
                  aria-hidden="true"
                  className="aspect-[4/5] w-full animate-pulse bg-gradient-to-br from-cream-deep via-bronze-100/50 to-cream-deep"
                />
              ) : portrait ? (
                <ImageWithFallback
                  src={portrait}
                  alt={portraitAlt}
                  className="aspect-[4/5] w-full"
                />
              ) : (
                <div
                  role="img"
                  aria-label={portraitAlt}
                  className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-bronze-100 via-cream-deep to-bronze-200"
                >
                  <span
                    aria-hidden="true"
                    className="font-display text-6xl italic text-bronze-600/80"
                  >
                    SA
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                    Shayan Abroad Hub
                  </span>
                </div>
              )}
            </figure>
            <div
              aria-hidden="true"
              className="absolute -right-5 -bottom-5 size-24 rounded-br-3xl border-r-2 border-b-2 border-bronze-300"
            />
          </Reveal>

          {/* Introduction */}
          <div className="order-1 lg:order-2">
            <Reveal>
              <p className="eyebrow">
                <span className="eyebrow-rule" aria-hidden="true" />
                Meet Shayan
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight font-medium text-ink sm:text-4xl">
                A consultant who writes, an editor who advises.
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-6 space-y-5 text-base leading-relaxed text-ink-soft">
                <p>
                  I spent the first decade of my career between two rooms: the
                  strategy room, where decisions are made, and the newsroom,
                  where words are made to carry them. Shayan Abroad Hub is what
                  those rooms taught me together — that most organisations do
                  not have a knowledge problem, they have a clarity problem,
                  and clarity is a craft you can practise.
                </p>
                <p>
                  Today I advise a deliberately small roster of founders,
                  creators and professional teams, and I write about the
                  patterns that keep repeating across their work. The
                  consulting keeps the writing honest. The writing keeps the
                  consulting sharp.
                </p>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <blockquote className="mt-8 flex gap-4 rounded-xl border border-line bg-card p-6 shadow-rest">
                <Quote
                  className="size-6 shrink-0 rotate-180 text-bronze-400"
                  aria-hidden="true"
                />
                <p className="font-display text-lg leading-snug italic text-ink">
                  Every engagement begins the same way: with the discipline of
                  seeing things as they are, not as the plan says they are.
                </p>
              </blockquote>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <Button to="/about" variant="secondary">
                  More about the practice
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Button>
                <p
                  aria-hidden="true"
                  className="font-display text-2xl italic text-bronze-600"
                >
                  — Shayan
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
