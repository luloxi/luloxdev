"use client";

import Link from "next/link";
import { sections, type SectionId } from "@/content/site";
import { HireButton } from "@/components/hire-button";
import { useLocale } from "@/i18n/locale-provider";
import { useSiteOrder } from "@/components/site-order-context";
import { visibleItems } from "@/lib/site-sections";
import { useSignedIn } from "@/components/admin-context";

/** Theme-aware via CSS vars (see globals.css light/dark section tokens) */
const accents: Record<SectionId, string> = {
  about: "var(--section-about)",
  projects: "var(--section-projects)",
  blog: "var(--section-blog)",
  tastes: "var(--section-tastes)",
  contact: "var(--section-contact)",
  hire: "var(--section-hire)",
  referrals: "var(--section-referrals)",
};

/**
 * Cyberpunk-loading-menu style section grid.
 * Half-width angular tiles for every section (including tastes & contact).
 */
export function SectionNav() {
  const { t, href } = useLocale();
  const order = useSiteOrder();
  const signedIn = useSignedIn();
  // Admin strip order; hidden sections only show (flagged) while the admin edits.
  const list = order.sections.length
    ? visibleItems(order.sections, order.showHidden).flatMap((o) => {
        const s = sections.find((x) => x.id === o.key);
        return s ? [{ ...s, hidden: !o.visible }] : [];
      })
    : sections.map((s) => ({ ...s, hidden: false }));
  // Referrals is only on the landing for signed-in users (Google, admin or not).
  const shown = list.filter((s) => s.id !== "referrals" || signedIn);
  // Hire spans the row; an odd number of half tiles stretches the last one so the grid closes.
  const halves = shown.filter((s) => s.id !== "hire");
  const wide = halves.length % 2 === 1 ? halves[halves.length - 1]?.id : null;

  return (
    <nav aria-label="Sections" className="cp-nav">
      {shown.map((s) => {
        if (s.id === "hire") return <HireButton key={s.href} className={`cp-nav-hire${s.hidden ? " is-section-hidden" : ""}`} />;
        const accent = accents[s.id];
        const label = t.sections[s.id];
        return (
          <Link
            key={s.href}
            href={href(s.href)}
            className={`cp-nav-item group${s.hidden ? " is-section-hidden" : ""}${s.id === wide ? " is-wide" : ""}`}
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
