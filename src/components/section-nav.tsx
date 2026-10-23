"use client";

import Link from "next/link";
import { sections, type SectionId } from "@/content/site";
import { HireButton } from "@/components/hire-button";
import { useLocale } from "@/i18n/locale-provider";
import { useSiteOrder } from "@/components/site-order-context";
import { visibleItems } from "@/lib/site-sections";

/** Theme-aware via CSS vars (see globals.css light/dark section tokens) */
const accents: Record<SectionId, string> = {
  about: "var(--section-about)",
  projects: "var(--section-projects)",
  blog: "var(--section-blog)",
  tastes: "var(--section-tastes)",
  contact: "var(--section-contact)",
  hire: "var(--section-hire)",
};

/**
 * Cyberpunk-loading-menu style section grid.
 * Half-width angular tiles for every section (including tastes & contact).
 */
export function SectionNav() {
  const { t, href } = useLocale();
  const order = useSiteOrder();
  // Admin strip order; hidden sections only show (flagged) while the admin edits.
  const list = order.sections.length
    ? visibleItems(order.sections, order.showHidden).flatMap((o) => {
        const s = sections.find((x) => x.id === o.key);
        return s ? [{ ...s, hidden: !o.visible }] : [];
      })
    : sections.map((s) => ({ ...s, hidden: false }));

  return (
    <nav aria-label="Sections" className="cp-nav">
      {list.map((s) => {
        if (s.id === "hire") return <HireButton key={s.href} className={`cp-nav-hire${s.hidden ? " is-section-hidden" : ""}`} />;
        const accent = accents[s.id];
        const label = t.sections[s.id];
        return (
          <Link
            key={s.href}
            href={href(s.href)}
            className={`cp-nav-item group${s.hidden ? " is-section-hidden" : ""}`}
            data-section={s.id}
            data-hidden={s.hidden ? "true" : undefined}
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
