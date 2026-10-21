import type { Locale } from "./types";

/** key (dotted path into messages, e.g. "about.paragraphs.0") -> value */
export type CopyMap = Record<string, string>;
export type CopyOverrides = Partial<Record<Locale, CopyMap>>;

/** Every string leaf of a messages tree, keyed by dotted path. */
export function flattenCopy(obj: unknown, prefix = "", out: CopyMap = {}): CopyMap {
  if (typeof obj === "string") {
    out[prefix] = obj;
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) => flattenCopy(v, prefix ? `${prefix}.${i}` : String(i), out));
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      flattenCopy(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
  return out;
}

/** Max items an editable list (array of objects with string fields) can grow to. */
export const LIST_MAX_ITEMS = 50;
const LIST_KEY = /^(.+)\.(\d+)\.([A-Za-z]\w*)$/;

/**
 * "list.N.field" where list.0.field is a known key: a new item of an existing
 * list of records (e.g. a new job). Lets admins add items without code changes.
 */
export function isGrowableListKey(key: string, known: CopyMap): boolean {
  const m = LIST_KEY.exec(key);
  if (!m) return false;
  const n = Number(m[2]);
  return n < LIST_MAX_ITEMS && `${m[1]}.0.${m[3]}` in known;
}

/** Copy of `base` with overrides applied (existing string leaves, plus new list items). */
export function applyCopy<T>(base: T, map: CopyMap | undefined): T {
  if (!map || Object.keys(map).length === 0) return base;
  const clone = structuredClone(base) as unknown;
  for (const [key, value] of Object.entries(map)) {
    const parts = key.split(".");
    let node = clone as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1 && node; i++) {
      const cur = node as unknown;
      if (Array.isArray(cur) && /^\d+$/.test(parts[i])) {
        const n = Number(parts[i]);
        const tpl = cur[0];
        // Grow a list of records: new items get the first item's shape with empty strings.
        if (n >= cur.length && n < LIST_MAX_ITEMS && tpl && typeof tpl === "object" && !Array.isArray(tpl)) {
          while (cur.length <= n) {
            cur.push(Object.fromEntries(Object.keys(tpl).map((k) => [k, ""])));
          }
        }
      }
      node = node[parts[i]] as Record<string, unknown>;
    }
    const last = parts[parts.length - 1];
    if (node && typeof node[last] === "string") node[last] = value;
  }
  return clone as T;
}
