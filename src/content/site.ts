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
  email: "lucianoolivabianco@gmail.com",
  /** Used for absolute OG/Twitter URLs when env is missing */
  url: "https://www.lulox.dev",
  xHandle: "@LuloxDev",
} as const;

export type SectionId =
  | "about"
  | "projects"
  | "blog"
  | "tastes"
  | "contact";

/** Main sections - stacked Linktree-style buttons */
export const sections = [
  { id: "about" as const, href: "/about" },
  { id: "projects" as const, href: "/projects" },
  { id: "blog" as const, href: "/blog" },
  { id: "tastes" as const, href: "/tastes" },
  { id: "contact" as const, href: "/contact" },
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


