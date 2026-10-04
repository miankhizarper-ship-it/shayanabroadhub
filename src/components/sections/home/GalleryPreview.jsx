import { useMemo } from "react";
import { ArrowRight, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "../../common/Container";
import Reveal from "../../common/Reveal";
import SectionHeading from "../../common/SectionHeading";
import Button from "../../common/Button";
import ImageWithFallback from "../../common/ImageWithFallback";
import SectionSkeleton from "./SectionSkeleton";
import { publicApi } from "../../../lib/api";
import { useResource } from "../../../hooks/useResource";
import { adaptGalleryImage } from "../../../data/adapters";

/**
 * GalleryPreview — six curated tiles from the API pointing to the
 * full gallery. Hidden when the archive is empty.
 */
export default function GalleryPreview() {
  const { data, loading, error } = useResource(
    (signal) => publicApi.gallery(signal),
    [],
  );

  const preview = useMemo(
    () => (data?.items ?? []).map(adaptGalleryImage).slice(0, 6),
    [data],
  );

  if (!loading && (error || preview.length === 0)) return null;

  return (
    <section className="bg-cream-deep/70 py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Gallery"
              title="Selected work & moments"
              className="max-w-xl"
            />
            <Button to="/gallery" variant="secondary" size="sm" className="shrink-0">
              Open the gallery
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </Reveal>

        {loading ? (
          <SectionSkeleton cards={3} />
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:mt-14 lg:grid-cols-3 sm:gap-5">
            {preview.map((image, index) => (
              <Reveal key={image.id} delay={index * 60}>
                <Link
                  to="/gallery"
                  className="group relative block overflow-hidden rounded-xl shadow-rest focus-visible:outline-2"
                  aria-label={`Open the gallery — ${image.category}`}
                >
                  <ImageWithFallback
                    src={image.src}
                    alt={image.alt}
                    className={
                      index % 3 === 1
                        ? "aspect-[4/5] w-full"
                        : "aspect-[4/3] w-full"
                    }
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink-deep/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="flex items-center gap-2 p-4 text-xs font-semibold uppercase tracking-[0.18em] text-cream">
                      <Camera className="size-4" aria-hidden="true" />
                      {image.category}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
