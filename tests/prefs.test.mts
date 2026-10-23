/** Language/theme preference: Accept-Language fallback and the blocking head script. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { localeFromAcceptLanguage } from "../src/lib/prefs.ts";
import { PREFS_HEAD_SCRIPT, normalizeLocale, normalizeTheme } from "../src/lib/prefs-shared.ts";

test("Accept-Language fallback matches the old browser rule", () => {
  assert.equal(localeFromAcceptLanguage(null), "en");
  assert.equal(localeFromAcceptLanguage("en-US,en;q=0.9"), "en");
  assert.equal(localeFromAcceptLanguage("es-AR,es;q=0.9,en;q=0.8"), "es");
  assert.equal(localeFromAcceptLanguage("en-US,es;q=0.5"), "es");
  assert.equal(localeFromAcceptLanguage("fr-FR"), "en");
});

function run(cookie: string, ls: Record<string, string>, ssrLocale: string, ssIn: Record<string, string> | null = {}, prefersLight: boolean | "missing" = true) {
  const cls = new Set(["dark"]);
  let jar = cookie;
  let reloaded = false;
  const ss: Record<string, string> = { ...(ssIn ?? {}) };
  const attrs: Record<string, string> = { "data-ssr-locale": ssrLocale };
  const documentElement = {
    classList: {
      remove: (...a: string[]) => a.forEach((x) => cls.delete(x)),
      add: (x: string) => cls.add(x),
    },
    style: {} as Record<string, string>,
    getAttribute: (k: string) => attrs[k] ?? null,
    setAttribute: (k: string, v: string) => void (attrs[k] = v),
    lang: ssrLocale,
  };
  const document = {
    documentElement,
    get cookie() {
      return jar;
    },
    set cookie(v: string) {
      const kv = v.split(";")[0];
      const k = kv.split("=")[0];
      jar = [...jar.split("; ").filter((x) => x && !x.startsWith(`${k}=`)), kv].join("; ");
    },
  };
  const env = {
    document,
    localStorage: { getItem: (k: string) => ls[k] ?? null },
    sessionStorage: ssIn === null
      ? { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); } }
      : { getItem: (k: string) => ss[k] ?? null, setItem: (k: string, v: string) => void (ss[k] = v) },
    matchMedia: prefersLight === "missing" ? undefined : () => ({ matches: prefersLight }),
    location: { protocol: "https:", href: "https://www.lulox.dev/", replace: () => void (reloaded = true) },
  };
  new Function(...Object.keys(env), PREFS_HEAD_SCRIPT)(...Object.values(env));
  return { theme: [...cls].join(","), cookie: jar, reloaded, status: attrs["data-prefs"], lang: documentElement.lang };
}

test("head script: no prefs follows the system theme before paint, persists nothing", () => {
  const dark = run("", {}, "en", {}, false);
  assert.equal(dark.theme, "dark");
  assert.equal(dark.cookie, "");
  assert.equal(dark.reloaded, false);
  assert.equal(dark.status, "system");
  const light = run("", {}, "en", {}, true);
  assert.equal(light.theme, "light");
  assert.equal(light.cookie, "");
});

test("no system preference (no-preference or no matchMedia) falls back to dark everywhere", async () => {
  // no-preference: (prefers-color-scheme: light) does not match
  assert.equal(run("", {}, "en", {}, false).theme, "dark");
  // matchMedia missing entirely
  const r = run("", {}, "en", {}, "missing");
  assert.equal(r.theme, "dark");
  assert.equal(r.cookie, "");
  assert.equal(normalizeTheme("system", false), "dark");
  const { DEFAULT_THEME } = await import("../src/lib/prefs-shared.ts");
  assert.equal(DEFAULT_THEME, "dark");
});

test("head script: a saved manual theme beats the system theme", () => {
  assert.equal(run("lulox-theme=dark", {}, "en", {}, true).theme, "dark");
  assert.equal(run("lulox-theme=light", {}, "en", {}, false).theme, "light");
  assert.equal(run("", { theme: "dark" }, "en", {}, true).theme, "dark");
});

test("theme toggle: dark first, then light (same order as the AR → US flags)", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(new URL("../src/components/theme-toggle.tsx", import.meta.url), "utf8");
  assert.ok(src.indexOf('setTheme("dark")') < src.indexOf('setTheme("light")'));
});

test("head script: cookie theme applied before paint", () => {
  assert.equal(run("lulox-theme=light", {}, "en").theme, "light");
});

test("head script: localStorage-only prefs migrate to cookies, reload once if language differs", () => {
  const r = run("", { theme: "light", "lulox-locale": "es" }, "en");
  assert.equal(r.theme, "light");
  assert.match(r.cookie, /lulox-theme=light/);
  assert.match(r.cookie, /lulox-locale=es/);
  assert.equal(r.reloaded, true);
  assert.equal(run("", { "lulox-locale": "en" }, "en").reloaded, false);
});

test("normalizers accept the real legacy formats and JSON-quoted variants", () => {
  assert.equal(normalizeLocale("es"), "es");
  assert.equal(normalizeLocale('"es"'), "es");
  assert.equal(normalizeLocale(" es-AR "), "es");
  assert.equal(normalizeLocale("EN"), "en");
  assert.equal(normalizeLocale("fr"), null);
  assert.equal(normalizeLocale(null), null);
  assert.equal(normalizeTheme("light"), "light");
  assert.equal(normalizeTheme('"light"'), "light");
  assert.equal(normalizeTheme("system", true), "light");
  assert.equal(normalizeTheme("system", false), "dark");
  assert.equal(normalizeTheme("blue"), null);
});

test("head script: JSON-quoted legacy values migrate too", () => {
  const r = run("", { theme: '"light"', "lulox-locale": '"es"' }, "en");
  assert.equal(r.theme, "light");
  assert.match(r.cookie, /lulox-locale=es/);
  assert.equal(r.reloaded, true);
});

test("head script: reload guard prevents loops but still fixes lang/theme", () => {
  const r = run("", { theme: "light", "lulox-locale": "es" }, "en", { "lulox-lang-reload": "1" });
  assert.equal(r.reloaded, false);
  assert.equal(r.theme, "light");
  assert.equal(r.lang, "es");
  assert.equal(r.status, "legacy");
});

test("head script: sessionStorage denied still reloads once (cookie then matches server)", () => {
  const r = run("", { "lulox-locale": "es" }, "en", null);
  assert.equal(r.reloaded, true);
  assert.match(r.cookie, /lulox-locale=es/);
});

test("head script: cookie wins over legacy storage, no reload", () => {
  const r = run("lulox-locale=en; lulox-theme=dark", { theme: "light", "lulox-locale": "es" }, "en");
  assert.equal(r.theme, "dark");
  assert.equal(r.reloaded, false);
  assert.equal(r.status, "cookie");
});

test("head script: system theme applied but not persisted", () => {
  const r = run("", { theme: "system" }, "en");
  assert.equal(r.theme, "light");
  assert.doesNotMatch(r.cookie, /lulox-theme/);
});

test("share metadata is always ES, even with an en cookie", async () => {
  const { metadataLocale } = await import("../src/lib/prefs-shared.ts");
  assert.equal(metadataLocale(undefined), "es");
  assert.equal(metadataLocale(null), "es");
  assert.equal(metadataLocale(""), "es");
  assert.equal(metadataLocale("es"), "es");
  assert.equal(metadataLocale("EN"), "es");
  assert.equal(metadataLocale("en"), "es");
});
