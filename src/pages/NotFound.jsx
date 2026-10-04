import { ArrowLeft } from "lucide-react";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import { useSeo } from "../utils/seo";

/**
 * NotFound — custom 404. Rendered for any unmatched route
 * (see the catch-all `*` route in AppRoutes).
 */
export default function NotFound() {
  useSeo({
    title: "Page Not Found",
    description: "This page does not exist — pick a destination from the navigation instead.",
    noIndex: true,
  });

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_20%,rgba(176,141,87,0.10),transparent_70%)]"
      />
      <Container className="relative flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow justify-center animate-fade-in">
          <span className="eyebrow-rule" aria-hidden="true" />
          Page not found
          <span className="eyebrow-rule" aria-hidden="true" />
        </p>

        <p
          aria-hidden="true"
          className="mt-6 font-display text-[6rem] leading-none font-medium italic text-bronze-300 animate-fade-up sm:text-[9rem]"
        >
          404
        </p>

        <h1 className="mt-4 max-w-xl font-display text-2xl leading-snug font-medium text-ink animate-fade-up sm:text-3xl [animation-delay:100ms]">
          This page seems to have wandered off the map.
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft animate-fade-up sm:text-base [animation-delay:180ms]">
          The link may be old, mistyped, or the page may have moved while the
          site is being built. Everything worth finding is one click away.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 animate-fade-up sm:flex-row [animation-delay:260ms]">
          <Button to="/">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Home
          </Button>
          <Button to="/contact" variant="secondary">
            Contact Support
          </Button>
        </div>
      </Container>
    </section>
  );
}
