import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/views/project-detail";
import { getMergedPastProject } from "@/lib/projects";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function PastProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await getMergedPastProject(id);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
