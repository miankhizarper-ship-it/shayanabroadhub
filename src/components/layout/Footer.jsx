import { Link } from "react-router-dom";
import { ArrowUpRight, Instagram, Linkedin, Mail, MapPin, Twitter } from "lucide-react";
import { navLinks, site } from "../../utils/site";
import Container from "../common/Container";

/**
 * Footer — dark editorial closing block. Pinned to the viewport
 * bottom by the app shell (#root flex column + mt-auto).
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ink-deep text-cream/75">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3" aria-label={`${site.name} — home`}>
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-lg bg-cream font-display text-sm italic text-ink"
              >
                SA
              </span>
              <span className="font-display text-xl font-medium tracking-tight text-cream">
                Shayan <span className="italic text-bronze-300">Abroad</span> Hub
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">
              {site.description}
            </p>
            <ul className="mt-6 flex items-center gap-2.5">
              {site.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-cream/15 text-cream/70 transition-all hover:border-bronze-300 hover:text-bronze-300"
                  >
                    {social.label === "LinkedIn" ? (
                      <Linkedin className="size-4" aria-hidden="true" />
                    ) : social.label === "Instagram" ? (
                      <Instagram className="size-4" aria-hidden="true" />
                    ) : (
                      <Twitter className="size-4" aria-hidden="true" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-bronze-300 transition-colors hover:text-bronze-200"
            >
              Work with me
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Explore */}
          <nav aria-label="Footer">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
              Explore
            </h2>
            <ul className="mt-5 space-y-3">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-cream/75 transition-colors hover:text-bronze-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
              Get in touch
            </h2>
            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2.5 text-sm text-cream/75 transition-colors hover:text-bronze-300"
                >
                  <Mail className="size-4 shrink-0 text-bronze-400" aria-hidden="true" />
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-cream/75">
                <MapPin className="mt-0.5 size-4 shrink-0 text-bronze-400" aria-hidden="true" />
                {site.location}
              </li>
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-cream/50">
              Consultations are by appointment. Expect a reply within two
              business days.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-cream/10 pt-7 text-xs tracking-wide text-cream/45 sm:flex-row sm:items-center">
          <p>
            &copy; {year} {site.name}. All rights reserved.
          </p>
          <p className="font-display italic text-cream/45">
            Clarity, thoughtfully delivered.
          </p>
        </div>
      </Container>
    </footer>
  );
}
