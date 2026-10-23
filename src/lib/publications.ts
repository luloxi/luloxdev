/**
 * Publications on Sobre mí (/sobre-mi, /en/about): articles cited right below
 * the story that mentions them. Pure logic (defaults, validation, display),
 * shared by the page, the admin editor and PUT /api/publications.
 * Storage: D1 table `publications` (migrations/0011_publications.sql). No rows
 * = DEFAULT_PUBLICATIONS. "Remove" is a soft hide (hidden = true), never a DELETE.
 */
import type { Locale } from "@/i18n/types";
import { joinSections, splitSections } from "@/lib/md-sections";

export type Publication = {
  /** Stable id: lowercase letters, digits and hyphens. */
  id: string;
  /** Title as published (original language). */
  title: string;
  /** Only if a real English version of the title exists; "" = use `title`. */
  title_en: string;
  /** Optional short line in each language (what it is about). */
  note_es: string;
  note_en: string;
  /** Names as they appear on the publication, comma separated. "" = none listed. */
  authors: string;
  /** Publication year, or null when it isn't stated anywhere public. */
  year: number | null;
  /** Where it was published (e.g. LinkedIn, PDF). */
  venue: string;
  /** https only. */
  url: string;
  /** Soft-removed: visitors never see it; the admin (edit mode) can restore it. */
  hidden: boolean;
};

/**
 * Code defaults (used while D1 has no rows). Every field comes from the
 * public pages themselves (checked 2026-10-23):
 * - LinkedIn post: document title, cover "Authors, consultants, and
 *   reviewers", post date 2026-09-04.
 * - Google Drive PDF: title and author line of page 1. No date in the PDF.
 * The notes are the labels this site already used for each link.
 */
export const DEFAULT_PUBLICATIONS: readonly Publication[] = [
  {
    id: "rwa-tokenization-cip-0113",
    title:
      "A Technical, Commercial, and Regulatory Analysis to Strengthen Cardano's Position in Real-World Asset Tokenization: CIP-0113 vs ERC-3643",
    title_en: "",
    note_es: "El panorama actual de tokenización",
    note_en: "The current landscape of tokenization",
    authors:
      "Juan Ignacio Lazarte, Mauro Agustín Andreoli, Lucas Macchiavelli, Alejandro Ravasio, Luciano Oliva Bianco, Claudio J. Tessone, Alejandro Rodríguez Ariola",
    year: 2026,
    venue: "LinkedIn",
    url: "https://www.linkedin.com/feed/update/urn:li:activity:7501713293321854976/",
    hidden: false,
  },
  {
    id: "lcp-midnight-city",
    title:
      "How to Align Midnight City with the Legal Context Protocol (LCP): Integrating Midnight’s Smart Compliance Principle into Agentic Commerce",
    title_en: "",
    note_es: "El contexto legal del comercio agéntico",
    note_en: "The legal context of agentic commerce",
    authors: "Mauro Andreoli, Luciano Oliva Bianco",
    year: null,
    venue: "PDF",
    url: "https://drive.google.com/file/d/1Malx_E4Z1flmVr5hQgCRejJEWL8HxjiQ/view?usp=drive_link",
    hidden: false,
  },
];

export const PUB_MAX_ITEMS = 30;
export const PUB_LIMITS = {
  id: 40,
  title: 300,
  title_en: 300,
  note_es: 160,
  note_en: 160,
  authors: 400,
  venue: 80,
  url: 600,
} as const;
export const PUB_YEAR_MIN = 1900;
export const PUB_YEAR_MAX = 2100;
const TEXT_FIELDS = ["title", "title_en", "note_es", "note_en", "authors", "venue"] as const;
const FIELDS = new Set(["id", ...TEXT_FIELDS, "year", "url", "hidden"]);
const ID_RE = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
const CONTROL_RE = /[\u0000-\u001f\u007f]/;

/** Absolute https URL with a host and no credentials; returns the trimmed string or null. */
export function cleanHttpsUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s || s.length > PUB_LIMITS.url || /\s/.test(s)) return null;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || !u.hostname || u.username || u.password) return null;
  return s;
}

export type PubValidation =
  | { ok: true; items: Publication[] }
  | { ok: false; error: string; index?: number; field?: string };

/** Strict: { items: Publication[] }, every field present with the right type and bounds. */
export function validatePublicationsPayload(body: unknown): PubValidation {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, error: "invalid_body" };
  const list = (body as { items?: unknown }).items;
  if (!Array.isArray(list)) return { ok: false, error: "invalid_body" };
  if (list.length > PUB_MAX_ITEMS) return { ok: false, error: "too_many" };
  const out: Publication[] = [];
  const ids = new Set<string>();
  for (let index = 0; index < list.length; index++) {
    const it = list[index];
    const bad = (error: string, field?: string): PubValidation => ({ ok: false, error, index, ...(field ? { field } : {}) });
    if (!it || typeof it !== "object" || Array.isArray(it)) return bad("invalid_item");
    const o = it as Record<string, unknown>;
    for (const k of Object.keys(o)) if (!FIELDS.has(k)) return bad("unknown_field", k);
    if (typeof o.id !== "string" || !ID_RE.test(o.id)) return bad("invalid_value", "id");
    if (ids.has(o.id)) return bad("duplicate_id", "id");
    ids.add(o.id);
    const text: Record<string, string> = {};
    for (const f of TEXT_FIELDS) {
      const v = o[f];
      if (typeof v !== "string") return bad("invalid_value", f);
      const t = v.trim().replace(/\s+/g, " ");
      if (t.length > PUB_LIMITS[f] || CONTROL_RE.test(t)) return bad("invalid_value", f);
      text[f] = t;
    }
    if (!text.title) return bad("required", "title");
    const url = cleanHttpsUrl(o.url);
    if (!url) return bad("invalid_url", "url");
    let year: number | null = null;
    if (o.year !== null) {
      if (typeof o.year !== "number" || !Number.isInteger(o.year) || o.year < PUB_YEAR_MIN || o.year > PUB_YEAR_MAX)
        return bad("invalid_value", "year");
      year = o.year;
    }
    if (typeof o.hidden !== "boolean") return bad("invalid_value", "hidden");
    out.push({ id: o.id, title: text.title, title_en: text.title_en, note_es: text.note_es, note_en: text.note_en, authors: text.authors, year, venue: text.venue, url, hidden: o.hidden });
  }
  return { ok: true, items: out };
}

