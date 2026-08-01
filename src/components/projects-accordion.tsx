"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink } from "lucide-react";
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
};

const pastAccents = [
  "var(--section-contact)",
  "var(--section-blog)",
  "var(--section-projects)",
];

export function ProjectsAccordion() {
  const { t } = useLocale();
  const [open, setOpen] = useState<FocusTopicId | null>(null);

  function toggle(id: FocusTopicId) {
    setOpen((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="cp-heading">{t.projects.focusHeading}</h2>
        <ul className="cp-list">
          {focusTopics.map((topic) => {
            const copy = t.projects.focus[topic.id];
            const isOpen = open === topic.id;
            const accent = focusAccents[topic.id];
            return (
              <li
                key={topic.id}
                className="cp-accordion group"
                style={{ ["--cp-accent" as string]: accent }}
                data-open={isOpen ? "true" : undefined}
              >
                <span className="cp-nav-frame" aria-hidden>
                  <span className="cp-nav-corner cp-nav-corner-tl" />
                  <span className="cp-nav-corner cp-nav-corner-br" />
                  <span className="cp-nav-scan" />
                </span>

                <button
                  type="button"
                  onClick={() => toggle(topic.id)}
                  aria-expanded={isOpen}
                  className="cp-accordion-trigger"
                >
                  <div className="cp-accordion-head">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={topic.icon}
                      alt=""
                      width={40}
                      height={40}
                      className="focus-topic-icon shrink-0"
                    />

                    <span className="cp-row-body min-w-0">
                      <span className="cp-row-label">{copy.title}</span>
                      <span className="cp-row-detail">{copy.summary}</span>
                    </span>

                    <ChevronDown
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0 text-[color:var(--cp-accent)] transition-transform duration-300",
                        isOpen && "rotate-180",
                      )}
                      strokeWidth={1.75}
                    />
                  </div>
                </button>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="cp-accordion-body mt-3 border-t border-[color:color-mix(in_oklab,var(--cp-accent)_28%,transparent)] pt-3">
                      <p className="cp-prose text-[0.9rem]">{copy.body}</p>
                      {topic.links.length > 0 ? (
                        <ul className="focus-links">
                          {topic.links.map((link) => (
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
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="cp-heading">{t.projects.githubHeading}</h2>
        <a
          href={github.href}
          target="_blank"
          rel="noopener noreferrer"
          className="github-card group"
        >
          <span className="github-card-grid" aria-hidden />
          <span className="github-card-glow" aria-hidden />

          <span className="github-card-icon" aria-hidden>
            <GitHubIcon className="h-9 w-9 sm:h-10 sm:w-10" />
          </span>

          <span className="github-card-body">
            <span className="github-card-title-row">
              <span className="github-card-title">{t.projects.githubTitle}</span>
              <span className="github-card-kicker">{github.handle}</span>
            </span>
            <span className="github-card-blurb">{t.projects.githubBlurb}</span>
          </span>

          <span className="github-card-go" aria-hidden>
            <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
          </span>
        </a>
      </section>

      <section>
        <h2 className="cp-heading">{t.projects.pastHeading}</h2>
        <ul className="cp-list">
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
