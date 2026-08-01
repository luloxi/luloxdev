"use client";

import Link from "next/link";
import { sections, type SectionId } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

/** Theme-aware via CSS vars (see globals.css light/dark section tokens) */
const accents: Record<SectionId, string> = {
  about: "var(--section-about)",
  projects: "var(--section-projects)",
  blog: "var(--section-blog)",
  tastes: "var(--section-tastes)",
  contact: "var(--section-contact)",
};

/**
 * Cyberpunk-loading-menu style section grid.
 * Half-width angular tiles for every section (including tastes & contact).
 */
export function SectionNav() {
  const { t } = useLocale();

  return (
    <nav aria-label="Sections" className="cp-nav">
      {sections.map((s) => {
        const accent = accents[s.id];
        const label = t.sections[s.id];
        return (
          <Link
            key={s.href}
            href={s.href}
            className="cp-nav-item group"
            style={{ ["--cp-accent" as string]: accent }}
          >
            <span className="cp-nav-frame" aria-hidden>
              <span className="cp-nav-corner cp-nav-corner-tl" />
              <span className="cp-nav-corner cp-nav-corner-br" />
              <span className="cp-nav-scan" />
            </span>

            <span className="cp-nav-label">{label}</span>

            <span className="cp-nav-bar" aria-hidden />
            <span className="cp-nav-chevron" aria-hidden>
              ▸
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
