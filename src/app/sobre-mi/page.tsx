import { headers } from "next/headers";
import { AboutView } from "@/components/views/about-view";
import { isAdminRequest } from "@/lib/admin-request";
import { editModeFromCookie } from "@/lib/edit-mode";
import { publicationsFor } from "@/lib/publications";
import { getPublications } from "@/lib/publications-db";

// Rendered per request: publications saved by the admin show up on the next load.
export const dynamic = "force-dynamic";

/** /sobre-mi (/en/about). Hidden publications only reach the admin with edit mode on. */
export default async function AboutPage() {
  const cookie = (await headers()).get("cookie");
  const adminEditing = editModeFromCookie(cookie) && (await isAdminRequest());
  const publications = publicationsFor(await getPublications(), adminEditing);
  return <AboutView publications={publications} />;
}
