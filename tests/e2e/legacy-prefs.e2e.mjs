// Run: BASE=<preview url> node tests/e2e/legacy-prefs.e2e.mjs  (needs `playwright` + chromium installed; not part of pnpm test)
// Ramsay's legacy-visitor repro: no cookies, legacy localStorage only, fresh load of a post.
import { chromium } from "playwright";
const BASE = process.env.BASE || "https://ssr-public-luloxdev.lucianoolivabianco.workers.dev";
const POST = `${BASE}/blog/por-que-deje-hermes-agent`;
const variants = [
  { name: "real prod keys (plain)", ls: { "lulox-locale": "es", theme: "light" }, ss: {}, expect: { lang: "es", theme: "light", reloads: 1 } },
  { name: "JSON-quoted values", ls: { "lulox-locale": '"es"', theme: '"light"' }, ss: {}, expect: { lang: "es", theme: "light", reloads: 1 } },
  { name: "reload guard already used (client fallback, no reload)", ls: { "lulox-locale": "es", theme: "light" }, ss: { "lulox-lang-reload": "1" }, expect: { lang: "es", theme: "light", reloads: 0 } },
  { name: "legacy EN + dark on ES browser", ls: { "lulox-locale": "en", theme: "dark" }, ss: {}, acceptEs: true, expect: { lang: "en", theme: "dark", reloads: 1 } },
  { name: "no prefs at all", ls: {}, ss: {}, expect: { lang: "en", theme: "dark", reloads: 0 } },
];
let failed = 0;
const browser = await chromium.launch();
for (const v of variants) {
  const ctx = await browser.newContext({ locale: v.acceptEs ? "es-AR" : "en-US" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // Ramsay: open the site, wipe cookies via document.cookie Max-Age=0, set localStorage, clear sessionStorage.
  await page.goto(`${BASE}/privacy`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.evaluate(({ ls, ss }) => {
    for (const c of document.cookie.split("; ")) if (c) document.cookie = `${c.split("=")[0]}=; Path=/; Max-Age=0`;
    localStorage.clear();
    for (const [k, val] of Object.entries(ls)) localStorage.setItem(k, val);
    sessionStorage.clear();
    for (const [k, val] of Object.entries(ss)) sessionStorage.setItem(k, val);
  }, v);
  let docs = 0;
  page.on("response", (r) => { if (r.url() === POST && r.request().resourceType() === "document") docs++; });
  // Record what is painted first: html class/lang at DOMContentLoaded of each document.
  const firstPaint = [];
  await page.exposeFunction("__report", (x) => firstPaint.push(x));
  await page.addInitScript(() => document.addEventListener("DOMContentLoaded", () =>
    window.__report({ lang: document.documentElement.lang, light: document.documentElement.classList.contains("light"), h: document.querySelector("article h1, h1")?.textContent?.slice(0, 25) })));
  await page.goto(POST, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const read = () => page.evaluate(() => ({
    lang: document.documentElement.lang,
    theme: document.documentElement.classList.contains("light") ? "light" : "dark",
    prefs: document.documentElement.dataset.prefs,
    langBtn: document.querySelector('[aria-pressed="true"][aria-label="Español"]') ? "es" : document.querySelector('[aria-pressed="true"][aria-label="English"]') ? "en" : "?",
    title: document.querySelector("main h1, article h1, h1:not(.home-title)")?.textContent?.slice(0, 30),
    text: document.body.innerText.toLowerCase().includes("por qué dejé de usar hermes") ? "es" : document.body.innerText.toLowerCase().includes("why i stopped using hermes") ? "en" : "?",
    cookie: document.cookie,
    ls: JSON.stringify(localStorage),
  }));
  const s1 = await read();
  await page.reload({ waitUntil: "networkidle" });
  const s2 = await read();
  const reloads = docs - 2; // first nav + manual reload
  const ok = [s1, s2].every((s) => s.lang === v.expect.lang && s.theme === v.expect.theme && s.text === v.expect.lang && s.langBtn === v.expect.lang) && reloads === v.expect.reloads && errors.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${v.name}: auto-reloads=${reloads} after-load=${JSON.stringify(s1)} after-reload=${JSON.stringify({ lang: s2.lang, theme: s2.theme, text: s2.text, prefs: s2.prefs })} first-paint(per document)=${JSON.stringify(firstPaint.map((f) => `${f.lang}/${f.light ? "light" : "dark"}`))} errors=${errors.length}`);
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
