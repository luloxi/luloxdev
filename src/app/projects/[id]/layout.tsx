import type { Metadata } from "next";
import { pastProjects } from "@/content/projects";
import { messages } from "@/i18n/messages";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = pastProjects.find((p) => p.id === id);
  if (!project) {
    return { title: "Proyectos" };
  }
  const title = messages.es.projects.past[project.id].title;
  const description = messages.es.projects.past[project.id].body;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default function ProjectDetailLayout({ children }: Props) {
  return children;
}
