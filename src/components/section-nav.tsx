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
import { cn } from "@/lib/utils";

const sectionVisual: Record<
  SectionId,
  { Icon: LucideIcon; color: string }
> = {
  about: {
    Icon: CircleUserRound,
    color: "text-violet-400",
  },
  projects: {
    Icon: Boxes,
    color: "text-sky-400",
  },
  blog: {
    Icon: BookOpenText,
    color: "text-amber-400",
  },
  tastes: {
    Icon: Music2,
    color: "text-rose-400",
  },
  contact: {
    Icon: Mail,
    color: "text-orange-400",
  },
};

/** Comfortable buttons - large colored icons, no icon box */
export function SectionNav() {
  const { t } = useLocale();

  return (
    <nav
      aria-label="Sections"
      className="flex w-full flex-col gap-2.5 sm:gap-3"
    >
      {sections.map((s) => {
        const { Icon, color } = sectionVisual[s.id];
        const label = t.sections[s.id];
        return (
          <Link
            key={s.href}
            href={s.href}
            className="neon-panel group flex h-14 items-center gap-4 rounded-2xl px-4 transition-all duration-300 active:scale-[0.99] sm:h-16 sm:gap-4 sm:px-5"
          >
            <Icon
              className={cn(
                "h-7 w-7 shrink-0 sm:h-8 sm:w-8",
                color,
                "transition-transform duration-300 group-hover:scale-105",
              )}
              strokeWidth={1.6}
              aria-hidden
            />
            <span className="flex-1 text-left text-[15px] font-medium tracking-tight sm:text-base">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
