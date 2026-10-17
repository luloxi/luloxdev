"use client";

import { CopyMarkdown } from "@/components/copy-markdown";
import { CpRow } from "@/components/cp-row";
import { GitHubIcon } from "@/components/icons/social";
import { PageShell } from "@/components/page-shell";
import type { PastProject, ProjectStatus } from "@/content/projects";
import { useLocale } from "@/i18n/locale-provider";
import { useEditMode } from "@/components/admin-context";
import { ProjectText } from "@/components/project-text";
import { ProjectDetailsEdit } from "@/components/project-details-edit";

const statusClass: Record<ProjectStatus, string> = {
  live: "project-status-live",
  disabled: "project-status-disabled",
  archive: "project-status-archive",
};

/** Project detail, rendered on the server with D1 overrides already merged. */
export function ProjectDetail({ project }: { project: PastProject }) {
  const { t, locale } = useLocale();
  const editOn = useEditMode();

  const copy = project.copy[locale] ?? project.copy.es;
  const statusLabel =
    project.status === "live"
      ? t.projects.statusLive
      : project.status === "disabled"
        ? t.projects.statusDisabled
        : t.projects.statusArchive;

  return (
    <PageShell
      title={copy.title}
      backHref="/proyectos"
      backLabel={t.projects.backToProjects}
      footerHref="/proyectos"
      footerLabel={t.projects.backToProjectsCta}
    >
      <div className="space-y-6">
        <div
          className="cp-panel project-detail-hero"
          style={{ ["--cp-accent" as string]: "var(--section-projects)" }}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner flex items-center gap-4 sm:gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.icon}
              alt=""
              width={88}
              height={88}
              className="project-detail-icon shrink-0"
            />
            <div className="min-w-0">
              <p className="cp-headline text-[1.05rem] sm:text-[1.2rem]">
                {copy.title}
              </p>
              {editOn ? (
                <ProjectText project={project} field="body" className="mt-1.5" pClass="cp-prose text-[0.9rem]" />
              ) : (
                <CopyMarkdown text={copy.body} className="mt-1.5" pClass="cp-prose text-[0.9rem]" />
              )}
              <span
                className={`project-status-pill mt-3 ${statusClass[project.status]}`}
              >
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        <div
          className="cp-panel"
          style={{ ["--cp-accent" as string]: "var(--section-about)" }}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner space-y-3">
            {editOn ? (
              <ProjectText project={project} field="paragraphs" />
            ) : (
              copy.paragraphs.map((p) => <CopyMarkdown key={p.slice(0, 48)} text={p} />)
            )}
          </div>
        </div>

        {editOn ? (
          <ProjectDetailsEdit project={project} />
        ) : (
        <dl className="project-meta">
          <div className="project-meta-row">
            <dt>{t.projects.metaTeam}</dt>
            <dd className="project-team">
              {project.team.map((member, i) => (
                <span key={member.name} className="project-team-item">
                  {i > 0 ? <span className="project-team-sep">·</span> : null}
                  {member.href ? (
                    <a
                      href={member.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-prose-link"
                    >
                      {member.name}
                    </a>
                  ) : (
                    member.name
                  )}
                </span>
              ))}
            </dd>
          </div>
          <div className="project-meta-row">
            <dt>{t.projects.metaAwards}</dt>
            <dd>{copy.awards || t.projects.noAwards}</dd>
          </div>
          <div className="project-meta-row">
            <dt>{t.projects.metaStatus}</dt>
            <dd>
              <span className={`project-status-pill ${statusClass[project.status]}`}>
                {statusLabel}
              </span>
            </dd>
          </div>
          {project.status === "disabled" && project.disabledReason ? (
            <div className="project-meta-row">
              <dt>{t.projects.metaDisabledReason}</dt>
              <dd className="cp-prose text-[0.9rem]">
                {locale === "en"
                  ? project.disabledReason.en
                  : project.disabledReason.es}
              </dd>
            </div>
          ) : null}
        </dl>
        )}

        <div className="!mt-4 space-y-2 sm:!mt-6">
          {project.liveUrl ? (
            <CpRow
              href={project.liveUrl}
              label={t.projects.openLive}
              accent="var(--section-projects)"
            />
          ) : null}
          <CpRow
            href={project.github}
            label={t.projects.openGithub}
            accent="var(--foreground)"
            Icon={GitHubIcon}
            iconClass="text-foreground"
          />
        </div>
      </div>
    </PageShell>
  );
}
