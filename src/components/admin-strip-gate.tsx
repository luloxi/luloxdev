"use client";

import { usePathname } from "next/navigation";
import { useEditMode } from "@/components/admin-context";
import { AdminStrip } from "@/components/admin-strip";

/** The sections/projects strip exists only on the landing (/ and /en), for the admin with edit mode ON. */
export function AdminStripGate({ projectLabels }: { projectLabels: Record<string, { es: string; en: string }> }) {
  const editMode = useEditMode();
  const path = usePathname();
  const onLanding = path === "/" || path === "/en" || path === "/en/";
  return editMode && onLanding ? <AdminStrip projectLabels={projectLabels} /> : null;
}
