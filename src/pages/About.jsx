import {
  ArrowUpRight,
  Compass,
  HandHeart,
  Landmark,
  NotebookPen,
  Scale,
  Sprout,
  Telescope,
} from "lucide-react";
import PageHeading from "../components/common/PageHeading";
import Container from "../components/common/Container";
import SectionHeading from "../components/common/SectionHeading";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Reveal from "../components/common/Reveal";
import CtaBand from "../components/common/CtaBand";
import ImageWithFallback from "../components/common/ImageWithFallback";
import { unsplash, photos } from "../utils/images";
import { useSeo, personSchema } from "../utils/seo";

const values = [
  {
    icon: Compass,
    title: "Clarity before speed",
    description:
      "Fast answers to vague questions are expensive. We slow down just long enough to define the real problem — then move quickly.",
  },
  {
    icon: HandHeart,
    title: "Advice with skin in it",
    description:
      "Guidance you can act on today, not abstract frameworks. Every session ends with next steps that are specific, sequenced and yours.",
  },
  {
    icon: Scale,
    title: "Honesty over comfort",
    description:
      "You get a direct, good-humoured reading of the situation — including the parts that are inconvenient to hear.",
  },
  {
    icon: NotebookPen,
    title: "Thinking in public",
    description:
      "Lessons from client work are distilled into essays and resources, so the thinking keeps working long after the engagement ends.",
  },
];

const milestones = [
  {
    year: "2014",
    title: "The newsroom years",
    text: "Began as an editor shaping long-form journalism — where the habit of asking better questions was trained daily, on deadline.",
  },
  {
    year: "2017",
    title: "Into the strategy room",
    text: "Moved to the client side of the table, leading content and positioning for venture-backed teams as they scaled past their first thousand customers.",
  },
  {
    year: "2020",
    title: "Independent practice",
    text: "Opened the consultancy with a deliberate thesis: fewer clients, deeper engagements, written thinking as a public commitment.",
  },
  {
    year: "2023",
    title: "The knowledge hub",
    text: "Essays, worksheets and workshops turned recurring client patterns into a public library — the 'broadhub' in the name.",
  },
  {
    year: "2026",
    title: "One roof, worldwide",
    text: "Consulting, editorial direction and the resource library unified in a single digital home — the site you are reading now.",
  },
];

const highlights = [
  "Positioned and named two product companies later acquired",
  "Newsletter strategies that grew to 60k+ combined subscribers",
  "Keynotes and workshops for teams across 9 countries",
  "Interim editorial leadership during three major rebrands",
];

