"use client";

import type { ComponentType } from "react";
import { CpRow } from "@/components/cp-row";
import {
  LastFmIcon,
  LetterboxdBrandIcon,
  SpotifyIcon,
} from "@/components/icons/social";
import { PageShell } from "@/components/page-shell";
import { tasteLinks } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

const platforms = [
  {
    id: "letterboxd" as const,
    label: "Letterboxd",
    href: tasteLinks.letterboxd,
    Icon: LetterboxdBrandIcon,
    iconClass: undefined as string | undefined,
    accent: "#ff8000",
  },
  {
    id: "lastfm" as const,
    label: "Last.fm",
    href: tasteLinks.lastfm,
    Icon: LastFmIcon,
    iconClass: "text-[#D51007]",
    accent: "#D51007",
  },
  {
    id: "spotify" as const,
    label: "Spotify",
    href: tasteLinks.spotify,
    Icon: SpotifyIcon,
    iconClass: "text-[#1DB954]",
    accent: "#1DB954",
  },
];

export default function TastesPage() {
  const { t } = useLocale();
  const tastes = t.tastes;

  return (
    <PageShell title={tastes.title}>
      <section className="cp-list">
        {platforms.map((p, i) => (
          <CpRow
            key={p.id}
            href={p.href}
            code={String(i + 1).padStart(2, "0")}
            label={p.label}
            detail={tastes.platforms[p.id]}
            accent={p.accent}
            Icon={p.Icon as ComponentType<{ className?: string }>}
            iconClass={p.iconClass}
          />
        ))}
      </section>
    </PageShell>
  );
}
