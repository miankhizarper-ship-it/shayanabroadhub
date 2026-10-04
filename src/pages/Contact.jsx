import {
  CalendarCheck,
  Clock,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Twitter,
} from "lucide-react";
import PageHeading from "../components/common/PageHeading";
import Container from "../components/common/Container";
import SectionHeading from "../components/common/SectionHeading";
import Reveal from "../components/common/Reveal";
import ContactForm from "../components/sections/contact/ContactForm";
import { publicApi } from "../lib/api";
import { useResource } from "../hooks/useResource";
import { site } from "../utils/site";
import { useSeo } from "../utils/seo";

const socialIcons = {
  LinkedIn: Linkedin,
  Instagram: Instagram,
  "X (Twitter)": Twitter,
  X: Twitter,
  Twitter: Twitter,
};

const steps = [
  {
    icon: Mail,
    title: "Write a note",
    description:
      "Tell me, in a few sentences, what you are working on and where you feel stuck. Rough is fine — clarity is my job.",
  },
  {
    icon: CalendarCheck,
    title: "Book the intro call",
    description:
      "You will receive a reply with available times for a short introductory conversation — free, focused and without obligation.",
  },
  {
    icon: Clock,
    title: "Meet, then decide",
    description:
      "We talk, map the situation and agree whether — and how — to work together. You keep the notes either way.",
  },
];

/**
 * Contact — details come from the site settings (admin-editable),
 * the intro from the editable "contact" page content; both fall
 * back to the built-in brand values when unset.
 */
export default function Contact() {
  useSeo({
    title: "Contact & Consultations",
    description:
      "Book a consultation or start a conversation — appointments are remote-first, unhurried, and answered personally within two business days.",
    path: "/contact",
  });

  const settingsState = useResource((signal) => publicApi.site(signal), []);
  const pageState = useResource((signal) => publicApi.page("contact", signal), []);

  const settings = settingsState.data;
  const sections = pageState.data?.sections ?? {};

  const email = settings?.email || site.email;
  const location = settings?.location || site.location;
  const socials = settings?.socials?.length ? settings.socials : site.socials;
  const intro = sections.intro ?? {
    title: "Let's start with a conversation.",
    description:
      "Consultations are by appointment, remote-first and unhurried. Use the form below, or write directly — I read every note personally.",
  };

  /* WhatsApp: a real number turns the placeholder into a working
     deep link; until then it stays honestly disabled. */
  const whatsappNumber = String(settings?.whatsapp ?? "").replace(/[^\d]/g, "");
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : site.whatsapp.href;
  const whatsappConnected = Boolean(whatsappNumber);

  return (
    <>
      <PageHeading
        eyebrow="Contact"
        title={intro.title}
        description={intro.description}
      />

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-14">
            {/* Left column — contact details */}
            <div className="space-y-6">
              <Reveal>
                <div className="rounded-2xl border border-line bg-card p-7 shadow-rest sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-bronze-700">
                    Direct
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="mt-3 inline-flex items-center gap-3 font-display text-xl text-ink transition-colors hover:text-bronze-700"
                  >
                    <Mail
                      className="size-5 shrink-0 text-bronze-600"
                      aria-hidden="true"
                    />
                    {email}
                  </a>
                  <p className="mt-3 flex items-center gap-3 text-sm text-ink-soft">
                    <MapPin
                      className="size-4 shrink-0 text-bronze-600"
                      aria-hidden="true"
                    />
                    {location}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                    Expect a personal reply within two business days — usually
                    sooner.
                  </p>
                </div>
              </Reveal>

              {/* WhatsApp CTA — live once a number is configured */}
              <Reveal delay={80}>
                <div
                  className={
                    whatsappConnected
                      ? "rounded-2xl border border-line bg-card p-7 shadow-rest sm:p-8"
                      : "rounded-2xl border border-dashed border-bronze-300 bg-bronze-50/70 p-7 sm:p-8"
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-11 items-center justify-center rounded-full bg-[#25D366]/15 text-[#1a9e4b]"
                    >
                      <MessageCircle className="size-5" />
                    </span>
                    {whatsappConnected ? null : (
                      <span className="rounded-full border border-bronze-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-bronze-700">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 font-display text-xl font-medium text-ink">
                    {site.whatsapp.label}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {whatsappConnected
                      ? "Prefer chat? Message the studio directly on WhatsApp during business hours."
                      : site.whatsapp.note}
                  </p>
                  {whatsappConnected ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-105 hover:shadow-lift"
                    >
                      <MessageCircle className="size-4" aria-hidden="true" />
                      Chat on WhatsApp
                    </a>
                  ) : (
                    <a
                      href={whatsappHref}
                      aria-disabled="true"
                      onClick={(event) => event.preventDefault()}
                      className="mt-5 inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-bronze-300 px-5 py-2.5 text-sm font-medium text-bronze-700 opacity-70"
                    >
                      <MessageCircle className="size-4" aria-hidden="true" />
                      Chat on WhatsApp
                    </a>
                  )}
                </div>
              </Reveal>

              {/* Socials */}
              <Reveal delay={140}>
                <div className="rounded-2xl border border-line bg-card p-7 shadow-rest sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-bronze-700">
                    Elsewhere
                  </p>
                  <ul className="mt-4 space-y-3">
                    {socials.map((social) => {
                      const Icon = socialIcons[social.label] ?? Mail;
                      return (
                        <li key={social.label}>
                          <a
                            href={social.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-3 text-sm text-ink-soft transition-colors hover:text-bronze-700"
                          >
                            <span
                              aria-hidden="true"
                              className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-cream text-ink transition-colors group-hover:text-bronze-700"
                            >
                              <Icon className="size-4" />
                            </span>
                            {social.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>
            </div>

            {/* Right column — form + steps */}
            <div>
              <Reveal>
                <ContactForm />
              </Reveal>

              <Reveal delay={120} className="mt-10">
                <SectionHeading
                  eyebrow="What happens next"
                  title="Three small steps to a first session"
                />
                <ol className="mt-6 space-y-4">
                  {steps.map((step, index) => (
                    <li
                      key={step.title}
                      className="flex items-start gap-4 rounded-xl border border-line bg-card p-5 shadow-rest"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-bronze-100 text-bronze-700"
                      >
                        <step.icon className="size-4.5" />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-medium text-ink">
                          <span className="mr-2 text-sm font-medium tracking-widest text-ink-muted">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
