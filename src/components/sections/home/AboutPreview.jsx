import { ArrowUpRight, BookOpen, Compass, Users } from "lucide-react";
import Container from "../../common/Container";
import Reveal from "../../common/Reveal";
import SectionHeading from "../../common/SectionHeading";
import Button from "../../common/Button";
import ImageWithFallback from "../../common/ImageWithFallback";
import { publicApi } from "../../../lib/api";
import { useResource } from "../../../hooks/useResource";
import { optimizedImageSrc } from "../../../utils/images";

const marks = [
  {
    icon: Compass,
    title: "Strategy first",
    text: "Every piece of advice traces back to a position you chose on purpose.",
  },
  {
    icon: BookOpen,
    title: "Written to last",
    text: "Session notes, briefs and essays — thinking you can return to, not slides you forget.",
  },
  {
    icon: Users,
    title: "Few clients, deep work",
    text: "A deliberately small roster so every engagement gets full attention.",
  },
];

/**
 * Branded tonal tile shown for collage slots without an uploaded
 * image (and while the page data is in flight, as a quiet skeleton).
 * No stock photography ships in the code — empty slots stay on-brand
 * until real imagery is uploaded from the admin Pages editor.
 */
function ImageSlot({ image, alt, label, className = "" }) {
  if (!image) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-bronze-100 via-cream-deep to-bronze-200 ${className}`}
      >
        <span aria-hidden="true" className="font-display text-4xl italic text-bronze-600/70">
          SA
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          {label}
        </span>
      </div>
    );
  }
  return (
    <ImageWithFallback
      src={image}
      alt={alt}
      className={className}
    />
  );
}

/**
 * AboutPreview — the practice overview that points to /about.
 * Title/description and up to three collage images are editable in
 * the admin Pages editor (home → about); empty slots render the
 * branded tile, never stock imagery.
 */
export default function AboutPreview() {
  const { data, loading } = useResource((signal) => publicApi.page("home", signal), []);
  const about = data?.sections?.about ?? {};
  const images = [
    about.images?.[0]?.url ?? null,
    about.images?.[1]?.url ?? null,
    about.images?.[2]?.url ?? null,
  ].map((url) => (url ? optimizedImageSrc(url, { width: 1200 }) : null));

  return (
    <section className="bg-cream-deep/70 py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <Reveal>
            <SectionHeading
              eyebrow="The practice"
              title={about.title ?? "Built for the long middle, not the loud launch."}
              description={about.description ??
                "Shayan Abroad Hub exists for the unglamorous middle of the work — the months where positioning is tested, writing is shipped and decisions compound. That is where clarity pays its rent."}
            />

            <ul className="mt-8 space-y-5">
              {marks.map((mark) => (
                <li key={mark.title} className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-bronze-100 text-bronze-700"
                  >
                    <mark.icon className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-medium text-ink">
                      {mark.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {mark.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Button to="/about" variant="secondary" className="mt-9">
              Read the full story
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Button>
          </Reveal>

          <Reveal delay={150}>
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <figure className="col-span-2 overflow-hidden rounded-2xl shadow-rest">
                {loading ? (
                  <div
                    aria-hidden="true"
                    className="aspect-[12/7] w-full animate-pulse bg-gradient-to-br from-cream-deep via-bronze-100/50 to-cream-deep"
                  />
                ) : (
                  <ImageSlot
                    image={images[0]}
                    alt="The practice at work"
                    label="Shayan Abroad Hub"
                    className="aspect-[12/7] w-full transition-transform duration-500 hover:scale-[1.03]"
                  />
                )}
              </figure>
              <figure className="overflow-hidden rounded-2xl shadow-rest">
                {loading ? (
                  <div
                    aria-hidden="true"
                    className="aspect-[7/8] w-full animate-pulse bg-gradient-to-br from-cream-deep via-bronze-100/50 to-cream-deep"
                  />
                ) : (
                  <ImageSlot
                    image={images[1]}
                    alt="Reference material in warm light"
                    label="Shayan Abroad Hub"
                    className="aspect-[7/8] w-full transition-transform duration-500 hover:scale-[1.03]"
                  />
                )}
              </figure>
              <figure className="overflow-hidden rounded-2xl shadow-rest">
                {loading ? (
                  <div
                    aria-hidden="true"
                    className="aspect-[7/8] w-full animate-pulse bg-gradient-to-br from-cream-deep via-bronze-100/50 to-cream-deep"
                  />
                ) : (
                  <ImageSlot
                    image={images[2]}
                    alt="Portrait of Shayan"
                    label="Shayan Abroad Hub"
                    className="aspect-[7/8] w-full transition-transform duration-500 hover:scale-[1.03]"
                  />
                )}
              </figure>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
