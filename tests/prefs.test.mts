/** Language/theme preference: Accept-Language fallback and the blocking head script. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { localeFromAcceptLanguage } from "../src/lib/prefs.ts";
import { PREFS_HEAD_SCRIPT } from "../src/lib/prefs-shared.ts";

test("Accept-Language fallback matches the old browser rule", () => {
  assert.equal(localeFromAcceptLanguage(null), "en");
  assert.equal(localeFromAcceptLanguage("en-US,en;q=0.9"), "en");
  assert.equal(localeFromAcceptLanguage("es-AR,es;q=0.9,en;q=0.8"), "es");
  assert.equal(localeFromAcceptLanguage("en-US,es;q=0.5"), "es");
  assert.equal(localeFromAcceptLanguage("fr-FR"), "en");
});

function run(cookie: string, ls: Record<string, string>, ssrLocale: string) {
  const cls = new Set(["dark"]);
  let jar = cookie;
  let reloaded = false;
  const ss: Record<string, string> = {};
  const documentElement = {
    classList: {
      remove: (...a: string[]) => a.forEach((x) => cls.delete(x)),
      add: (x: string) => cls.add(x),
    },
    style: {} as Record<string, string>,
    getAttribute: () => ssrLocale,
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
    sessionStorage: { getItem: (k: string) => ss[k] ?? null, setItem: (k: string, v: string) => void (ss[k] = v) },
    location: { protocol: "https:", href: "https://www.lulox.dev/", replace: () => void (reloaded = true) },
  };
  new Function(...Object.keys(env), PREFS_HEAD_SCRIPT)(...Object.values(env));
  return { theme: [...cls].join(","), cookie: jar, reloaded };
}

test("head script: no prefs keeps server defaults", () => {
  assert.deepEqual(run("", {}, "en"), { theme: "dark", cookie: "", reloaded: false });
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
