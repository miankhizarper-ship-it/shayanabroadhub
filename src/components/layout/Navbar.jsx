import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navLinks, site } from "../../utils/site";
import { useScrolled } from "../../hooks/useScrolled";
import { cn } from "../../utils/cn";
import Container from "../common/Container";

/**
 * Wordmark — serif brand name with the second half accented in bronze.
 */
function Wordmark({ className }) {
  return (
    <span
      className={cn(
        "font-display text-xl font-medium tracking-tight text-ink",
        className,
      )}
    >
      Shayan <span className="italic text-bronze-600">Abroad</span> Hub
    </span>
  );
}

const desktopLink = ({ isActive }) =>
  cn(
    "text-[13px] font-medium uppercase tracking-[0.14em] transition-colors duration-200",
    isActive ? "text-bronze-700" : "text-ink-soft hover:text-ink",
  );

export default function Navbar() {
  const scrolled = useScrolled(8);
  const [open, setOpen] = useState(false);
  const closeBtnRef = useRef(null);
  const { pathname } = useLocation();

  /* Close the mobile panel whenever navigation happens. */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* Lock body scroll + close on Escape while the panel is open. */
  useEffect(() => {
    if (!open) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /* Rendered as a fragment: the mobile panel must be a SIBLING of the
     header, never a child — the header's `backdrop-blur` makes it the
     containing block for fixed descendants, which would collapse the
     full-screen panel to the header's own height. */
  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled || open
            ? "border-b border-line bg-cream/95 shadow-rest backdrop-blur-sm"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <Container as="nav" aria-label="Primary" className="relative">
          <div className="flex h-16 items-center justify-between gap-4 sm:h-20">
            {/* Brand */}
            <Link
              to="/"
              className="flex items-center gap-3 rounded-sm"
              aria-label={`${site.name} — home`}
            >
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-lg bg-ink font-display text-sm italic text-cream"
              >
                SA
              </span>
              <Wordmark />
            </Link>

            {/* Desktop navigation */}
            <ul className="hidden items-center gap-7 lg:flex">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={desktopLink}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Prominent consultation CTA (desktop) */}
            <div className="hidden lg:block">
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 rounded-full bg-bronze-600 px-5 py-2.5 text-[13px] font-medium tracking-wide text-cream transition-all duration-200 hover:bg-bronze-700 hover:shadow-lift"
              >
                Book a Consultation
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Mobile trigger */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label="Open navigation menu"
              className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-card text-ink transition-colors hover:border-bronze-300 hover:text-bronze-700 lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </Container>
      </header>

      {/* ── Mobile navigation panel ─────────────────────────────── */}
      <div
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        hidden={!open}
        className={cn(
          "fixed inset-0 z-[60] flex flex-col bg-cream lg:hidden",
          open && "animate-fade-in",
        )}
      >
        <Container className="flex h-16 items-center justify-between sm:h-20">
          <Wordmark />
          <button
            type="button"
            ref={closeBtnRef}
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-card text-ink transition-colors hover:border-bronze-300 hover:text-bronze-700"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </Container>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto">
          <Container className="flex h-full flex-col justify-between pb-10">
            <ul className="mt-6 space-y-1">
              {navLinks.map((link, index) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-baseline gap-4 border-b border-line py-4 transition-colors",
                        isActive
                          ? "text-bronze-700"
                          : "text-ink hover:text-bronze-700",
                      )
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="font-sans text-xs font-medium tracking-widest text-ink-muted"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-2xl">{link.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-muted">
                Start a conversation
              </p>
              <Link
                to="/contact"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-bronze-600 px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-bronze-700"
              >
                Book a Consultation
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Container>
        </nav>
      </div>
    </>
  );
}
