import { clampHours, estimate, PRICING, type Complexity, type Mode } from "./pricing";
import { MAX_MESSAGE } from "./hire-limits";

export { MAX_MESSAGE };

/**
 * /contratar contact form: validates the submission, recomputes the budget
 * server-side from the calculator inputs (never trusts client totals) and
 * sends one email to Luciano via Resend (RESEND_API_KEY), falling back to the
 * Email Routing `send_email` binding. Every send needs a valid Cloudflare
 * Turnstile token, checked server-side via siteverify (TURNSTILE_SECRET_KEY).
 */
export type HireEnv = {
  CONTACT_EMAIL?: { send: (msg: unknown) => Promise<unknown> };
  CONTACT_RL?: { limit: (o: { key: string }) => Promise<{ success: boolean }> };
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  /** Preferred transport (Worker secret, already used by the old contact form). */
  RESEND_API_KEY?: string;
  /** Turnstile secret (Worker secret). Without it the form refuses to send. */
  TURNSTILE_SECRET_KEY?: string;
  fetch?: typeof fetch;
};

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const MODES: Mode[] = ["project", "hourly"];
const CX: Complexity[] = ["low", "medium", "high"];

export type Budget = { mode: Mode; hours: number; complexity: Complexity; onSite: boolean; days: number; extra: boolean; extraDays: number };

export function parseBudget(v: unknown): Budget | null {
  if (!v || typeof v !== "object") return null;
  const b = v as Record<string, unknown>;
  const mode = MODES.find((m) => m === b.mode);
  const complexity = CX.find((c) => c === b.complexity);
  const rawHours = Number(b.hours);
  if (!mode || !complexity || !Number.isFinite(rawHours)) return null;
  // Same rule as the hours input: whole hours, clamped to 1..max for the mode.
  const hours = clampHours(mode, rawHours);
  const onSite = b.onSite === true;
  const days = mode === "project" && onSite ? Math.max(1, Math.min(PRICING.maxOnSiteDays, Math.round(Number(b.days) || 1))) : onSite ? 1 : 0;
  const extra = b.extra === true;
  const extraDays = !extra ? 0 : mode !== "project" ? 1 : Math.max(1, Math.min(PRICING.maxUrgencyDays, Math.round(Number(b.extraDays) || 1)));
  return { mode, hours, complexity, onSite, days, extra, extraDays };
}

const LABEL = {
  mode: { project: "Por proyecto", hourly: "Por hora" },
  cx: { low: "Baja", medium: "Media", high: "Alta" },
  lines: { work: "Trabajo", discount: "Descuento por volumen", onSite: "Recargo presencial", travel: "Viático", extra: "Urgencia" },
} as const;

