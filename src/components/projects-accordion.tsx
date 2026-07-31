"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import {
  focusTopics,
  pastProjects,
  type FocusTopicId,
} from "@/content/projects";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function ProjectsAccordion() {
  const { t } = useLocale();
  const [open, setOpen] = useState<FocusTopicId | null>(null);

  function toggle(id: FocusTopicId) {
    setOpen((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
          {t.projects.focusHeading}
        </h2>
        <ul className="space-y-2.5">
          {focusTopics.map((topic) => {
            const copy = t.projects.focus[topic.id];
            const isOpen = open === topic.id;
            return (
              <li key={topic.id}>
                <button
                  type="button"
                  onClick={() => toggle(topic.id)}
                  aria-expanded={isOpen}
                  className={cn(
                    "neon-panel w-full rounded-2xl px-4 py-4 text-left transition-all",
                    isOpen && "border-accent/45",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium tracking-tight">
                        {copy.title}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">
                        {copy.summary}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0 text-accent transition-transform duration-300",
                        isOpen && "rotate-180",
                      )}
                      strokeWidth={1.75}
                    />
                  </div>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-muted">
                        {copy.body}
                      </p>
                      <p className="mt-3 text-xs text-muted/80">
                        {topic.tags.join(" · ")}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
          {t.projects.pastHeading}
        </h2>
        <ul className="space-y-2.5">
          {pastProjects.map((project) => {
            const copy = t.projects.past[project.id];
            return (
              <li key={project.id}>
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neon-panel group block rounded-2xl px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-medium tracking-tight group-hover:text-accent">
                      {copy.title}
                    </h3>
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-2 opacity-70 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {copy.body}
                  </p>
                  <p className="mt-2 text-xs text-muted/80">
                    {project.tags.join(" · ")}
                  </p>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
