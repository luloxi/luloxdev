"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CpRow } from "@/components/cp-row";
import { GitHubIcon } from "@/components/icons/social";
import {
  focusTopics,
  pastProjects,
  type FocusTopicId,
} from "@/content/projects";
import { github } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

const focusAccents: Record<FocusTopicId, string> = {
  tokenization: "var(--section-projects)",
  midnight: "var(--section-about)",
  hermes: "var(--section-tastes)",
  lcp: "var(--section-blog)",
  x402: "var(--section-contact)",
  erc8004: "var(--section-projects)",
};

const pastAccents = [
  "var(--section-contact)",
  "var(--section-blog)",
  "var(--section-projects)",
];

export function ProjectsAccordion() {
  const { t } = useLocale();
  const [selected, setSelected] = useState<FocusTopicId>(focusTopics[0].id);

  const activeTopic = focusTopics.find((topic) => topic.id === selected)!;
  const activeCopy = t.projects.focus[selected];
  const activeAccent = focusAccents[selected];

  return (
    <div className="space-y-10">
      {/* Research: prominent blog CTA + compact topic chips + shared description */}
      <section>
        <h2 className="cp-heading">{t.projects.focusHeading}</h2>
        <CpRow
          href="/blog"
          label={t.sections.blog}
          accent="var(--section-blog)"
          external={false}
          className="projects-blog-cta"
        />

        <div className="focus-topic-grid mt-4">
          {focusTopics.map((topic) => {
            const copy = t.projects.focus[topic.id];
            const accent = focusAccents[topic.id];
            const isActive = selected === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelected(topic.id)}
                aria-pressed={isActive}
                className={cn(
                  "focus-topic-chip group",
                  isActive && "focus-topic-chip-active",
                )}
                style={{ ["--cp-accent" as string]: accent }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={topic.icon}
                  alt=""
                  width={28}
                  height={28}
                  className="focus-topic-chip-icon"
                />
                <span className="focus-topic-chip-title">{copy.title}</span>
              </button>
            );
          })}
        </div>

        <div
          className="focus-topic-panel cp-panel mt-3"
          style={{ ["--cp-accent" as string]: activeAccent }}
          key={selected}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner space-y-3">
            <p className="cp-row-label text-[0.9rem]">{activeCopy.title}</p>
            <p className="cp-prose text-[0.9rem]">{activeCopy.body}</p>
            {activeTopic.links.length > 0 ? (
              <ul className="focus-links">
                {activeTopic.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-link"
                    >
                      <span>{link.label}</span>
                      <ExternalLink
                        className="h-3 w-3 shrink-0 opacity-70"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </section>

      {/* Code: GitHub CTA + past projects underneath */}
      <section>
        <h2 className="cp-heading">{t.projects.githubHeading}</h2>
        <CpRow
          href={github.href}
          label={github.handle}
          accent="var(--foreground)"
          Icon={GitHubIcon}
          iconClass="text-foreground"
          iconSize="lg"
        />
        <ul className="cp-list mt-3">
          {pastProjects.map((project, i) => {
            const copy = t.projects.past[project.id];
            const accent = pastAccents[i % pastAccents.length];
            return (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="cp-row group"
                  style={{ ["--cp-accent" as string]: accent }}
                >
                  <span className="cp-nav-frame" aria-hidden>
                    <span className="cp-nav-corner cp-nav-corner-tl" />
                    <span className="cp-nav-corner cp-nav-corner-br" />
                    <span className="cp-nav-scan" />
                  </span>

                  {project.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.icon}
                      alt=""
                      width={72}
                      height={72}
                      className="cp-row-icon project-icon shrink-0"
                    />
                  ) : null}

                  <span className="cp-row-body min-w-0">
                    <span className="cp-row-label">{copy.title}</span>
                    <span className="cp-row-detail">{copy.body}</span>
                  </span>

                  <span className="cp-nav-chevron cp-row-chevron" aria-hidden>
                    ▸
                  </span>
                  <span className="cp-nav-bar cp-row-bar" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
