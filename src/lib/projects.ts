import {
  pastProjects,
  type PastProject,
  type PastProjectId,
  type ProjectCopyLocale,
  type ProjectStatus,
  type TeamMember,
} from "@/content/projects";
import { getDb, nowIso, requireDb } from "@/lib/db";

export type ProjectOverrideRow = {
  id: string;
  status: string;
  disabled_reason_es: string;
  disabled_reason_en: string;
  live_url: string;
  github: string;
  team_json: string;
  title_es: string;
  title_en: string;
  body_es: string;
  body_en: string;
  paragraphs_es: string;
  paragraphs_en: string;
  awards_es: string;
  awards_en: string;
  updated_at: string;
};

export type ProjectOverrideInput = {
  id: PastProjectId;
  status: ProjectStatus;
  disabledReason?: { es: string; en: string };
  liveUrl?: string;
  github?: string;
  team?: TeamMember[];
  copy?: {
    es: ProjectCopyLocale;
    en: ProjectCopyLocale;
  };
};

/** Schema lives in migrations/0001_init.sql (wrangler d1 migrations apply). */
export async function ensureProjectSchema() {
  // no-op on D1: kept so callers don't change
}

function isValidStatus(value: string): value is ProjectStatus {
  return value === "live" || value === "disabled" || value === "archive";
}

function parseTeamJson(raw: string | undefined, fallback: TeamMember[]): TeamMember[] {
  if (!raw?.trim()) return fallback;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return fallback;
    const team = parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const name = String((item as { name?: unknown }).name ?? "").trim();
        if (!name) return null;
        const href = String((item as { href?: unknown }).href ?? "").trim();
        return href ? { name, href } : { name };
      })
      .filter(Boolean) as TeamMember[];
    return team.length > 0 ? team : fallback;
  } catch {
    return fallback;
  }
}

function parseParagraphs(raw: string | undefined, fallback: string[]): string[] {
  if (!raw?.trim()) return fallback;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      const list = parsed.map((p) => String(p).trim()).filter(Boolean);
      return list.length > 0 ? list : fallback;
    }
  } catch {
    // plain text with blank-line separators
  }
  const list = raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return list.length > 0 ? list : fallback;
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
  const github = row.github?.trim() || base.github;
  const team = parseTeamJson(row.team_json, base.team);

  const titleEs = row.title_es?.trim() || base.copy.es.title;
  const titleEn = row.title_en?.trim() || base.copy.en.title;
  const bodyEs = row.body_es?.trim() || base.copy.es.body;
  const bodyEn = row.body_en?.trim() || base.copy.en.body;
  const paragraphsEs = parseParagraphs(row.paragraphs_es, base.copy.es.paragraphs);
  const paragraphsEn = parseParagraphs(row.paragraphs_en, base.copy.en.paragraphs);
  const awardsEs =
    row.awards_es !== undefined && row.awards_es !== null
      ? row.awards_es
      : base.copy.es.awards;
  const awardsEn =
    row.awards_en !== undefined && row.awards_en !== null
      ? row.awards_en
      : base.copy.en.awards;

  return {
    ...base,
    status,
    liveUrl: liveUrl || undefined,
    github,
    team,
    disabledReason:
      reasonEs || reasonEn
        ? { es: reasonEs, en: reasonEn }
        : base.disabledReason,
    copy: {
      es: {
        title: titleEs,
        body: bodyEs,
        paragraphs: paragraphsEs,
        awards: awardsEs,
      },
      en: {
        title: titleEn,
        body: bodyEn,
        paragraphs: paragraphsEn,
        awards: awardsEn,
      },
    },
  };
}

export async function getMergedPastProjects(): Promise<PastProject[]> {
  const db = await getDb();
  if (!db) {
    return pastProjects;
  }

  try {
    const { results } = await db
      .prepare("SELECT * FROM project_overrides")
      .all<ProjectOverrideRow>();
    const byId = new Map(results.map((r) => [r.id, r]));
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

  const db = await getDb();
  if (!db) {
    return base;
  }

  try {
    const row = await db
      .prepare("SELECT * FROM project_overrides WHERE id = ? LIMIT 1")
      .bind(id)
      .first<ProjectOverrideRow>();
    return applyOverride(base, row ?? undefined);
  } catch (err) {
    console.error("[projects] getMergedPastProject fallback to static:", err);
    return base;
  }
}

export async function upsertProjectOverride(input: ProjectOverrideInput) {
  const db = await requireDb();

  const status = input.status;
  const reasonEs = input.disabledReason?.es ?? "";
  const reasonEn = input.disabledReason?.en ?? "";
  const liveUrl = input.liveUrl ?? "";
  const github = input.github ?? "";
  const teamJson = JSON.stringify(input.team ?? []);
  const titleEs = input.copy?.es.title ?? "";
  const titleEn = input.copy?.en.title ?? "";
  const bodyEs = input.copy?.es.body ?? "";
  const bodyEn = input.copy?.en.body ?? "";
  const paragraphsEs = JSON.stringify(input.copy?.es.paragraphs ?? []);
  const paragraphsEn = JSON.stringify(input.copy?.en.paragraphs ?? []);
  const awardsEs = input.copy?.es.awards ?? "";
  const awardsEn = input.copy?.en.awards ?? "";

  await db
    .prepare(
      `INSERT INTO project_overrides (
        id, status, disabled_reason_es, disabled_reason_en, live_url,
        github, team_json,
        title_es, title_en, body_es, body_en,
        paragraphs_es, paragraphs_en, awards_es, awards_en,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        status = excluded.status,
        disabled_reason_es = excluded.disabled_reason_es,
        disabled_reason_en = excluded.disabled_reason_en,
        live_url = excluded.live_url,
        github = excluded.github,
        team_json = excluded.team_json,
        title_es = excluded.title_es,
        title_en = excluded.title_en,
        body_es = excluded.body_es,
        body_en = excluded.body_en,
        paragraphs_es = excluded.paragraphs_es,
        paragraphs_en = excluded.paragraphs_en,
        awards_es = excluded.awards_es,
        awards_en = excluded.awards_en,
        updated_at = excluded.updated_at`,
    )
    .bind(
      input.id,
      status,
      reasonEs,
      reasonEn,
      liveUrl,
      github,
      teamJson,
      titleEs,
      titleEn,
      bodyEs,
      bodyEn,
      paragraphsEs,
      paragraphsEn,
      awardsEs,
      awardsEn,
      nowIso(),
    )
    .run();
}


export { requireAdminSession } from "@/lib/blog";
