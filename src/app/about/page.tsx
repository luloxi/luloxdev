"use client";

import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import { CpRow } from "@/components/cp-row";
import { BuidlGuidlIcon } from "@/components/icons/brands";
import { LinkedInIcon } from "@/components/icons/social";
import { PageShell } from "@/components/page-shell";
import { socials } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

const linkedInHref =
  socials.find((s) => s.id === "linkedin")?.href ??
  "https://linkedin.com/in/lulox";

/** Named terms in bio → official pages */
const aboutLinks: Record<string, string> = {
  n8n: "https://n8n.io",
  Midnight: "https://midnight.network",
  IOG: "https://www.iog.io",
  Bitcoin: "https://bitcoin.org",
  Grok: "https://grok.com",
};

const aboutLinkPattern = /(n8n|Midnight|IOG|Bitcoin|Grok)/g;

function linkifyAbout(text: string): ReactNode[] {
  const parts = text.split(aboutLinkPattern);
  return parts.map((part, i) => {
    const href = aboutLinks[part];
    if (!href) return part;
    return (
      <a
        key={`${part}-${i}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="cp-prose-link"
      >
        {part}
      </a>
    );
  });
}

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
            <p className="cp-headline">{about.headline}</p>
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="cp-prose">
                {linkifyAbout(p)}
              </p>
            ))}
          </div>
        </div>

        <section>
          <h2 className="cp-heading">{t.ui.experience}</h2>

          <ul className="cp-list">
            {about.timeline.map((item, i) => {
              const logo = orgLogos[item.org];
              const accent = timelineAccents[i % timelineAccents.length];
              return (
                <li
                  key={item.title + item.org}
                  className="cp-panel"
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
                      <p className="font-mono text-[11px] text-[color:var(--cp-accent)]">
                        {item.period}
                      </p>
                      <p className="cp-row-label mt-1.5 text-[0.9rem]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted">{item.org}</p>
                      <p className="cp-prose mt-2 text-[0.9rem]">
                        {item.description}
                      </p>
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
      </div>
    </PageShell>
  );
}
