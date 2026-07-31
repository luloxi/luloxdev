"use client";

import type { ComponentType } from "react";
import {
  LastFmIcon,
  LetterboxdBrandIcon,
  SpotifyIcon,
} from "@/components/icons/social";
import { PageShell } from "@/components/page-shell";
import { tasteLinks } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

const platforms = [
  {
    id: "letterboxd" as const,
    label: "Letterboxd",
    href: tasteLinks.letterboxd,
    Icon: LetterboxdBrandIcon,
    iconClass: undefined as string | undefined,
  },
  {
    id: "lastfm" as const,
    label: "Last.fm",
    href: tasteLinks.lastfm,
    Icon: LastFmIcon,
    iconClass: "text-[#D51007]",
  },
  {
    id: "spotify" as const,
    label: "Spotify",
    href: tasteLinks.spotify,
    Icon: SpotifyIcon,
    iconClass: "text-[#1DB954]",
  },
];

export default function TastesPage() {
  const { t } = useLocale();

  return (
    <PageShell title={t.tastes.title}>
      <section className="space-y-3">
        {platforms.map((p) => (
          <PlatformCard
            key={p.id}
            href={p.href}
            label={p.label}
            blurb={t.tastes.platforms[p.id]}
            Icon={p.Icon}
            iconClass={p.iconClass}
          />
        ))}
      </section>
    </PageShell>
  );
}

function PlatformCard({
  href,
  label,
  blurb,
  Icon,
  iconClass,
}: {
  href: string;
  label: string;
  blurb: string;
  Icon: ComponentType<{ className?: string }>;
  iconClass?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="neon-panel group flex items-center gap-4 rounded-2xl px-4 py-4 sm:gap-5 sm:px-5 sm:py-5"
    >
      <span
        className={cn(
          "inline-flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12",
          iconClass,
        )}
      >
        <Icon className="h-9 w-9 sm:h-11 sm:w-11" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium tracking-tight group-hover:text-accent sm:text-base">
          {label}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-muted">
          {blurb}
        </span>
      </span>
    </a>
  );
}
