"use client";

import { CopyMarkdown } from "@/components/copy-markdown";
import Link from "next/link";
import { CpRow } from "@/components/cp-row";
import { GitHubIcon } from "@/components/icons/social";
import type { PastProject } from "@/content/projects";
import { InflowPencil, requestCopyEdit, useIsAdmin } from "@/components/admin-context";
import { github } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

const pastAccents = [
  "var(--section-contact)",
  "var(--section-blog)",
  "var(--section-projects)",
];

export function ProjectsAccordion({ projects }: { projects: PastProject[] }) {
  const { t, locale } = useLocale();
  const admin = useIsAdmin();
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
          {projects.map((project, i) => {
            const copy = project.copy[locale] ?? project.copy.es;
            const accent = pastAccents[i % pastAccents.length];
            return (
              <li key={project.id} className="relative" data-copy-inflow="1">
                <Link
                  href={`/proyectos/${project.id}`}
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
                    <span className="cp-row-detail"><CopyMarkdown text={copy.body} inline pClass="" /></span>
                  </span>

                  <span className="cp-nav-chevron cp-row-chevron" aria-hidden>
                    ▸
                  </span>
                  <span className="cp-nav-bar cp-row-bar" aria-hidden />
                </Link>
                {admin ? (
                  <span className="ie-row-pencil">
                    <InflowPencil
                      label={`Edit ${project.id}`}
                      onClick={() => requestCopyEdit({ project: { id: project.id, field: "summary" } })}
                    />
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
