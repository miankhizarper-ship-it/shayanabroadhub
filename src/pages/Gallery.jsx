import { useMemo, useState } from "react";
import { Camera, Maximize2 } from "lucide-react";
import PageHeading from "../components/common/PageHeading";
import Container from "../components/common/Container";
import Reveal from "../components/common/Reveal";
import CategoryFilter from "../components/common/CategoryFilter";
import EmptyState from "../components/common/EmptyState";
import LoadingState from "../components/common/LoadingState";
import ImageWithFallback from "../components/common/ImageWithFallback";
import Lightbox from "../components/sections/gallery/Lightbox";
import { publicApi } from "../lib/api";
import { useResource } from "../hooks/useResource";
import { adaptGalleryImage } from "../data/adapters";
import { useSeo } from "../utils/seo";

/**
 * Gallery — responsive, filterable image grid with a full-screen
 * lightbox, served by the public API. Filtering happens
 * client-side over the (capped) curated archive so the lightbox
 * navigation stays instant.
 */
export default function Gallery() {
  useSeo({
    title: "Gallery",
    description:
      "A curated archive of moments from engagements, workshops and the writing desk — browse by theme.",
    path: "/gallery",
  });

  const [category, setCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const { data, loading, error, retry } = useResource(
    (signal) => publicApi.gallery(signal),
    [],
  );

  const categories = data?.categories ?? [];
  const allImages = useMemo(
    () => (data?.items ?? []).map(adaptGalleryImage),
    [data],
  );

  const images = useMemo(
    () =>
      category === "All"
        ? allImages
        : allImages.filter((image) => image.category === category),
    [allImages, category],
  );

  return (
    <>
      <PageHeading
        eyebrow="Gallery"
        title="Selected work, moments & materials."
        description="A curated visual archive of the practice — engagements, workshops and the quiet craft behind them. Select any image to view it full-screen."
      />

      <section className="py-14 sm:py-20">
        <Container>
          <Reveal>
            <CategoryFilter
              categories={categories}
              active={category}
              onChange={setCategory}
              label="Filter gallery by category"
            />
          </Reveal>

          {loading ? (
            <LoadingState label="Loading gallery" className="mt-8" />
          ) : error ? (
            <EmptyState
              className="mt-8"
              title="The gallery could not load"
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
          ) : images.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
              {images.map((image, index) => (
                <Reveal key={image.id} delay={(index % 6) * 60}>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`View image: ${image.alt}`}
                    className="group relative block w-full overflow-hidden rounded-xl border border-line bg-card shadow-rest transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:-translate-y-1"
                  >
                    <ImageWithFallback
                      src={image.src}
                      alt={image.alt}
                      className={
                        image.orientation === "portrait"
                          ? "aspect-[4/5] w-full"
                          : "aspect-[7/5] w-full"
                      }
                    />
                    <span className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-ink-deep/75 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream">
                        {image.category}
                      </span>
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-cream/90 text-ink">
                        <Maximize2 className="size-3.5" aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-8"
              title="No images in this category yet"
              description="New work is added as engagements wrap. Try another category in the meantime."
            />
          )}

          {!loading && !error && images.length > 0 ? (
            <p className="mt-12 flex items-center justify-center gap-2 text-center text-sm text-ink-muted">
              <Camera className="size-4" aria-hidden="true" />
              {images.length} of {allImages.length} images shown
            </p>
          ) : null}
        </Container>
      </section>

      {lightboxIndex !== null ? (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </>
  );
}
