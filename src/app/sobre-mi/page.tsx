"use client";

import type { ComponentType } from "react";
import Image from "next/image";
import { CpRow } from "@/components/cp-row";
import { BuidlGuidlIcon } from "@/components/icons/brands";
import {
  LastFmIcon,
  LetterboxdBrandIcon,
  LinkedInIcon,
  SpotifyIcon,
} from "@/components/icons/social";
import { PageShell } from "@/components/page-shell";
import { CopyMarkdown } from "@/components/copy-markdown";
import { CopyText } from "@/components/copy-text";
import { socials, tasteLinks } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

const linkedInHref =
  socials.find((s) => s.id === "linkedin")?.href ??
  "https://linkedin.com/in/lulox";

type OrgLogo =
  | { type: "icon"; Icon: ComponentType<{ className?: string }> }
  | { type: "image"; src: string; alt: string };

const orgLogos: Record<string, OrgLogo> = {
  "Input Output Global": {
    type: "image",
    src: "/orgs/input-output.jpg",
    alt: "Input Output Global",
  },
  BuidlGuidl: { type: "icon", Icon: BuidlGuidlIcon },
};

const timelineAccents = [
  "var(--section-about)",
  "var(--section-projects)",
];

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

export default function AboutPage() {
  const { t } = useLocale();
  const about = t.about;

  return (
    <PageShell title={about.title}>
      <div className="space-y-8">
        <div
          className="cp-panel"
          style={{ ["--cp-accent" as string]: "var(--section-about)" }}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner space-y-4">
            <CopyText as="p" className="cp-headline" copyKey="about.headline" value={about.headline} />
            <CopyMarkdown copyKey="about.body" text={about.body} sections />
          </div>
        </div>

        <section>
          <CopyText as="h2" className="cp-heading" copyKey="ui.experience" value={t.ui.experience} />

          <ul className="cp-list">
            {about.timeline.map((item, i) => {
              const logo = orgLogos[item.org];
              const accent = timelineAccents[i % timelineAccents.length];
              return (
                <li
                  key={item.title + item.org}
                  className="cp-panel tl-item"
                  style={{ ["--cp-accent" as string]: accent }}
                >
                  <span className="cp-nav-frame" aria-hidden>
                    <span className="cp-nav-corner cp-nav-corner-tl" />
                    <span className="cp-nav-corner cp-nav-corner-br" />
                  </span>
                  <div className="cp-panel-inner flex items-center gap-4 sm:gap-5">
                    {logo ? (
                      <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden sm:h-20 sm:w-20">
                        {logo.type === "image" ? (
                          <Image
                            src={logo.src}
                            alt={logo.alt}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <logo.Icon className="h-14 w-14 text-foreground sm:h-16 sm:w-16" />
                        )}
                      </span>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <CopyText as="p" className="font-mono text-[11px] text-[color:var(--cp-accent)]" copyKey={`about.timeline.${i}.period`} value={item.period} />
                      <CopyText as="p" className="cp-row-label mt-1.5 text-[0.9rem]" copyKey={`about.timeline.${i}.title`} value={item.title} />
                      <CopyText as="p" className="mt-0.5 text-sm text-muted" copyKey={`about.timeline.${i}.org`} value={item.org} />
                      <CopyMarkdown
                        copyKey={`about.timeline.${i}.description`}
                        text={item.description}
                        className="mt-2"
                        pClass="cp-prose text-[0.9rem]"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4">
            <CpRow
              href={linkedInHref}
              label={about.linkedInCta}
              accent="#0A66C2"
              Icon={LinkedInIcon}
              iconClass="text-[#0A66C2]"
            />
          </div>
        </section>

        <section>
          <h2 className="cp-heading">{t.tastes.title}</h2>
          <div className="cp-list">
            {platforms.map((p) => (
              <CpRow
                key={p.id}
                href={p.href}
                label={p.label}
                detail={t.tastes.platforms[p.id]}
                accent={p.accent}
                Icon={p.Icon as ComponentType<{ className?: string }>}
                iconClass={p.iconClass}
                iconSize="lg"
              />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