export type PublicationRow = {
  id: unknown; title: unknown; title_en: unknown; note_es: unknown; note_en: unknown;
  authors: unknown; year: unknown; venue: unknown; url: unknown; hidden: unknown; position?: unknown;
};

/**
 * Stored rows (already ordered by position) to publications. No rows = code
 * defaults. Rows that don't pass validation are skipped, so a bad row never
 * breaks the page.
 */
export function publicationsFromRows(rows: readonly PublicationRow[] | null | undefined): Publication[] {
  if (!rows || rows.length === 0) return DEFAULT_PUBLICATIONS.map((p) => ({ ...p }));
  const out: Publication[] = [];
  for (const r of rows) {
    const v = validatePublicationsPayload({
      items: [{
        id: r.id, title: r.title, title_en: r.title_en ?? "", note_es: r.note_es ?? "", note_en: r.note_en ?? "",
        authors: r.authors ?? "", year: r.year ?? null, venue: r.venue ?? "", url: r.url, hidden: r.hidden === 1 || r.hidden === true,
      }],
    });
    if (v.ok && !out.some((p) => p.id === v.items[0].id)) out.push(v.items[0]);
  }
  return out;
}

/** What a request may see: visitors (and the admin with edit mode off) never get hidden items. */
export function publicationsFor(items: readonly Publication[], adminEditing: boolean): Publication[] {
  return adminEditing ? [...items] : items.filter((p) => !p.hidden);
}

/** Title in the page language: the English version only where one really exists. */
export function publicationTitle(p: Publication, locale: Locale): string {
  return locale === "en" && p.title_en ? p.title_en : p.title;
}

export function publicationNote(p: Publication, locale: Locale): string {
  return locale === "en" ? p.note_en : p.note_es;
}

/** Citation tail after the title: "Authors · 2026 · LinkedIn" (empty parts skipped). */
export function citationParts(p: Publication): string[] {
  return [p.authors, p.year === null ? "" : String(p.year), p.venue].filter(Boolean);
}

/** New unused id for an item added in the editor. */
export function newPublicationId(taken: readonly string[], seed = Date.now()): string {
  let n = seed % 1_000_000_000;
  let id = `pub-${n.toString(36)}`;
  while (taken.includes(id)) id = `pub-${(++n).toString(36)}`;
  return id;
}

/** Move item i by delta (-1 up, +1 down); out of range = unchanged copy. */
export function movePublication<T>(items: readonly T[], i: number, delta: number): T[] {
  const j = i + delta;
  const out = [...items];
  if (i < 0 || i >= out.length || j < 0 || j >= out.length) return out;
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

const LINK_ITEM = /^\s*[-*+]\s+\[[^\]]*\]\((\S+?)\)\s*[.,;]?\s*$/;

/**
 * Old copy tolerance: if a story section still ends with a Markdown list
 * whose every item is a link to one of these publications, drop that list
 * (the Publications block below shows them). Anything else is left as is.
 */
export function stripPublicationLinks(sectionBody: string, urls: readonly string[]): string {
  if (!urls.length) return sectionBody;
  const known = new Set(urls.map((u) => u.trim()));
  const lines = sectionBody.split("\n");
  let end = lines.length;
  while (end > 0 && lines[end - 1].trim() === "") end--;
  let start = end;
  while (start > 0) {
    const m = LINK_ITEM.exec(lines[start - 1]);
    if (!m || !known.has(m[1])) break;
    start--;
  }
  if (start === end) return sectionBody;
  // Only a whole trailing list, preceded by a blank line or the section start.
  if (start > 0 && lines[start - 1].trim() !== "") return sectionBody;
  const head = lines.slice(0, start);
  while (head.length && head[head.length - 1].trim() === "") head.pop();
  return [...head, ...lines.slice(end)].join("\n");
}

/** stripPublicationLinks applied to the intro and every "## " section of a body. */
export function stripPublicationLinksInBody(md: string, urls: readonly string[]): string {
  const split = splitSections(md.replace(/\r\n?/g, "\n"));
  const intro = stripPublicationLinks(split.intro.join("\n"), urls);
  const sections = split.sections.map((s) => ({ ...s, lines: stripPublicationLinks(s.lines.join("\n"), urls).split("\n") }));
  return joinSections({ intro: intro === "" ? [] : intro.split("\n"), sections });
}
