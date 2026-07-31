"use client";

import Link from "next/link";
import {
  BookOpenText,
  Boxes,
  CircleUserRound,
  Mail,
  Music2,
  type LucideIcon,
} from "lucide-react";
import { sections, type SectionId } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

const sectionVisual: Record<
  SectionId,
  { Icon: LucideIcon; accent: string; code: string; signal: string }
> = {
  about: {
    Icon: CircleUserRound,
    accent: "#a78bfa",
    code: "01",
    signal: "ID",
  },
  projects: {
    Icon: Boxes,
    accent: "#38bdf8",
    code: "02",
    signal: "BUILD",
  },
  blog: {
    Icon: BookOpenText,
    accent: "#fbbf24",
    code: "03",
    signal: "LOG",
  },
  tastes: {
    Icon: Music2,
    accent: "#fb7185",
    code: "04",
    signal: "SIGNAL",
  },
  contact: {
    Icon: Mail,
    accent: "#fb923c",
    code: "05",
    signal: "LINK",
  },
};

/** Future-HUD section links — angled glass, color rail, index codes */
export function SectionNav() {
  const { t } = useLocale();

  return (
    <nav
      aria-label="Sections"
      className="flex w-full flex-col gap-2 sm:gap-2.5"
    >
      {sections.map((s) => {
        const { Icon, accent, code, signal } = sectionVisual[s.id];
        const label = t.sections[s.id];
        return (
          <Link
            key={s.href}
            href={s.href}
            className="future-nav-item group flex h-12 items-center gap-3.5 pl-5 pr-4 sm:h-14 sm:gap-4 sm:pl-6 sm:pr-5"
            style={{ ["--fn-accent" as string]: accent }}
          >
            <span className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
              <span
                className="font-mono text-[10px] tracking-[0.18em] tabular-nums opacity-60 sm:text-[11px]"
                style={{ color: accent }}
              >
                {code}
              </span>

              <Icon
                className="h-6 w-6 shrink-0 sm:h-7 sm:w-7"
                style={{ color: accent }}
                strokeWidth={1.5}
                aria-hidden
              />

              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[15px] font-medium tracking-tight sm:text-base">
                  {label}
                </span>
                <span
                  className="mt-0.5 hidden font-mono text-[9px] tracking-[0.22em] uppercase opacity-50 sm:block"
                  style={{ color: accent }}
                >
                  {signal}
                </span>
              </span>
            </span>

            <span className="future-nav-chevron shrink-0" aria-hidden />
          </Link>
        );
      })}
    </nav>
  );
}
