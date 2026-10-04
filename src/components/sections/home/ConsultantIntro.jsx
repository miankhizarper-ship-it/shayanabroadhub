import { ArrowUpRight, Quote } from "lucide-react";
import Container from "../../common/Container";
import Reveal from "../../common/Reveal";
import Button from "../../common/Button";
import ImageWithFallback from "../../common/ImageWithFallback";
import { unsplash, photos } from "../../../utils/images";

/**
 * ConsultantIntro — first-person introduction with the working
 * portrait and a signature close.
 */
export default function ConsultantIntro() {
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
              <ImageWithFallback
                src={unsplash(photos.portraitWorking, { w: 900, h: 1100 })}
                alt="Shayan reviewing client notes at his desk"
                className="aspect-[4/5] w-full"
              />
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
