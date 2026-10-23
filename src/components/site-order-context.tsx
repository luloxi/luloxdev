"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useEditMode } from "@/components/admin-context";
import type { OrderItem, OrderKind, SectionKey, SiteSection } from "@/lib/site-sections";

type SiteOrderState = {
  sections: SiteSection[];
  projects: OrderItem[];
  /** Admin with edit mode ON: hidden items stay on the page, flagged. */
  showHidden: boolean;
  /** Optimistic update + save (admin only). Resolves to an error code or null. */
  save: (kind: OrderKind, items: OrderItem[]) => Promise<string | null>;
};

const SiteOrderContext = createContext<SiteOrderState>({
  sections: [],
  projects: [],
  showHidden: false,
  save: async () => "no_provider",
});

/**
 * Order + visibility of sections and projects (D1 site_sections and
 * project_settings, read once per request by the root layout). Public
 * components read it; the admin strip writes it.
 */
export function SiteOrderProvider({
  initial,
  children,
}: {
  initial: { sections: SiteSection[]; projects: OrderItem[] };
  children: ReactNode;
}) {
  const editOn = useEditMode();
  const [sections, setSections] = useState(initial.sections);
  const [projects, setProjects] = useState(initial.projects);
  // A server refresh (router.refresh) brings the saved state back.
  useEffect(() => setSections(initial.sections), [initial.sections]); // eslint-disable-line react-hooks/set-state-in-effect -- sync with server props
  useEffect(() => setProjects(initial.projects), [initial.projects]); // eslint-disable-line react-hooks/set-state-in-effect -- sync with server props

  const save = useCallback(
    async (kind: OrderKind, items: OrderItem[]) => {
      const set = kind === "sections" ? (setSections as (v: OrderItem[]) => void) : setProjects;
      const prev = kind === "sections" ? sections : projects;
      set(items);
      try {
        const res = await fetch("/api/sections", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, items }),
        });
        if (res.ok) return null;
        set(prev);
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        return res.status === 401 ? "session" : (data.error ?? String(res.status));
      } catch {
        set(prev);
        return "network";
      }
    },
    [sections, projects],
  );

  return (
    <SiteOrderContext.Provider value={{ sections, projects, showHidden: editOn, save }}>
      {children}
    </SiteOrderContext.Provider>
  );
}

export function useSiteOrder() {
  return useContext(SiteOrderContext);
}

/** Whether links to a section should render (visible, or hidden while the admin edits). */
export function useSectionShown(key: SectionKey): boolean {
  const { sections, showHidden } = useSiteOrder();
  const s = sections.find((x) => x.key === key);
  return !s || s.visible || showHidden;
}
