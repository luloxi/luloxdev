"use client";

import Link from "next/link";
import { CpRow } from "@/components/cp-row";
import { GitHubIcon } from "@/components/icons/social";
import { pastProjects } from "@/content/projects";
import { github } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

const pastAccents = [
  "var(--section-contact)",
  "var(--section-blog)",
  "var(--section-projects)",
];

export function ProjectsAccordion() {
  const { t } = useLocale();
  return (
    <div className="space-y-10">
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
