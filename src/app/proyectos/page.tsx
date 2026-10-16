import { ProjectsView } from "@/components/views/projects-view";
import { getMergedPastProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

/** Same source as /proyectos/<id>: static projects merged with D1 overrides. */
export default async function ProjectsPage() {
  const projects = await getMergedPastProjects();
  return <ProjectsView projects={projects} />;
}
