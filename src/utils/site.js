/**
 * Central site configuration — single source of truth for brand
 * identity, navigation, contact details and social presence.
 * Update here, not in components.
 */

export const site = {
  name: "Shayan Abroad Hub",
  tagline: "Personal Consulting & Knowledge Hub",
  description:
    "Insight-led guidance, editorial thinking and practical resources for ambitious people and brands.",
  email: "hello@shayanabroadhub.com",
  location: "Working with clients worldwide",
  /** Placeholder until real profiles are connected in a later phase. */
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com" },
    { label: "Instagram", href: "https://www.instagram.com" },
    { label: "X (Twitter)", href: "https://x.com" },
  ],
  /**
   * WhatsApp deep-link placeholder — replace the number with the real
   * business number when the contact phase goes live. Format: wa.me/<intl>.
   */
  whatsapp: {
    href: "https://wa.me/000000000000",
    label: "Chat on WhatsApp",
    note: "Number being connected — email is fastest meanwhile.",
  },
};

/** Primary navigation — order matches the brand spec. */
export const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Blogs", to: "/blogs" },
  { label: "Services", to: "/services" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
  { label: "Downloads", to: "/downloads" },
];
