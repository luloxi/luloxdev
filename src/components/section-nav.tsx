"use client";

import Link from "next/link";
import {
  FolderKanban,
  Heart,
  Mail,
  PenLine,
  User,
} from "lucide-react";
import { sections } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

const icons = {
  user: User,
  folder: FolderKanban,
  pen: PenLine,
  heart: Heart,
  mail: Mail,
} as const;

/** Compact elegant buttons - never stretch to fill the viewport */
export function SectionNav() {
  const { t } = useLocale();

  return (
    <nav
      aria-label="Sections"
      className="flex w-full flex-col gap-1.5 sm:gap-2"
    >
      {sections.map((s) => {
        const Icon = icons[s.icon];
        const label = t.sections[s.id];
        return (
          <Link
            key={s.href}
            href={s.href}
            className="neon-panel group flex h-11 items-center gap-3 rounded-2xl px-4 transition-all duration-300 active:scale-[0.99] sm:h-12"
          >
            <span className="neon-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-accent transition-colors group-hover:text-accent-2 sm:h-8 sm:w-8 sm:rounded-xl">
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
            </span>
            <span className="flex-1 text-left text-sm font-medium tracking-tight">
              {label}
            </span>
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent opacity-50 shadow-[0_0_8px_var(--glow-violet)] transition-opacity group-hover:opacity-100 group-hover:bg-accent-2 group-hover:shadow-[0_0_10px_var(--glow-orange)]"
            />
          </Link>
        );
      })}
    </nav>
  );
}
