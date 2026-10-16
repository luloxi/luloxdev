import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

type Env = {
  CONTACT_EMAIL?: { send: (msg: unknown) => Promise<{ messageId?: string }> };
  CONTACT_RL?: { limit: (o: { key: string }) => Promise<{ success: boolean }> };
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  TURNSTILE_SECRET?: string;
};

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const DT_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/** "2026-10-20T15:30" -> "2026, 10, 20 03:30 PM" */
function formatWhen(v: string) {
  const m = DT_RE.exec(v);
  if (!m) return null;
  const [, y, mo, d, hh, mm] = m;
  const h = Number(hh);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${y}, ${mo}, ${d} ${String(h12).padStart(2, "0")}:${mm} ${h < 12 ? "AM" : "PM"}`;
}

/** Submitted local time is America/Buenos_Aires (UTC-3, no DST). */
function calDates(v: string, minutes = 30) {
  const m = DT_RE.exec(v)!;
  const [, y, mo, d, hh, mm] = m.map(Number) as unknown as number[];
  const start = new Date(Date.UTC(y, mo - 1, d, hh + 3, mm));
  const end = new Date(start.getTime() + minutes * 60_000);
  const f = (x: Date) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `${f(start)}/${f(end)}`;
}

function calUrl(email: string, details: string, dates: string, invite: boolean) {
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `Llamada con ${email}`,
    dates,
    ctz: "America/Buenos_Aires",
    details,
  });
  if (invite) q.set("add", email);
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

function button(href: string, label: string, bg: string) {
  return `<td style="padding:0 8px 8px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${bg}" style="border-radius:8px;background:${bg}"><a href="${esc(href)}" target="_blank" style="display:inline-block;padding:12px 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px">${label}</a></td></tr></table></td>`;
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const when = typeof body.when === "string" ? formatWhen(body.when) : null;
  const token = typeof body.token === "string" ? body.token : "";

  if (!message || [...message].length > 280) {
    return NextResponse.json({ error: "invalid_message" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (!when) {
    return NextResponse.json({ error: "invalid_when" }, { status: 400 });
  }

  const { env: rawEnv } = await getCloudflareContext({ async: true });
  const env = rawEnv as unknown as Env;
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";

  if (env.CONTACT_RL) {
    const { success } = await env.CONTACT_RL.limit({ key: `contact:${ip}` });
    if (!success) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  }

  if (!env.TURNSTILE_SECRET) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  form.append("remoteip", ip);
  const verify = (await (
    await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    })
  ).json()) as { success?: boolean };
  if (!verify.success) {
    return NextResponse.json({ error: "captcha" }, { status: 400 });
  }

  if (!env.CONTACT_EMAIL) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const to = env.CONTACT_TO ?? "lucianoolivabianco@gmail.com";
  const from = env.CONTACT_FROM ?? "web@lulox.com.ar";
  const dates = calDates(body.when as string);
  const invite = calUrl(email, message, dates, true);
  const mine = calUrl(email, message, dates, false);
  const reply = `mailto:${email}?subject=${encodeURIComponent("Re: Contacto en Lulox Web")}`;
  const buttons = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px"><tr>${button(invite, "Agendar e invitar", "#c8102e")}${button(mine, "Solo mi calendario", "#0078c8")}${button(reply, "Responder", "#4e8a00")}</tr></table>`;
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#241213">
<p style="font-size:17px;line-height:1.5;white-space:pre-wrap;margin:0 0 28px">${esc(message)}</p>
<p style="font-size:40px;font-weight:700;letter-spacing:0.02em;color:#a50021;margin:0;font-variant-numeric:tabular-nums">${when}</p>
${buttons}
</div>`;
  const text = `${message}\n\n${when}\n\nAgendar e invitar: ${invite}\nSolo mi calendario: ${mine}\nResponder: ${reply}\n`;

  try {
    await env.CONTACT_EMAIL.send({
      from: { email: from, name: "Lulox Web" },
      to,
      replyTo: email,
      subject: `Contacto en Lulox Web de ${email}`,
      html,
      text,
    });
  } catch (err) {
    console.error("[contact] send failed", err);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
