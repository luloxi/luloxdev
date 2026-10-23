import type { Metadata } from "next";
import { pastProjects } from "@/content/projects";
import { messages } from "@/i18n/messages";
import { buildPageMetadata, pageMetadata } from "@/lib/page-metadata";
import { getServerPrefs } from "@/lib/prefs";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = pastProjects.find((p) => p.id === id);
  if (!project) {
    return pageMetadata("/proyectos", {
      es: { title: "Proyectos", description: messages.es.sections.projects },
      en: { title: "Projects", description: messages.en.sections.projects },
    });
  }
  const { locale } = await getServerPrefs();
  const m = messages[locale].projects.past[project.id];
  return buildPageMetadata(locale, `/proyectos/${project.id}`, {
    title: m.title,
    description: m.body,
  });
}

export default function ProjectDetailLayout({ children }: Props) {
  return children;
}
