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
import { useTimelineDraw } from "@/lib/use-timeline-draw";
import { splitSections } from "@/lib/md-sections";

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
  const tlRef = useTimelineDraw<HTMLDivElement>();
  const jobsBySection = mapJobsToSections(about.body, about.timeline);

  return (
    <PageShell title={about.title}>
      <div className="space-y-8">
        <div
          ref={tlRef}
          className="cp-panel tl-list about-story"
          style={{ ["--cp-accent" as string]: "var(--section-about)" }}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner space-y-4">
            <CopyText as="p" className="cp-headline" copyKey="about.headline" value={about.headline} />
            <CopyMarkdown
              copyKey="about.body"
              text={about.body}
              sections
              afterSection={(si) => {
                const jobs = jobsBySection.get(si);
                if (!jobs) return null;
                return jobs.map(({ item, i }) => <JobCard key={item.title + item.org} item={item} i={i} label={t.ui.experience} />);
              }}
            />
          </div>
        </div>

        <div>
          <CpRow
            href={linkedInHref}
            label={about.linkedInCta}
            accent="#0A66C2"
            Icon={LinkedInIcon}
            iconClass="text-[#0A66C2]"
          />
        </div>

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

type Job = { period: string; title: string; org: string; description: string };

/** Org name -> words that identify it in the story. */
const orgKeys: Record<string, string[]> = {
  "Input Output Global": ["input output", "iohk", "iog"],
  BuidlGuidl: ["buidlguidl", "scaffold-eth"],
};

/**
 * Weave each job into the story: it goes right after the first "## " section
 * that names the company (fallback: the section mentioning its start year,
 * then the last section). Jobs keep chronological order (oldest first).
 * `i` stays the stored index so inline edits hit the right entry.
 */
function mapJobsToSections(body: string, timeline: readonly Job[]) {
  const secs = splitSections(body.replace(/\r\n?/g, "\n")).sections.map((x) => `${x.title}\n${x.lines.join("\n")}`.toLowerCase());
  const out = new Map<number, { item: Job; i: number }[]>();
  if (secs.length === 0) return out;
  timeline
    .map((item, i) => ({ item, i }))
    .reverse()
    .forEach((job) => {
      const keys = orgKeys[job.item.org] ?? [job.item.org.toLowerCase()];
      let at = secs.findIndex((s) => keys.some((k) => new RegExp("\\b" + k + "\\b").test(s)));
      if (at < 0) {
        const year = job.item.period.match(/(19|20)\d\d/)?.[0];
        if (year) at = secs.findIndex((s) => s.includes(year));
      }
      if (at < 0) at = secs.length - 1;
      out.set(at, [...(out.get(at) ?? []), job]);
    });
  return out;
}

function JobCard({ item, i, label }: { item: Job; i: number; label: string }) {
  const logo = orgLogos[item.org];
  const accent = timelineAccents[i % timelineAccents.length];
  return (
    <aside className="job-card tl-item" style={{ ["--cp-accent" as string]: accent }} aria-label={`${label}: ${item.org}`}>
      {logo ? (
        <span className="tl-logo job-logo inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden sm:h-16 sm:w-16">
          {logo.type === "image" ? (
            <Image src={logo.src} alt={logo.alt} width={64} height={64} className="h-full w-full object-cover" />
          ) : (
            <logo.Icon className="h-12 w-12 text-foreground sm:h-14 sm:w-14" />
          )}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="job-meta">
          <span className="job-tag">{label}</span>
          <CopyText as="span" className="job-period" copyKey={`about.timeline.${i}.period`} value={item.period} />
        </div>
        <CopyText as="p" className="job-org" copyKey={`about.timeline.${i}.org`} value={item.org} />
        <CopyText as="p" className="job-role" copyKey={`about.timeline.${i}.title`} value={item.title} />
        <CopyMarkdown copyKey={`about.timeline.${i}.description`} text={item.description} className="mt-1.5" pClass="cp-prose text-[0.88rem]" />
      </div>
    </aside>
  );
}
