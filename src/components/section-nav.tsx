"use client";

import Link from "next/link";
import { sections, type SectionId } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

const accents: Record<SectionId, string> = {
  about: "#a78bfa",
  projects: "#38bdf8",
  blog: "#fbbf24",
  tastes: "#fb7185",
  contact: "#fb923c",
};

/** Minimal angled glass links - color accent, no side dots */
export function SectionNav() {
  const { t } = useLocale();

  return (
    <nav
      aria-label="Sections"
      className="flex w-full flex-col gap-2 sm:gap-2.5"
    >
      {sections.map((s) => {
        const accent = accents[s.id];
        const label = t.sections[s.id];
        return (
          <Link
            key={s.href}
            href={s.href}
            className="future-nav-item group flex h-12 items-center px-5 sm:h-14 sm:px-6"
            style={{ ["--fn-accent" as string]: accent }}
          >
            <span className="font-display flex-1 text-left text-sm font-medium tracking-[0.08em] sm:text-[15px]">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