const usd = (n: number) => `${n < 0 ? "-" : ""}US$ ${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export function budgetLines(b: Budget): { summary: string[]; lines: [string, string][]; total: string; deposit: string } {
  const r = estimate({ mode: b.mode, hours: b.hours, complexity: b.complexity, extra: b.extra, onSite: b.onSite, onSiteDays: b.days, extraDays: b.extraDays });
  const summary = [
    `Modalidad: ${LABEL.mode[b.mode]}`,
    `Horas: ${b.hours}h · Complejidad: ${LABEL.cx[b.complexity]} (US$ ${PRICING.rates[b.complexity]}/h)`,
    `Presencial: ${b.onSite ? (b.mode === "project" ? `sí, ${b.days} ${b.days === 1 ? "día" : "días"}` : "sí") : "no"}`,
    `Urgencia: ${b.extra ? (b.mode === "project" ? `sí, ${b.extraDays} ${b.extraDays === 1 ? "día" : "días"}` : "sí") : "no"}`,
  ];
  const lines = r.lines.map((l): [string, string] => [`${LABEL.lines[l.id]}${l.id === "discount" ? ` (-${l.pct}%)` : ""}${l.days && b.mode === "project" ? ` (${l.days} ${l.days === 1 ? "día" : "días"})` : ""}`, usd(l.amount)]);
  return { summary, lines, total: usd(r.total), deposit: usd(r.deposit) };
}

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** True only if Cloudflare confirms the Turnstile token. Fails closed. */
export async function verifyTurnstile(token: unknown, env: HireEnv, ip: string): Promise<boolean> {
  if (typeof token !== "string" || !token || token.length > 2048 || !env.TURNSTILE_SECRET_KEY) return false;
  const form = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  if (ip && ip !== "unknown") form.set("remoteip", ip);
  try {
    const r = await (env.fetch ?? fetch)(SITEVERIFY, { method: "POST", body: form });
    const j = (await r.json()) as { success?: boolean };
    return r.ok && j.success === true;
  } catch {
    return false;
  }
}

export type Result = { status: number; body: Record<string, unknown> };

export async function handleHireContact(raw: unknown, env: HireEnv, ip: string): Promise<Result> {
  if (!raw || typeof raw !== "object") return { status: 400, body: { error: "invalid_json" } };
  const body = raw as Record<string, unknown>;
  // Honeypot: bots fill hidden fields. Pretend success, send nothing.
  for (const hp of [body.website, body.hire_hp]) if (typeof hp === "string" && hp.trim() !== "") return { status: 200, body: { ok: true } };

  const name = typeof body.name === "string" ? oneLine(body.name).slice(0, 80) : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!name) return { status: 400, body: { error: "invalid_name" } };
  if (!EMAIL_RE.test(email) || email.length > 254) return { status: 400, body: { error: "invalid_email" } };
  if (!message || [...message].length > MAX_MESSAGE) return { status: 400, body: { error: "invalid_message" } };
  const budget = parseBudget(body.budget);
  if (!budget) return { status: 400, body: { error: "invalid_budget" } };

  if (env.CONTACT_RL) {
    const { success } = await env.CONTACT_RL.limit({ key: `hire:${ip}` });
    if (!success) return { status: 429, body: { error: "rate_limited" } };
  }
  if (!env.TURNSTILE_SECRET_KEY || (!env.RESEND_API_KEY && !env.CONTACT_EMAIL)) return { status: 503, body: { error: "not_configured" } };
  if (!(await verifyTurnstile(body.turnstileToken, env, ip))) return { status: 403, body: { error: "captcha_failed" } };

  const b = budgetLines(budget);
  const to = env.CONTACT_TO ?? "hola@lulox.com.ar";
  const from = env.CONTACT_FROM ?? "no-responder@lulox.com.ar";
  const subject = `Contratar: ${name} · ${b.total} (${LABEL.mode[budget.mode]})`;
  const text = [
    `${name} <${email}>`,
    "",
    message,
    "",
    "— Presupuesto calculado —",
    ...b.summary,
    ...b.lines.map(([k, v]) => `${k}: ${v}`),
    `Total estimado: ${b.total}`,
    `Anticipo (50%): ${b.deposit}`,
    "",
    "--",
    `Enviado desde lulox.com.ar/contratar. Respondé este email para contestarle a ${email}.`,
  ].join("\n");
  const row = (k: string, v: string, strong = false) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#555">${esc(k)}</td><td style="padding:4px 0;text-align:right;font-family:monospace${strong ? ";font-weight:700;font-size:18px" : ""}">${esc(v)}</td></tr>`;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(subject)}</title></head><body><div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#1a1a1a;max-width:560px">
<p style="margin:0 0 4px;font-weight:700">${esc(name)} &lt;${esc(email)}&gt;</p>
<p style="font-size:17px;line-height:1.5;white-space:pre-wrap;margin:12px 0 24px">${esc(message)}</p>
<h3 style="margin:0 0 8px;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#7A2FE0">Presupuesto calculado</h3>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6">${b.summary.map(esc).join("<br>")}</p>
<table role="presentation" style="border-collapse:collapse;width:100%;font-size:14px">${b.lines.map(([k, v]) => row(k, v)).join("")}${row("Total estimado", b.total, true)}${row("Anticipo (50%)", b.deposit)}</table>
<p style="font-size:12px;color:#666;margin-top:24px">Enviado desde lulox.com.ar/contratar. Respondé este email para contestarle a ${esc(email)}.</p>
</div></body></html>`;

  try {
    if (env.RESEND_API_KEY) {
      const r = await (env.fetch ?? fetch)("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: `Lulox <${from}>`, to: [to], reply_to: email, subject, html, text }),
      });
      if (!r.ok) throw new Error(`resend ${r.status}`);
    } else {
      await env.CONTACT_EMAIL!.send({ from: { email: from, name: "Lulox" }, to, replyTo: { email, name }, subject, html, text });
    }
  } catch {
    console.error("[hire-contact] send failed");
    return { status: 502, body: { error: "send_failed" } };
  }
  return { status: 200, body: { ok: true } };
}

/**
 * Native <form method="post"> fallback (no fetch): maps urlencoded/multipart fields to the JSON
 * shape. Turnstile injects its token as `cf-turnstile-response`; it is still verified server-side.
 */
export function bodyFromForm(entries: Iterable<[string, unknown]>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const budget: Record<string, unknown> = {};
  for (const [k, raw] of entries) {
    if (typeof raw !== "string") continue;
    if (k.startsWith("budget.")) {
      const key = k.slice(7);
      budget[key] = raw === "true" ? true : raw === "false" ? false : /^\d+$/.test(raw) ? Number(raw) : raw;
    } else if (k === "cf-turnstile-response") out.turnstileToken = raw;
    else if (["name", "email", "message", "hire_hp", "turnstileToken"].includes(k)) out[k] = raw;
  }
  out.budget = budget;
  return out;
}
