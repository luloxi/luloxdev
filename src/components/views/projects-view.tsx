"use client";

import { PageShell } from "@/components/page-shell";
import { ProjectsAccordion } from "@/components/projects-accordion";
import type { PastProject } from "@/content/projects";
import { useLocale } from "@/i18n/locale-provider";

export function ProjectsView({ projects }: { projects: PastProject[] }) {
  const { t } = useLocale();
  return (
    <PageShell title={t.projects.title}>
      <ProjectsAccordion projects={projects} />
    </PageShell>
  );
}
