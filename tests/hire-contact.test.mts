import { test } from "node:test";
import assert from "node:assert/strict";
import { handleHireContact, parseBudget } from "../src/lib/hire-contact.ts";

const budget = { mode: "project", hours: 20, complexity: "medium", onSite: true, days: 2, extra: false };
const ok = { name: "Ana", email: "ana@example.com", message: "Hola, quiero una web.", budget };

function mkEnv(opts: { limitOk?: boolean; resend?: boolean } = {}) {
  const sent: unknown[] = [];
  const env = {
    CONTACT_TO: "lucianoolivabianco@gmail.com",
    CONTACT_FROM: "no-responder@lulox.com.ar",
    CONTACT_RL: { limit: async () => ({ success: opts.limitOk ?? true }) },
    CONTACT_EMAIL: { send: async (m: unknown) => void sent.push({ via: "binding", m }) },
    ...(opts.resend
      ? { RESEND_API_KEY: "test-key", fetch: (async (_u: string, init: RequestInit) => { sent.push({ via: "resend", m: JSON.parse(String(init.body)) }); return new Response("{}", { status: 200 }); }) as unknown as typeof fetch }
      : {}),
  };
  return { env, sent };
}

test("valid submission sends via Resend with reply-to and server-computed budget", async () => {
  const { env, sent } = mkEnv({ resend: true });
  const r = await handleHireContact({ ...ok, budget: { ...budget, total: 1 } }, env, "1.1.1.1");
  assert.equal(r.status, 200);
  assert.equal(sent.length, 1);
  const { via, m } = sent[0] as { via: string; m: Record<string, unknown> };
  assert.equal(via, "resend");
  assert.deepEqual(m.to, ["lucianoolivabianco@gmail.com"]);
  assert.equal(m.from, "Lulox <no-responder@lulox.com.ar>");
  assert.equal(m.reply_to, "ana@example.com");
  // 20h × 18 = 360, -15% = -54, on-site 2×25 + travel 2×25 = 100 → 406
  assert.match(String(m.text), /Total estimado: US\$ 406/);
  assert.match(String(m.text), /Presencial: sí, 2 días/);
});

test("falls back to send_email binding without Resend", async () => {
  const { env, sent } = mkEnv();
  assert.equal((await handleHireContact(ok, env, "x")).status, 200);
  assert.equal((sent[0] as { via: string }).via, "binding");
});

test("280 limit counts characters, not bytes", async () => {
  const { env, sent } = mkEnv();
  assert.equal((await handleHireContact({ ...ok, message: "ñ".repeat(280) }, env, "x")).status, 200);
  const r = await handleHireContact({ ...ok, message: "a".repeat(281) }, env, "x");
  assert.deepEqual([r.status, r.body.error], [400, "invalid_message"]);
  assert.equal(sent.length, 1);
});

test("validation: email, name, empty message, budget", async () => {
  const { env, sent } = mkEnv();
  for (const [patch, err] of [
    [{ email: "nope" }, "invalid_email"],
    [{ name: "  " }, "invalid_name"],
    [{ message: "   " }, "invalid_message"],
    [{ budget: { ...budget, hours: 99 } }, "invalid_budget"],
    [{ budget: { ...budget, mode: "x" } }, "invalid_budget"],
  ] as const) {
    const r = await handleHireContact({ ...ok, ...patch }, env, "x");
    assert.deepEqual([r.status, r.body.error], [400, err]);
  }
  assert.equal(sent.length, 0);
});

test("honeypot pretends success and sends nothing", async () => {
  const { env, sent } = mkEnv();
  const r = await handleHireContact({ ...ok, website: "spam.com" }, env, "x");
  assert.equal(r.status, 200);
  assert.equal(sent.length, 0);
});

test("rate limit → 429, nothing sent", async () => {
  const { env, sent } = mkEnv({ limitOk: false });
  assert.equal((await handleHireContact(ok, env, "x")).status, 429);
  assert.equal(sent.length, 0);
});

test("no transport → 503; send failure → 502", async () => {
  assert.equal((await handleHireContact(ok, {}, "x")).status, 503);
  const r = await handleHireContact(ok, { CONTACT_EMAIL: { send: async () => { throw new Error("x"); } } }, "x");
  assert.equal(r.status, 502);
});

test("parseBudget clamps days and drops them when not on-site", () => {
  assert.equal(parseBudget({ ...budget, days: 50 })?.days, 10);
  assert.equal(parseBudget({ ...budget, onSite: false })?.days, 0);
  assert.equal(parseBudget({ ...budget, mode: "hourly", hours: 4 })?.days, 1);
});
