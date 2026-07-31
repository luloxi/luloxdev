"use client";

import type { ComponentType } from "react";
import {
  LastFmIcon,
  LetterboxdIcon,
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
    Icon: LetterboxdIcon,
  },
  {
    id: "lastfm" as const,
    label: "Last.fm",
    href: tasteLinks.lastfm,
    Icon: LastFmIcon,
  },
  {
    id: "spotify" as const,
    label: "Spotify",
    href: tasteLinks.spotify,
    Icon: SpotifyIcon,
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
}: {
  href: string;
  label: string;
  blurb: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="neon-panel group flex items-start gap-3.5 rounded-2xl px-4 py-4"
    >
      <span
        className={cn(
          "neon-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-accent transition-colors group-hover:text-accent-2",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-[15px] font-medium tracking-tight group-hover:text-accent">
            {label}
          </span>
          <span className="shrink-0 text-xs text-accent-2">↗</span>
        </span>
        <span className="mt-1.5 block text-sm leading-relaxed text-muted">
          {blurb}
        </span>
      </span>
    </a>
  );
}
