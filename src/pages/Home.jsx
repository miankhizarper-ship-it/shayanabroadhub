import HomeHero from "../components/sections/home/HomeHero";
import ConsultantIntro from "../components/sections/home/ConsultantIntro";
import AboutPreview from "../components/sections/home/AboutPreview";
import FeaturedServices from "../components/sections/home/FeaturedServices";
import ProcessJourney from "../components/sections/home/ProcessJourney";
import FeaturedBlogs from "../components/sections/home/FeaturedBlogs";
import GalleryPreview from "../components/sections/home/GalleryPreview";
import ResourcesPreview from "../components/sections/home/ResourcesPreview";
import CtaBand from "../components/common/CtaBand";
import Container from "../components/common/Container";
import { publicApi } from "../lib/api";
import { useResource } from "../hooks/useResource";
import { useSeo, websiteSchema, personSchema } from "../utils/seo";
import { site } from "../utils/site";

const expertise = [
  "Strategy",
  "Editorial Thinking",
  "Brand Clarity",
  "Knowledge Design",
  "Consulting",
  "Long-form Writing",
];

/**
 * Home — the complete public homepage.
 * Section order: hero → consultant introduction →
 * about preview → featured services → success journey → featured
 * blogs → gallery preview → resources preview → contact CTA.
 * Collection previews are API-driven; hero/about/journey/CTA copy
 * can be overridden from the admin Pages editor.
 */
export default function Home() {
  const { data } = useResource((signal) => publicApi.page("home", signal), []);
  const contactCta = data?.sections?.contactCta ?? {};

  useSeo({
    title: "Shayan Abroad Hub — Personal Consulting & Knowledge Hub",
    description: site.description,
    path: "/",
    jsonLd: [
      websiteSchema(),
      personSchema({ sameAs: site.socials.map((social) => social.href) }),
    ],
  });

  return (
    <>
      <HomeHero />
      <ConsultantIntro />
      <AboutPreview />
      <FeaturedServices />
      <ProcessJourney />

      {/* Expertise strip */}
      <section aria-label="Areas of expertise" className="border-y border-line">
        <Container>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-6 sm:py-7">
            {expertise.map((item) => (
              <li
                key={item}
                className="flex items-center gap-6 text-[13px] font-medium uppercase tracking-[0.18em] text-ink-soft"
              >
                {item}
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-bronze-400"
                />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <FeaturedBlogs />
      <GalleryPreview />
      <ResourcesPreview />
      <CtaBand
        tone="ink"
        eyebrow="Start a conversation"
        title={contactCta.title ?? "Ready to trade noise for clarity?"}
        description={contactCta.description ??
          "Consultations are by appointment and unhurried. Bring the decision that is keeping you stuck — leave with a plan."}
        primaryLabel="Book a Consultation"
        primaryTo="/contact"
        secondaryLabel="About Shayan"
        secondaryTo="/about"
        className="py-20 sm:py-28"
      />
    </>
  );
}
