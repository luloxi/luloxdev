import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { cooldownUntil, startCooldown } from "@/lib/contact-cooldown";
import { WHEN_RE, formatWhen } from "@/lib/when-format";

type Env = {
  CONTACT_EMAIL?: { send: (msg: unknown) => Promise<{ messageId?: string }> };
  CONTACT_RL?: { limit: (o: { key: string }) => Promise<{ success: boolean }> };
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  CONTACT_INBOX?: string;
  TURNSTILE_SECRET?: string;
  /** Optional: when set, mail goes through Resend (lulox.com.ar is set up there: DKIM resend._domainkey, return path send.). */
  RESEND_API_KEY?: string;
  BETTER_AUTH_SECRET?: string;
};

const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : "");

/** Cooldown status for this browser/IP (email is unknown until submit). */
export async function GET(request: Request) {
  const { env: rawEnv } = await getCloudflareContext({ async: true });
  const env = rawEnv as unknown as Env;
  if (!env.BETTER_AUTH_SECRET) return NextResponse.json({ retryAt: null });
  const u = new URL(request.url);
  const retryAt = await cooldownUntil(env.BETTER_AUTH_SECRET, {
    fp: str(u.searchParams.get("fp")),
    cid: str(u.searchParams.get("cid")),
  });
  return NextResponse.json({ retryAt }, { headers: { "Cache-Control": "no-store" } });
}

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const DT_RE = WHEN_RE;

/** Submitted local time is America/Buenos_Aires (UTC-3, no DST). */
function calDates(v: string, minutes = 30) {
  const m = DT_RE.exec(v)!;
  const [, y, mo, d, hh, mm] = m.map(Number) as unknown as number[];
  const start = new Date(Date.UTC(y, mo - 1, d, hh + 3, mm));
  const end = new Date(start.getTime() + minutes * 60_000);
  const f = (x: Date) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `${f(start)}/${f(end)}`;
}

function calUrl(email: string, details: string, dates: string) {
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `Lulox | Llamada con ${email}`,
    dates,
    ctz: "America/Buenos_Aires",
    details,
  });
  q.set("add", email);
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
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

  const ids = { fp: str(body.fp), cid: str(body.cid), email };
  if (env.BETTER_AUTH_SECRET) {
    const retryAt = await cooldownUntil(env.BETTER_AUTH_SECRET, ids);
    if (retryAt) {
      return NextResponse.json({ error: "cooldown", retryAt }, { status: 429 });
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

  if (!env.CONTACT_EMAIL && !env.RESEND_API_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const to = env.CONTACT_TO ?? "lucianoolivabianco@gmail.com";
  const from = env.CONTACT_FROM ?? "no-responder@lulox.com.ar";
  const inbox = env.CONTACT_INBOX ?? "hola@lulox.com.ar";
  const en = body.locale === "en";
  const dates = calDates(body.when as string);
  const invite = calUrl(email, message, dates);
  // Punzó #C8102E = favicon stroke / --neon-crimson brand token. White text 5.9:1.
  const buttons = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px"><tr><td align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center" bgcolor="#C8102E" style="border-radius:8px;background:#C8102E"><a href="${esc(invite)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:8px">Agendar e invitar</a></td></tr></table></td></tr></table>`;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Pedido de llamada</title></head><body><div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#241213">
<p style="font-size:17px;line-height:1.5;white-space:pre-wrap;margin:0 0 28px">${esc(message)}</p>
<p style="font-size:40px;font-weight:700;letter-spacing:0.02em;color:#a50021;margin:0;font-variant-numeric:tabular-nums">${when} <span style="font-size:20px;font-weight:600">(UTC-3)</span></p>
${buttons}
<p style="font-size:12px;color:#6b5b5c;margin-top:28px">Enviado desde el formulario de contacto de lulox.com.ar. Respondé este email para contestarle a ${esc(email)}.</p>
</div></body></html>`;
  const text = `${message}\n\n${when} (UTC-3)\n\nAgendar e invitar: ${invite}\n\n--\nEnviado desde el formulario de contacto de lulox.com.ar. Respondé este email para contestarle a ${email}.\n`;

  const fromName = "Lulox";
  const subject = `Pedido de llamada de ${email} (${when} UTC-3)`;
  // Visitor confirmation (Resend only: the Cloudflare binding can only reach the verified address).
  const cSubject = en ? `Got your call request for ${when} (UTC-3)` : `Recibí tu pedido de llamada para el ${when} (UTC-3)`;
  const cText = en
    ? `Hi! I got your call request for ${when} (UTC-3, Argentina time). I'll answer you from ${inbox} soon.\n\nYour message:\n${message}\n\nLuciano (Lulox)\nhttps://lulox.com.ar\n`
    : `¡Hola! Recibí tu pedido de llamada para el ${when} (UTC-3, hora de Argentina). Te respondo pronto desde ${inbox}.\n\nTu mensaje:\n${message}\n\nLuciano (Lulox)\nhttps://lulox.com.ar\n`;
  const cHtml = `<!doctype html><html lang="${en ? "en" : "es"}"><head><meta charset="utf-8"><title>${esc(cSubject)}</title></head><body><div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#241213;font-size:16px;line-height:1.5">
<p>${en ? "Hi! I got your call request for" : "¡Hola! Recibí tu pedido de llamada para el"} <strong>${when} (UTC-3)</strong>${en ? ", Argentina time. I'll answer you from" : ", hora de Argentina. Te respondo pronto desde"} ${esc(inbox)}.</p>
<p style="color:#6b5b5c;margin:20px 0 6px">${en ? "Your message:" : "Tu mensaje:"}</p>
<blockquote style="margin:0;padding:10px 14px;border-left:3px solid #C8102E;white-space:pre-wrap">${esc(message)}</blockquote>
<p style="margin-top:24px">Luciano (Lulox)<br><a href="https://lulox.com.ar">lulox.com.ar</a></p>
</div></body></html>`;
  try {
    if (env.RESEND_API_KEY) {
      const send = async (payload: Record<string, unknown>) => {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: `${fromName} <${from}>`, ...payload }),
        });
        if (!r.ok) throw new Error(`resend ${r.status}`);
      };
      await send({ to: [inbox], reply_to: email, subject, html, text });
      // The confirmation is best effort: Luciano's copy already went out.
      await send({ to: [email], reply_to: inbox, subject: cSubject, html: cHtml, text: cText }).catch((e) =>
        console.error("[contact] confirmation failed", e),
      );
    } else if (env.CONTACT_EMAIL) {
      const mail = (sender: string) =>
        env.CONTACT_EMAIL!.send({ from: { email: sender, name: fromName }, to, replyTo: email, subject, html, text });
      // If the binding rejects the new sender, fall back to the address it is known to accept.
      await mail(from).catch((e) => {
        console.error("[contact] binding rejected sender, retrying as web@", e);
        return mail("web@lulox.com.ar");
      });
    }
  } catch (err) {
    console.error("[contact] send failed", err);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  const retryAt = env.BETTER_AUTH_SECRET
    ? await startCooldown(env.BETTER_AUTH_SECRET, ids)
    : Date.now() + 24 * 60 * 60 * 1000;
  return NextResponse.json({ ok: true, retryAt });
}
