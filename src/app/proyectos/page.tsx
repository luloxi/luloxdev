import { ProjectsView } from "@/components/views/projects-view";
import { getMergedPastProjects } from "@/lib/projects";
import { canSeeDraftsRequest } from "@/lib/admin-request";
import { orderRecords } from "@/lib/site-sections";
import { getSiteOrder } from "@/lib/site-order";

export const dynamic = "force-dynamic";

/** Same source as /proyectos/<id>: static projects merged with D1 overrides. */
export default async function ProjectsPage() {
  const [all, order, admin] = await Promise.all([getMergedPastProjects(), getSiteOrder(), canSeeDraftsRequest()]);
  // Hidden projects never reach a visitor's HTML; the admin in edit mode gets them (flagged).
  return <ProjectsView projects={orderRecords(all, order.projects, admin)} />;
}
