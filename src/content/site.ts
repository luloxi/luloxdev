/**
 * Site identity, section routes, socials.
 * Socials synced from https://linktr.ee/lulox
 * Labels come from i18n messages.
 */

export const site = {
  name: "Lulox",
  tagline: "I make stuff with AI and blockchain",
  /** Share / SEO description (same idea as blog author bio) */
  description:
    "Soy Luciano Oliva Bianco (Lulox). Hago research y builds en AI, blockchain, tokenización y comercio agéntico.",
  ens: "lulox.eth",
  avatar: "/avatar.jpg",
  /** Landing (home) hero photo. Share/OG images keep using `avatar`. */
  heroPhoto: "/avatar-hero.jpg",
  /** Used for absolute OG/Twitter URLs when env is missing */
  url: "https://lulox.com.ar",
  xHandle: "@LuloxDev",
} as const;

export type SectionId =
  | "about"
  | "projects"
  | "blog"
  | "tastes"
  | "contact"
  | "hire";

/** Main sections - stacked Linktree-style buttons */
export const sections = [
  { id: "hire" as const, href: "/contratar" },
  { id: "blog" as const, href: "/blog" },
  { id: "about" as const, href: "/sobre-mi" },
  { id: "projects" as const, href: "/proyectos" },
  { id: "contact" as const, href: "/contacto" },
];


export const socials = [
  { id: "x", label: "X", href: "https://x.com/LuloxDev" },
  { id: "instagram", label: "Instagram", href: "https://instagram.com/lulo.bianco" },
  { id: "telegram", label: "Telegram", href: "https://t.me/lulox" },
  { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com/in/lulox" },
  { id: "github", label: "GitHub", href: "https://www.github.com/luloxi" },
] as const;

/** Contact page (GitHub lives under Projects) */
export const contactSocials = socials.filter((s) => s.id !== "github");

export const github = {
  label: "GitHub",
  href: "https://www.github.com/luloxi",
  handle: "github.com/luloxi",
} as const;

export const tasteLinks = {
  spotify: "https://open.spotify.com/user/11133679849/playlists",
  letterboxd: "https://letterboxd.com/lulox/",
  lastfm: "https://www.last.fm/user/fockenkitten",
} as const;



/** Google Calendar appointment page for booking a video call (replaces the old contact form). */
export const CALL_BOOKING_URL =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1jSxgl0-oPfAWoQnH03B_5FFL1sVYkEgZqB0vcekH6lY1OmDl5lQ-BUuMCXjJa-ihuiqDXTjwl";
