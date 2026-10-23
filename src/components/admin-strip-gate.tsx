"use client";

import { useEditMode } from "@/components/admin-context";
import { AdminStrip } from "@/components/admin-strip";

/** The sections/projects strip exists only for the admin with edit mode ON. */
export function AdminStripGate({ projectLabels }: { projectLabels: Record<string, { es: string; en: string }> }) {
  return useEditMode() ? <AdminStrip projectLabels={projectLabels} /> : null;
}
