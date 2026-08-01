"use client";

import type { ComponentType } from "react";
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
        <div className="cp-panel" style={{ ["--cp-accent" as string]: "var(--section-about)" }}>
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner space-y-4">
            <p className="cp-headline">{about.headline}</p>
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="cp-prose">
                {p}
              </p>
            ))}
          </div>
        </div>

        <section>
          <h2 className="cp-heading">
            <span className="cp-heading-code">01</span>
            <span className="cp-heading-slash">//</span>
            <span>{t.ui.experience}</span>
          </h2>

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
                  <div className="cp-panel-inner flex gap-4">
                    {logo ? (
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center self-start overflow-hidden sm:h-12 sm:w-12">
                        {logo.type === "image" ? (
                          <Image
                            src={logo.src}
                            alt={logo.alt}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <logo.Icon className="h-8 w-8 text-foreground sm:h-9 sm:w-9" />
                        )}
                      </span>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="cp-nav-meta">
                        <span className="cp-nav-code">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="cp-nav-slash">//</span>
                        <span>{item.period}</span>
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
              code={String(about.timeline.length + 1).padStart(2, "0")}
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
