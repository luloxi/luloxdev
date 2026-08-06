import {
  pastProjects,
  type PastProject,
  type PastProjectId,
  type ProjectStatus,
} from "@/content/projects";
import { getSql, hasDatabase } from "@/lib/db";

export type ProjectOverrideRow = {
  id: string;
  status: string;
  disabled_reason_es: string;
  disabled_reason_en: string;
  live_url: string;
  updated_at: string;
};

export type ProjectOverrideInput = {
  id: PastProjectId;
  status: ProjectStatus;
  disabledReason?: { es: string; en: string };
  liveUrl?: string;
};

let ensurePromise: Promise<void> | null = null;

export async function ensureProjectSchema() {
  if (!hasDatabase()) return;
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS project_overrides (
          id TEXT PRIMARY KEY,
          status TEXT NOT NULL DEFAULT 'disabled',
          disabled_reason_es TEXT NOT NULL DEFAULT '',
          disabled_reason_en TEXT NOT NULL DEFAULT '',
          live_url TEXT NOT NULL DEFAULT '',
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((err) => {
      ensurePromise = null;
      throw err;
    });
  }
  await ensurePromise;
}

function isValidStatus(value: string): value is ProjectStatus {
  return value === "live" || value === "disabled" || value === "archive";
}

function applyOverride(
  base: PastProject,
  row: ProjectOverrideRow | undefined,
): PastProject {
  if (!row) return base;

  const status = isValidStatus(row.status) ? row.status : base.status;
  const reasonEs = row.disabled_reason_es?.trim() ?? "";
  const reasonEn = row.disabled_reason_en?.trim() ?? "";
  const liveUrl = row.live_url?.trim() || base.liveUrl;

  return {
    ...base,
    status,
    liveUrl,
    disabledReason:
      reasonEs || reasonEn
        ? { es: reasonEs, en: reasonEn }
        : base.disabledReason,
  };
}

export async function getMergedPastProjects(): Promise<PastProject[]> {
  if (!hasDatabase()) {
    return pastProjects;
  }

  try {
    await ensureProjectSchema();
    const sql = getSql();
    const rows = (await sql`SELECT * FROM project_overrides`) as ProjectOverrideRow[];
    const byId = new Map(rows.map((r) => [r.id, r]));
    return pastProjects.map((p) => applyOverride(p, byId.get(p.id)));
  } catch (err) {
    console.error("[projects] getMergedPastProjects fallback to static:", err);
    return pastProjects;
  }
}

export async function getMergedPastProject(
  id: string,
): Promise<PastProject | null> {
  const base = pastProjects.find((p) => p.id === id);
  if (!base) return null;

  if (!hasDatabase()) {
    return base;
  }

  try {
    await ensureProjectSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM project_overrides WHERE id = ${id} LIMIT 1
    `) as ProjectOverrideRow[];
    return applyOverride(base, rows[0]);
  } catch (err) {
    console.error("[projects] getMergedPastProject fallback to static:", err);
    return base;
  }
}

export async function upsertProjectOverride(input: ProjectOverrideInput) {
  await ensureProjectSchema();
  const sql = getSql();

  const status = input.status;
  const reasonEs = input.disabledReason?.es ?? "";
  const reasonEn = input.disabledReason?.en ?? "";
  const liveUrl = input.liveUrl ?? "";

  await sql`
    INSERT INTO project_overrides (
      id, status, disabled_reason_es, disabled_reason_en, live_url, updated_at
    ) VALUES (
      ${input.id},
      ${status},
      ${reasonEs},
      ${reasonEn},
      ${liveUrl},
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      disabled_reason_es = EXCLUDED.disabled_reason_es,
      disabled_reason_en = EXCLUDED.disabled_reason_en,
      live_url = EXCLUDED.live_url,
      updated_at = NOW()
  `;
}

export { requireAdminSession } from "@/lib/blog";
