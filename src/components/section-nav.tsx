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

/** Fixed-height elegant buttons that stay within the home viewport */
export function SectionNav() {
  const { t } = useLocale();

  return (
    <nav
      aria-label="Sections"
      className="flex w-full flex-col gap-2 sm:gap-2.5"
    >
      {sections.map((s) => {
        const { Icon, color } = sectionVisual[s.id];
        const label = t.sections[s.id];
        return (
          <Link
            key={s.href}
            href={s.href}
            className="neon-panel group flex h-12 items-center gap-3.5 rounded-2xl px-4 transition-all duration-300 active:scale-[0.99] sm:h-13 sm:px-5 md:h-14"
          >
            <Icon
              className={cn(
                "h-6 w-6 shrink-0 sm:h-7 sm:w-7",
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
