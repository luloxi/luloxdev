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

/** Copy of `base` with overrides applied (only on existing string leaves). */
export function applyCopy<T>(base: T, map: CopyMap | undefined): T {
  if (!map || Object.keys(map).length === 0) return base;
  const clone = structuredClone(base) as unknown;
  for (const [key, value] of Object.entries(map)) {
    const parts = key.split(".");
    let node = clone as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1 && node; i++) {
      node = node[parts[i]] as Record<string, unknown>;
    }
    const last = parts[parts.length - 1];
    if (node && typeof node[last] === "string") node[last] = value;
  }
  return clone as T;
}
