"use client";

import { PageShell } from "@/components/page-shell";
import { ProjectsAccordion } from "@/components/projects-accordion";
import { useLocale } from "@/i18n/locale-provider";

export default function ProjectsPage() {
  const { t } = useLocale();

  return (
    <PageShell title={t.projects.title}>
      <ProjectsAccordion />
    </PageShell>
  );
}
