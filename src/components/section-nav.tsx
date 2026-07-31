"use client";

import Link from "next/link";
import { sections, type SectionId } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

const accents: Record<SectionId, string> = {
  about: "#a78bfa",
  projects: "#38bdf8",
  blog: "#fbbf24",
  tastes: "#fb7185",
  contact: "#fb923c",
};

/**
 * Compact 2-col mosaic: four small tiles + full-width contact pill.
 * Less empty space, more intentional layout.
 */
export function SectionNav() {
  const { t } = useLocale();

  const main = sections.filter((s) => s.id !== "contact");
  const contact = sections.find((s) => s.id === "contact");

  return (
    <nav aria-label="Sections" className="flex w-full flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        {main.map((s) => {
          const accent = accents[s.id];
          const label = t.sections[s.id];
          return (
            <Link
              key={s.href}
              href={s.href}
              className="future-nav-tile group flex min-h-[3.25rem] items-center justify-center px-3 py-3 text-center sm:min-h-[3.5rem] sm:px-4"
              style={{ ["--fn-accent" as string]: accent }}
            >
              <span
                className={cn(
                  "font-display text-[12px] font-medium leading-tight tracking-[0.12em] uppercase sm:text-[13px]",
                  "transition-colors duration-200",
                )}
                style={{ color: accent }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      {contact ? (
        <Link
          href={contact.href}
          className="future-nav-tile future-nav-tile-wide group flex min-h-11 items-center justify-center px-5 py-2.5 sm:min-h-12"
          style={{ ["--fn-accent" as string]: accents.contact }}
        >
          <span
            className="font-display text-[12px] font-medium tracking-[0.16em] uppercase sm:text-[13px]"
            style={{ color: accents.contact }}
          >
            {t.sections.contact}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