export default function About() {
  useSeo({
    title: "About the Practice",
    description:
      "Shayan Abroad Hub is the personal consulting practice and knowledge hub of Shayan — where deep work, editorial thinking and honest counsel meet.",
    path: "/about",
    jsonLd: personSchema(),
  });

  return (
    <>
      <PageHeading
        eyebrow="About"
        title="A quiet, considered practice built on clarity."
        description="Shayan Abroad Hub is the personal consulting practice and knowledge hub of Shayan — where deep work, editorial thinking and honest counsel meet."
      />

      {/* Story + portrait */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
            <Reveal>
              <SectionHeading
                eyebrow="The story"
                title="From shaping sentences to shaping decisions"
              />
              <div className="mt-6 space-y-5 text-base leading-relaxed text-ink-soft">
                <p>
                  I did not set out to be a consultant. I set out to edit — to
                  sit with writers and make their thinking sharper than they
                  found it. Ten years of that teaches you something the
                  strategy books arrive at by a longer road: most problems,
              patiently stated, contain their own solution.
                </p>
                <p>
                  The move to strategy work felt less like a career change and
                  more like a wider application of the same craft. A company's
                  positioning is an argument. A product roadmap is an essay
                  about the future. A brand is a promise with grammar. The
                  tools transferred; only the stakes grew.
                </p>
                <p>
                  The practice you are looking at is the result: a deliberately
                  small consultancy, a public journal that keeps me honest, and
                  a growing library of the templates and worksheets that make
                  the method usable without me in the room.
                </p>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <figure className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -top-4 -right-4 size-24 rounded-tr-3xl border-t-2 border-r-2 border-bronze-300"
                />
                <div className="overflow-hidden rounded-2xl shadow-lift">
                  <ImageWithFallback
                    src={unsplash(photos.portraitSecondary, { w: 800, h: 1000 })}
                    alt="Portrait of Shayan in natural light"
                    className="aspect-[4/5] w-full"
                  />
                </div>
                <figcaption className="mt-4 text-center text-sm italic text-ink-muted">
                  Editor, strategist, and — always — a writer first.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Journey & milestones */}
      <section className="border-y border-line bg-cream-deep/60 py-16 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Journey & milestones"
              title="Twelve years, five chapters"
              description="The practice in its present shape is the sum of deliberate turns — each one kept, in public, on the record."
              align="center"
            />
          </Reveal>

          <ol className="relative mx-auto mt-14 max-w-2xl">
            {/* Vertical spine */}
            <span
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-bronze-400/70 via-line to-line"
            />
            {milestones.map((milestone, index) => (
              <Reveal
                as="li"
                key={milestone.year}
                delay={index * 80}
                className="relative pb-10 pl-10 last:pb-0 sm:pl-14"
              >
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 left-0 flex size-[15px] items-center justify-center rounded-full border-2 border-bronze-500 bg-cream"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-bronze-700">
                  {milestone.year}
                </p>
                <h3 className="mt-1.5 font-display text-xl font-medium text-ink sm:text-2xl">
                  {milestone.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
                  {milestone.text}
                </p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Mission & vision */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 sm:gap-6">
            <Reveal>
              <Card className="h-full">
                <span
                  aria-hidden="true"
                  className="inline-flex size-11 items-center justify-center rounded-full bg-bronze-100 text-bronze-700"
                >
                  <Sprout className="size-5" />
                </span>
                <h2 className="mt-5 font-display text-2xl font-medium text-ink">
                  Mission
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                  To help ambitious people and organisations see their situation
                  clearly enough to act on it — through counsel that is honest,
                  writing that is durable, and tools that outlive the
                  engagement that produced them.
                </p>
              </Card>
            </Reveal>
            <Reveal delay={100}>
              <Card className="h-full">
                <span
                  aria-hidden="true"
                  className="inline-flex size-11 items-center justify-center rounded-full bg-bronze-100 text-bronze-700"
                >
                  <Telescope className="size-5" />
                </span>
                <h2 className="mt-5 font-display text-2xl font-medium text-ink">
                  Vision
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                  A working culture where clarity is treated as infrastructure
                  — where decisions are written down, promises are kept in
                  public, and good thinking compounds instead of evaporating
                  with each quarter.
                </p>
              </Card>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Core values */}
      <section className="bg-cream-deep/70 py-16 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Core values"
              title="Four principles behind every engagement"
              description="The same convictions shape a one-hour consultation and a months-long advisory — they are the practice's operating system."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-6">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={index * 80}>
                <Card className="h-full">
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-bronze-100 text-bronze-700"
                    >
                      <value.icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-medium text-ink">
                        {value.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Experience highlights */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <Reveal>
              <SectionHeading
                eyebrow="Experience highlights"
                title="Selected work, on the record"
                description="Numbers age; the work speaks. A few representative engagements are summarised here — names withheld by agreement, outcomes described as they happened."
              />
            </Reveal>

            <Reveal delay={150}>
              <ul className="space-y-4">
                {highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-4 rounded-xl border border-line bg-card p-5 shadow-rest"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-bronze-100 text-bronze-700"
                    >
                      <Landmark className="size-4" />
                    </span>
                    <p className="text-sm leading-relaxed text-ink sm:text-base">
                      {highlight}
                    </p>
                  </li>
                ))}
              </ul>
              <Button to="/services" variant="secondary" className="mt-8">
                See how I can help
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Button>
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaBand
        tone="bronze"
        eyebrow="Work together"
        title="The next chapter could include your project."
        description="Bring the decision, the draft, or the deadlock. The first conversation is free and genuinely useful on its own."
        secondaryLabel="Explore Services"
        secondaryTo="/services"
        className="pb-20 sm:pb-28"
      />
    </>
  );
}
