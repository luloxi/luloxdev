"use client";

import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale } from "@/i18n/locale-provider";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

const SITE_KEY = "0x4AAAAAAFYS_U1JH5j5qo8w";
const MAX = 280;

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};

const copy = {
  es: {
    heading: "Pedime una llamada",
    placeholder: "Convenceme de tener una llamada con vos",
    email: "Tu email",
    when: "Fecha y hora propuesta (hora Argentina)",
    google: "Usar mi email de Google",
    signedAs: "Con Google",
    required: "Este campo es obligatorio",
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
    when: "Proposed date and time (Argentina time)",
    google: "Use my Google email",
    signedAs: "Via Google",
    required: "This field is required",
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
  const [when, setWhen] = useState("");
  const [website, setWebsite] = useState("");
  const [token, setToken] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [tsReady, setTsReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const blockTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (blockTimer.current) window.clearTimeout(blockTimer.current);
  }, []);
  const [missing, setMissing] = useState<Record<string, boolean>>({});
  const msgRef = useRef<HTMLTextAreaElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const whenRef = useRef<HTMLInputElement>(null);
  const clearMissing = (k: string) =>
    setMissing((m) => (m[k] ? { ...m, [k]: false } : m));

  const session = authClient.useSession();
  const googleEmail = session.data?.user?.email ?? "";
  useEffect(() => {
    if (googleEmail) setEmail((cur) => cur || googleEmail);
  }, [googleEmail]);

  const len = [...message].length;
  const left = MAX - len;

  useEffect(() => {
    const ts = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
    if (!ts || !widgetRef.current || widgetId.current) return;
    widgetId.current = ts.render(widgetRef.current, {
      sitekey: SITE_KEY,
      appearance: "interaction-only",
      callback: (tok: string) => setToken(tok),
      "expired-callback": () => setToken(""),
    });
  }, [tsReady]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
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
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, email, when, website, token }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setState("ok");
        setMessage("");
        setWhen("");
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

  return (
    <form className="call-form" onSubmit={submit} noValidate>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setTsReady(true)}
      />
      <h2 className="cp-heading">{c.heading}</h2>
      <div className="call-form-card">
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
          <label className="call-form-field">
            <span>{c.when}</span>
            <input
              ref={whenRef}
              onFocus={() => clearMissing("when")}
              onClick={() => clearMissing("when")}
              aria-invalid={missing.when || undefined}
              className={cn(missing.when && "call-form-missing")}
              type="datetime-local"
              required
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
            {missing.when ? <em className="call-form-req">{c.required}</em> : null}
          </label>
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
          <span
            className={cn(
              "call-form-count",
              left <= 20 && "call-form-count-warn",
              left < 0 && "call-form-count-over",
            )}
            aria-live="polite"
          >
            {left}
          </span>
          <button
            type="submit"
            className={cn("call-form-send", blocked && "call-form-send-blocked")}
            disabled={state === "sending" || len > MAX || blocked}
          >
            {state === "sending" ? c.sending : c.send}
          </button>
        </div>
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
