import type { Metadata } from "next";
import { pastProjects } from "@/content/projects";
import { messages } from "@/i18n/messages";
import { site } from "@/content/site";

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
  const ogImage = new URL(site.ogImage, site.url).href;
  return {
    title,
    description,
    alternates: { canonical: `/proyectos/${project.id}` },
    // Child openGraph/twitter replace the root ones, so repeat the share image.
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function ProjectDetailLayout({ children }: Props) {
  return children;
}
