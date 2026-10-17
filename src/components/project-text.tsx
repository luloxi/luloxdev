"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { MdWysiwyg } from "@/components/md-wysiwyg";
import type { PastProject } from "@/content/projects";
import { useLocale } from "@/i18n/locale-provider";
import { COPY_CLASSES, prepCopyMarkdown } from "@/lib/md-editor-extensions";

/**
 * Edit mode: a project's summary or description edited in place. Saves only
 * the current locale through the admin-only /api/projects (rest unchanged).
 */
export function ProjectText({ project, field, className = "", pClass = "cp-prose" }: {
  project: PastProject;
  field: "body" | "paragraphs";
  className?: string;
  pClass?: string;
}) {
  const { locale } = useLocale();
  const router = useRouter();
  const L = (locale === "en" ? "en" : "es") as "es" | "en";
  const copy = project.copy[L] ?? project.copy.es;
  const source = field === "body" ? copy.body : copy.paragraphs.join("\n\n");
  const classes = useMemo(() => ({ ...COPY_CLASSES, p: pClass }), [pClass]);
  return (
    <MdWysiwyg
      markdown={prepCopyMarkdown(source)}
      classes={classes}
      className={`md-copy ${className}`.trim()}
      onSave={async (md) => {
        const res = await fetch("/api/projects");
        if (!res.ok) return res.status === 401 ? "session" : String(res.status);
        const { projects } = (await res.json()) as { projects: PastProject[] };
        const p = projects.find((x) => x.id === project.id);
        if (!p) return "not_found";
        const nextCopy = { es: { ...p.copy.es }, en: { ...p.copy.en } };
        if (field === "body") nextCopy[L] = { ...nextCopy[L], body: md.trim() };
        else nextCopy[L] = { ...nextCopy[L], paragraphs: md.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean) };
        const put = await fetch("/api/projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: p.id,
            status: p.status,
            liveUrl: p.liveUrl ?? "",
            github: p.github ?? "",
            team: p.team ?? [],
            disabledReason: { es: p.disabledReason?.es ?? "", en: p.disabledReason?.en ?? "" },
            copy: nextCopy,
          }),
        });
        if (!put.ok) return put.status === 401 ? "session" : String(put.status);
        router.refresh();
        return null;
      }}
    />
  );
}
