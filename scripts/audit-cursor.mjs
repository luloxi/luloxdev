// Site-wide cursor audit: every clickable element must show cursor:pointer (not-allowed when disabled).
// Usage: start the site (pnpm dev or pnpm preview), then
//   AUDIT_URL=http://localhost:3000 node scripts/audit-cursor.mjs
// Needs playwright-core and a Chromium/Chrome (CHROME_PATH, default /usr/bin/google-chrome). Exit 1 on findings.
import { chromium } from "playwright-core";

const BASE = process.env.AUDIT_URL ?? "http://localhost:3000";
const WAIT = process.env.AUDIT_WAIT ?? "networkidle"; // "load" for sites with long-polling scripts
const ROUTES = process.env.AUDIT_ROUTES ? process.env.AUDIT_ROUTES.split(",") : ["/", "/blog", "/contratar", "/sobre-mi", "/proyectos", "/contacto", "/tastes", "/privacidad", "/ingresar", "/rothko", "/no-existe"];

const probe = () => {
  const SEL = 'a[href], button, [role=button], [role=radio], [role=switch], [role=tab], [role=checkbox], [onclick], label, summary, select, input:not([type=hidden]), [tabindex]:not([tabindex="-1"])';
  const TEXTY = new Set(["text", "email", "search", "url", "tel", "password", "number", ""]);
  const bad = [];
  let checked = 0;
  for (const el of document.querySelectorAll(SEL)) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (!r.width || !r.height || cs.visibility === "hidden" || cs.display === "none" || el.closest("[aria-hidden=true], [inert]")) continue;
    const tag = el.tagName.toLowerCase();
    if (tag === "textarea" || (tag === "input" && TEXTY.has(el.getAttribute("type") ?? ""))) continue; // text fields keep the I-beam
    if (tag === "label" && !el.htmlFor && !el.querySelector("input:not([type=text]):not([type=email]), select")) continue; // wraps a text field
    if (el.matches("[contenteditable], .sec-reorder-handle, .avatar-hud")) continue; // drag handles / easter egg: intentional
    if (el.closest("iframe")) continue;
    checked++;
    const disabled = el.matches(":disabled, [aria-disabled=true]");
    const want = disabled ? "not-allowed" : "pointer";
    if (cs.cursor !== want) bad.push(`${tag}${el.id ? "#" + el.id : ""}.${[...el.classList].slice(0, 3).join(".")} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}" → ${cs.cursor} (want ${want})`);
  }
  return { bad, checked };
};

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const ctx0 = await browser.newContext();
const routes = [...ROUTES];
if (!process.env.AUDIT_ROUTES) { // add every blog article linked from /blog
  const p = await ctx0.newPage();
  await p.goto(BASE + "/blog", { waitUntil: WAIT });
  routes.push(...new Set(await p.$$eval('a[href^="/blog/"]', (as) => as.map((a) => a.getAttribute("href")))));
  await ctx0.close();
}
const findings = new Map();
let checked = 0;
for (const locale of ["es", "en"]) for (const theme of ["light", "dark"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addCookies([{ name: "lulox-locale", value: locale, url: BASE }, { name: "lulox-theme", value: theme, url: BASE }]);
  const p = await ctx.newPage();
  for (const route of routes) {
    await p.goto(BASE + route, { waitUntil: WAIT });
    await p.waitForTimeout(400);
    const a = await p.evaluate(probe);
    // open interactive panels so their contents get checked too
    for (const sel of ['[data-testid=hire-write]', 'summary', '.md-acc-btn']) {
      for (const h of await p.$$(sel)) { await h.click().catch(() => {}); }
    }
    await p.waitForTimeout(600);
    const b2 = await p.evaluate(probe);
    checked += a.checked + b2.checked;
    for (const b of [...a.bad, ...b2.bad]) findings.set(`${route} :: ${b}`, (findings.get(`${route} :: ${b}`) ?? new Set()).add(`${locale}/${theme}`));
  }
  await ctx.close();
}
await browser.close();
for (const [k, v] of findings) console.log(`✖ ${k}  [${[...v].join(", ")}]`);
console.log(findings.size ? `\n${findings.size} element(s) without the right cursor` : `✔ cursor audit: ${routes.length} routes × 4 (ES/EN × light/dark), ${checked} element checks, clean`);
process.exit(findings.size ? 1 : 0);
