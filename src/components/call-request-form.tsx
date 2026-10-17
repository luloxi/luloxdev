"use client";

import Script from "next/script";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { useLocale } from "@/i18n/locale-provider";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { daysInMonth, formatWhen, partsToWhen, type WhenParts } from "@/lib/when-format";

const SITE_KEY = "0x4AAAAAAFYS_U1JH5j5qo8w";
const MAX = 280;

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};

async function sha256(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Lightweight in-house fingerprint: only its hash leaves the browser. */
async function fingerprint() {
  let canvas = "";
  try {
    const c = document.createElement("canvas");
    c.width = 220;
    c.height = 40;
    const g = c.getContext("2d");
    if (g) {
      g.textBaseline = "top";
      g.font = "16px Arial";
      g.fillStyle = "#c8102e";
      g.fillRect(0, 0, 60, 20);
      g.fillStyle = "#00a4ef";
      g.fillText("lulox ✓ 2026", 4, 12);
      canvas = c.toDataURL();
    }
  } catch {}
  const n = navigator as Navigator & { deviceMemory?: number };
  return sha256(
    [
      n.userAgent,
      n.language,
      n.languages?.join(","),
      n.platform,
      n.hardwareConcurrency,
      n.deviceMemory,
      `${screen.width}x${screen.height}x${screen.colorDepth}`,
      window.devicePixelRatio,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      new Date().getTimezoneOffset(),
      canvas,
    ].join("|"),
  );
}

function clientId() {
  const k = "lulox-cid";
  let id = "";
  try {
    id = localStorage.getItem(k) ?? "";
  } catch {}
  if (!id) {
    const m = document.cookie.match(/(?:^|; )lulox-cid=([^;]+)/);
    id = m?.[1] ?? crypto.randomUUID();
  }
  try {
    localStorage.setItem(k, id);
  } catch {}
  document.cookie = `${k}=${id}; path=/; max-age=31536000; samesite=lax; secure`;
  return id;
}

/** Local mirror of the server cooldown, so the form stays hidden on reload. */
const UNTIL_KEY = "lulox-contact-until";
function readUntil(): number | null {
  try {
    const v = Number(localStorage.getItem(UNTIL_KEY) ?? "");
    return Number.isFinite(v) && v > Date.now() ? v : null;
  } catch {
    return null;
  }
}
function saveUntil(v: number) {
  try {
    localStorage.setItem(UNTIL_KEY, String(v));
  } catch {}
}

/** ~2 s synthesized spooky sting played when a request goes through. */
const STING_MP3 = "/audio/contact-sting.mp3";
const STING_OGG = "/audio/contact-sting.ogg";
function makeSting() {
  const probe = document.createElement("audio");
  const a = new Audio(probe.canPlayType('audio/ogg; codecs="opus"') ? STING_OGG : STING_MP3);
  a.preload = "auto";
  return a;
}

function hms(ms: number) {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(t / 3600))}:${p(Math.floor((t % 3600) / 60))}:${p(t % 60)}`;
}

const copy = {
  es: {
    heading: "Pedime una llamada",
    placeholder: "Convenceme de tener una llamada con vos",
    email: "Tu email",
    when: "Fecha y hora",
    whenTz: "Ver tu hora local y todos los husos horarios (se abre en otra pestaña)",
    y: "Año", mo: "Mes", d: "Día", h: "Hora", mi: "Minutos", ap: "am/pm",
    google: "Usar mi email de Google",
    signedAs: "Con Google",
    required: "Este campo es obligatorio",
    cooldown: "Ya recibí tu mensaje. Podés mandar otro en",
    send: "Enviar",
    sending: "Enviando...",
    ok: "Listo, te llegó a mi bandeja. Te respondo a tu email.",
    errors: {
      invalid_message: "El mensaje tiene que tener entre 1 y 280 caracteres.",
      invalid_email: "Revisá el email.",
      invalid_when: "Elegí fecha y hora.",
      captcha: "No pudimos verificar que sos humano. Probá de nuevo.",
      rate_limited: "Muchos envíos seguidos. Esperá un minuto.",
      generic: "No se pudo enviar. Probá de nuevo en un rato.",
    } as Record<string, string>,
  },
  en: {
    heading: "Ask me for a call",
    placeholder: "Convince me to have a call with you",
    email: "Your email",
    when: "Date and time",
    whenTz: "See your local time and every UTC offset (opens in a new tab)",
    y: "Year", mo: "Month", d: "Day", h: "Hour", mi: "Minutes", ap: "am/pm",
    google: "Use my Google email",
    signedAs: "Via Google",
    required: "This field is required",
    cooldown: "I got your message. You can send another one in",
    send: "Send",
    sending: "Sending...",
    ok: "Done, it landed in my inbox. I'll reply to your email.",
    errors: {
      invalid_message: "The message must be 1 to 280 characters.",
      invalid_email: "Check the email.",
      invalid_when: "Pick a date and time.",
      captcha: "We couldn't verify you're human. Try again.",
      rate_limited: "Too many sends in a row. Wait a minute.",
      generic: "Couldn't send it. Try again in a bit.",
    } as Record<string, string>,
  },
};

export function CallRequestForm() {
  const { locale } = useLocale();
  const c = copy[locale === "en" ? "en" : "es"];
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const EMPTY_WHEN: WhenParts = { y: "", mo: "", d: "", h: "", mi: "", ap: "" };
  const [whenParts, setWhenParts] = useState<WhenParts>(EMPTY_WHEN);
  const when = partsToWhen(whenParts);
  const setWhenPart = (k: keyof WhenParts, v: string) =>
    setWhenParts((p) => {
      const next = { ...p, [k]: v } as WhenParts;
      // Keep the day valid when the month/year changes (e.g. 31 -> Feb).
      if (next.d && Number(next.d) > daysInMonth(next.y, next.mo)) next.d = "";
      return next;
    });
  const [website, setWebsite] = useState("");
  const [token, setToken] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [tsReady, setTsReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [ids, setIds] = useState<{ fp: string; cid: string }>({ fp: "", cid: "" });
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  // "form" normally; "doom" while the success flourish plays; then cooldown hides it.
  const [phase, setPhase] = useState<"form" | "doom">("form");
  const formRef = useRef<HTMLFormElement>(null);
  const sting = useRef<HTMLAudioElement | null>(null);
  useLayoutEffect(() => {
    const u = readUntil();
    if (u) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- event-time / mount-time sync, not render
      setNow(Date.now());
      setRetryAt(u);
    }
  }, []);
  useEffect(() => {
    let live = true;
    void (async () => {
      const cid = clientId();
      const fp = await fingerprint();
      if (!live) return;
      setIds({ fp, cid });
      try {
        const r = await fetch(`/api/contact?fp=${fp}&cid=${encodeURIComponent(cid)}`, {
          cache: "no-store",
        });
        const d = (await r.json()) as { retryAt?: number | null };
        if (live && d.retryAt && d.retryAt > Date.now()) {
          saveUntil(d.retryAt);
          setNow(Date.now());
          setRetryAt(d.retryAt);
        }
      } catch {}
    })();
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (!retryAt) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= retryAt) setRetryAt(null);
    }, 1000);
    return () => window.clearInterval(id);
  }, [retryAt]);
  const cooling = retryAt !== null && retryAt > now;
  const blockTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (blockTimer.current) window.clearTimeout(blockTimer.current);
  }, []);
  const [missing, setMissing] = useState<Record<string, boolean>>({});
  const msgRef = useRef<HTMLTextAreaElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const whenRef = useRef<HTMLSelectElement>(null);
  const clearMissing = (k: string) =>
    setMissing((m) => (m[k] ? { ...m, [k]: false } : m));

  const session = authClient.useSession();
  const googleEmail = session.data?.user?.email ?? "";
  useEffect(() => {
    if (googleEmail) setEmail((cur) => cur || googleEmail);
  }, [googleEmail]);

  const len = [...message].length;
  const left = MAX - len;

  const hidden = cooling && phase !== "doom";
  useEffect(() => {
    if (hidden) {
      // The widget node is gone with the form; render a fresh one if it comes back.
      widgetId.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- event-time / mount-time sync, not render
      setToken("");
      return;
    }
    const ts = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
    if (!ts || !widgetRef.current || widgetId.current) return;
    widgetId.current = ts.render(widgetRef.current, {
      sitekey: SITE_KEY,
      appearance: "interaction-only",
      callback: (tok: string) => setToken(tok),
      "expired-callback": () => setToken(""),
    });
  }, [tsReady, hidden]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (state === "sending" || cooling) return;
    const empties: [string, HTMLElement | null][] = [];
    if (!message.trim()) empties.push(["message", msgRef.current]);
    if (!email.trim()) empties.push(["email", emailRef.current]);
    if (!when) empties.push(["when", whenRef.current]);
    if (empties.length > 0) {
      setMissing(Object.fromEntries(empties.map(([k]) => [k, true])));
      setBlocked(true);
      if (blockTimer.current) window.clearTimeout(blockTimer.current);
      blockTimer.current = window.setTimeout(() => setBlocked(false), 3000);
      empties[0][1]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!token) {
      setState("error");
      setError(c.errors.captcha);
      return;
    }
    // Unlock the sting inside the click gesture (iOS), play it later on success.
    if (!sting.current) {
      const a = makeSting();
      a.muted = true;
      a.play()
        .then(() => {
          a.pause();
          a.currentTime = 0;
          a.muted = false;
        })
        .catch(() => {
          a.muted = false;
        });
      sting.current = a;
    }
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, email, when, website, token, ...ids }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        retryAt?: number;
      };
      const success = res.ok && !!data.ok;
      if (success) doom();
      if (data.retryAt) {
        saveUntil(data.retryAt);
        // eslint-disable-next-line react-hooks/purity -- event-time / mount-time sync, not render
        setNow(Date.now());
        setRetryAt(data.retryAt);
      }
      if (data.error === "cooldown") {
        setState("idle");
        return;
      }
      if (res.ok && data.ok) {
        setState("ok");
        setMessage("");
        setWhenParts(EMPTY_WHEN);
      } else {
        setState("error");
        setError(c.errors[data.error ?? ""] ?? c.errors.generic);
      }
    } catch {
      setState("error");
      setError(c.errors.generic);
    } finally {
      const ts = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
      if (ts && widgetId.current) ts.reset(widgetId.current);
      setToken("");
    }
  }

  function doom() {
    const a = sting.current ?? makeSting();
    a.muted = false;
    a.currentTime = 0;
    a.play().catch(() => undefined);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const form = formRef.current;
    if (reduce || !form?.animate) return; // cooldown hides it right away
    setPhase("doom");
    // Glow ramps to max (CSS), then the whole form fades and collapses away.
    window.setTimeout(() => {
      const h = form.offsetHeight;
      form.style.overflow = "hidden";
      const anim = form.animate(
        [
          { height: `${h}px`, opacity: 1, filter: "brightness(1.4)", transform: "scale(1)" },
          { height: `${h}px`, opacity: 0.35, filter: "brightness(2) blur(1px)", transform: "scale(0.985)", offset: 0.4 },
          { height: "0px", opacity: 0, filter: "brightness(0.6) blur(4px)", transform: "scale(0.96)" },
        ],
        { duration: 900, easing: "cubic-bezier(.6,0,.4,1)", fill: "forwards" },
      );
      anim.onfinish = () => setPhase("form");
    }, 1150);
  }

  // Hidden while the server says this visitor can't send again yet.
  if (hidden) return null;

  return (
    <form
      ref={formRef}
      className={cn("call-form", phase === "doom" && "call-form-doom")}
      onSubmit={submit}
      noValidate
      aria-hidden={phase === "doom" || undefined}
    >
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setTsReady(true)}
      />
      <h2 className="cp-heading">{c.heading}</h2>
      <div className="call-form-card">
        {/* Counter on the top-right of the message box */}
        <div className="call-form-count-row">
          <span
            className={cn(
              "call-form-count",
              left <= 20 && "call-form-count-warn",
              left < 0 && "call-form-count-over",
            )}
            aria-live="polite"
            title={`${left}`}
          >
            {len}/{MAX}
          </span>
        </div>
        <textarea
          ref={msgRef}
          onFocus={() => clearMissing("message")}
          aria-invalid={missing.message || undefined}
          className={cn("call-form-text", missing.message && "call-form-missing")}
          rows={4}
          maxLength={MAX}
          required
          placeholder={c.placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-label={c.placeholder}
        />
        {missing.message ? <p className="call-form-req">{c.required}</p> : null}
        <div className="call-form-row">
          <label className="call-form-field">
            <span className="call-form-email-head">
              {c.email}
              {googleEmail ? (
                <em className="call-form-google-on">{c.signedAs}</em>
              ) : (
                <button
                  type="button"
                  className="call-form-google"
                  onClick={() =>
                    void authClient.signIn.social({
                      provider: "google",
                      callbackURL: "/contacto",
                    })
                  }
                >
                  {c.google}
                </button>
              )}
            </span>
            <input
              ref={emailRef}
              onFocus={() => clearMissing("email")}
              aria-invalid={missing.email || undefined}
              className={cn(missing.email && "call-form-missing")}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {missing.email ? <em className="call-form-req">{c.required}</em> : null}
          </label>
          <div className="call-form-field" role="group" aria-labelledby="call-when-label">
            <span id="call-when-label" className="call-form-when-head">
              {c.when}{" "}
              <span aria-hidden>🇦🇷</span>{" "}
              <a
                href="https://time.is/UTC-3"
                target="_blank"
                rel="noopener noreferrer"
                className="call-form-tz"
                title={c.whenTz}
                aria-label={`UTC-3. ${c.whenTz}`}
              >
                UTC-3
              </a>
            </span>
            <WhenPicker
              parts={whenParts}
              set={(k, v) => {
                clearMissing("when");
                setWhenPart(k, v);
              }}
              firstRef={whenRef}
              invalid={!!missing.when}
              labels={c}
            />
            {when ? <em className="call-form-when-echo">{formatWhen(when)} (UTC-3)</em> : null}
            {missing.when ? <em className="call-form-req">{c.required}</em> : null}
          </div>
        </div>
        <input
          className="call-form-hp"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <div ref={widgetRef} className="call-form-turnstile" />
        <div className="call-form-foot">
          <button
            type="submit"
            className={cn("call-form-send", blocked && "call-form-send-blocked")}
            disabled={state === "sending" || len > MAX || blocked || cooling}
          >
            {state === "sending" ? c.sending : c.send}
          </button>
        </div>
        {cooling && phase !== "doom" ? (
          <p className="call-form-msg call-form-cooldown" role="status" aria-live="off">
            {c.cooldown}{" "}
            <strong className="call-form-countdown">{hms((retryAt ?? 0) - now)}</strong>
          </p>
        ) : null}
        {state === "ok" ? (
          <p className="call-form-msg call-form-ok" role="status">{c.ok}</p>
        ) : null}
        {state === "error" ? (
          <p className="call-form-msg call-form-err" role="alert">{error}</p>
        ) : null}
      </div>
    </form>
  );
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Date/time picker that always reads year-month-day and 12-hour am/pm,
 * whatever the browser's locale (native datetime inputs reorder by locale).
 * Plain selects: on phones they open the native wheel/list, so it stays
 * thumb-friendly.
 */
function WhenPicker({
  parts,
  set,
  firstRef,
  invalid,
  labels,
}: {
  parts: WhenParts;
  set: (k: keyof WhenParts, v: string) => void;
  firstRef: RefObject<HTMLSelectElement | null>;
  invalid: boolean;
  labels: { y: string; mo: string; d: string; h: string; mi: string; ap: string };
}) {
  const [thisYear] = useState(() => new Date().getFullYear());
  const years = [thisYear, thisYear + 1];
  const days = daysInMonth(parts.y, parts.mo);
  const sel = (k: keyof WhenParts, label: string, ph: string, opts: { v: string; t: string }[], ref?: RefObject<HTMLSelectElement | null>) => (
    <select
      ref={ref}
      aria-label={label}
      aria-invalid={(invalid && !parts[k]) || undefined}
      className={cn("call-form-sel", `call-form-sel-${k}`, invalid && !parts[k] && "call-form-missing", !parts[k] && "is-empty")}
      value={parts[k]}
      onChange={(e) => set(k, e.target.value)}
    >
      <option value="" disabled>
        {ph}
      </option>
      {opts.map((o) => (
        <option key={o.v} value={o.v}>
          {o.t}
        </option>
      ))}
    </select>
  );
  const range = (a: number, b: number, f = pad2) => Array.from({ length: b - a + 1 }, (_, i) => ({ v: f(a + i), t: f(a + i) }));
  return (
    <span className="call-form-when">
      <span className="call-form-when-date">
        {sel("y", labels.y, labels.y === "Año" ? "AAAA" : "YYYY", years.map((y) => ({ v: String(y), t: String(y) })), firstRef)}
        <span aria-hidden>-</span>
        {sel("mo", labels.mo, "MM", range(1, 12))}
        <span aria-hidden>-</span>
        {sel("d", labels.d, "DD", range(1, days))}
      </span>
      <span className="call-form-when-time">
        {sel("h", labels.h, "hh", range(1, 12, String))}
        <span aria-hidden>:</span>
        {sel("mi", labels.mi, "mm", ["00", "15", "30", "45"].map((m) => ({ v: m, t: m })))}
        {sel("ap", labels.ap, "am/pm", [
          { v: "am", t: "am" },
          { v: "pm", t: "pm" },
        ])}
      </span>
    </span>
  );
}
