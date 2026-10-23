"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CALL_BOOKING_URL, site } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";
import { MagicHr } from "@/components/magic-hr";
import { clampHours, estimate, hoursDigits, maxHoursFor, PRICING, type Complexity, type Mode } from "@/lib/pricing";
import { charCount, clampMessage, MAX_MESSAGE } from "@/lib/hire-limits";
import { LimitModal } from "@/components/limit-modal";

const copy = {
  es: {
    intro: "Tu presupuesto en segundos.",
    mode: "Modalidad",
    modes: { project: "Por proyecto", hourly: "Por hora" } as Record<Mode, string>,
    modeHint: {
      project: "Un entregable cerrado: investigación, desarrollo, testing, pulido, feedback, correcciones y entrega.",
      hourly: "Consultoría, soporte o trabajo puntual, remoto o presencial.",
    } as Record<Mode, string>,
    size: "Tamaño",
    sizes: { s: "Chico", m: "Mediano", l: "Grande" },
    hours: "Horas estimadas",
    hoursInput: (max: number) => `Horas, de 1 a ${max}`,
    complexity: "Complejidad",
    cx: {
      low: ["Baja", "Lo liviano: consultas, consejos y cosas que resuelvo tranqui."],
      medium: ["Media", "Le pongo foco de verdad, pero sin salir a investigar."],
      high: ["Alta", "Toda mi atención, y me pongo a investigar a fondo."],
    } as Record<Complexity, [string, string]>,
    conditions: "Condiciones",
    onSite: "Presencial",
    projectOnSite: "Requiere presencialidad",
    days: "Días presenciales",
    dayUnit: ["día", "días"],
    travel: "Viático*",
    travelNote: "*El viático puede variar según la distancia.",
    extra: "Urgencia",
    extraDays: "Días de urgencia",
    lines: { work: "Trabajo", discount: "Descuento por volumen", onSite: "Recargo presencial", travel: "Viático*", extra: "Urgencia" },
    estimate: "Estimación",
    total: "Total estimado",
    deposit: "Anticipo (50%)",
    perHour: "/h",
    note: `Estimación orientativa, no es un presupuesto final. Lo ajustamos juntos en la llamada. Presupuestos válidos ${PRICING.validityDays} días; 50% de anticipo y 50% contra entrega.`,
    formula: "Cómo calculo",
    fProject: "(horas × complejidad) + presencial/día + viático/día + (urgencia × día)",
    fHourly: "(horas × complejidad) + presencial + viático + urgencia",
    cta: "Videollamada",
    write: "Escribime",
    contact: "Contacto",
    form: { name: "Nombre", email: "Tu email", message: "Mensaje", ph: "Contame qué necesitás…", budget: "Presupuesto que se envía", send: "Enviar", sending: "Enviando…", limitTitle: "Máximo 280 caracteres", limitClose: "Entendido", agents: "Formulario de contacto: nombre, email y mensaje (hasta 280 caracteres). Para enviarlo hay que pasar la verificación de Cloudflare Turnstile.",  ok: "¡Listo! Te respondo a tu email.", err: { invalid_name: "Falta tu nombre.", invalid_email: "Revisá el email.", invalid_message: "El mensaje debe tener entre 1 y 280 caracteres.", rate_limited: "Demasiados envíos. Probá en un rato.", captcha_failed: "Falta la verificación anti-bots. Esperá el tilde y probá de nuevo.", default: "No se pudo enviar. Probá de nuevo." } as Record<string, string>, yes: "sí", no: "no" },
  },
  en: {
    intro: "Your quote in seconds.",
    mode: "Engagement",
    modes: { project: "Per project", hourly: "Per hour" } as Record<Mode, string>,
    modeHint: {
      project: "A closed deliverable: research, build, testing, polish, feedback, fixes and delivery.",
      hourly: "Consulting, support or one-off work, remote or on-site.",
    } as Record<Mode, string>,
    size: "Size",
    sizes: { s: "Small", m: "Medium", l: "Large" },
    hours: "Estimated hours",
    hoursInput: (max: number) => `Hours, 1 to ${max}`,
    complexity: "Complexity",
    cx: {
      low: ["Low", "The light stuff: questions, advice and things I handle calmly."],
      medium: ["Medium", "Real focus from me, no research needed."],
      high: ["High", "My full attention, plus digging into research."],
    } as Record<Complexity, [string, string]>,
    conditions: "Conditions",
    onSite: "On-site",
    projectOnSite: "Requires on-site work",
    days: "On-site days",
    dayUnit: ["day", "days"],
    travel: "Travel*",
    travelNote: "*Travel may vary with distance.",
    extra: "Urgency",
    extraDays: "Urgency days",
    lines: { work: "Work", discount: "Volume discount", onSite: "On-site surcharge", travel: "Travel*", extra: "Urgency" },
    estimate: "Estimate",
    total: "Estimated total",
    deposit: "Deposit (50%)",
    perHour: "/h",
    note: `Ballpark estimate, not a final quote. We fine-tune it together on the call. Quotes are valid for ${PRICING.validityDays} days; 50% upfront, 50% on delivery.`,
    formula: "How I calculate",
    fProject: "(hours × complexity) + on-site/day + travel/day + (urgency × day)",
    fHourly: "(hours × complexity) + on-site + travel + urgency",
    cta: "Video call",
    write: "Write me",
    contact: "Contact",
    form: { name: "Name", email: "Your email", message: "Message", ph: "Tell me what you need…", budget: "Quote that will be sent", send: "Send", sending: "Sending…", limitTitle: "280 characters max", limitClose: "Got it", agents: "Contact form: name, email and message (up to 280 characters). Sending it requires passing the Cloudflare Turnstile check.",  ok: "Done! I'll reply to your email.", err: { invalid_name: "Your name is missing.", invalid_email: "Check the email.", invalid_message: "Message must be 1–280 characters.", rate_limited: "Too many sends. Try again later.", captcha_failed: "Anti-bot check missing. Wait for the checkmark and try again.", default: "Couldn't send. Try again." } as Record<string, string>, yes: "yes", no: "no" },
  },
};

const money = (n: number) => `${n < 0 ? "-" : ""}US$ ${Math.abs(Math.round(n)).toLocaleString("en-US")}`;

function useCountUp(value: number) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 450);
      const v = a + (value - a) * (1 - Math.pow(1 - k, 3));
      setShown(v);
      from.current = v;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return shown;
}

export function HireCalculator() {
  const { locale } = useLocale();
  const c = copy[locale === "en" ? "en" : "es"];
  const [mode, setMode] = useState<Mode>(PRICING.defaults.mode);
  const [hours, setHours] = useState(PRICING.defaults[PRICING.defaults.mode].hours);
  const [complexity, setComplexity] = useState<Complexity>(PRICING.defaults.project.complexity);
  const [onSite, setOnSite] = useState(false);
  const [days, setDays] = useState(1);
  const [extra, setExtra] = useState(false);
  const [extraDays, setExtraDays] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  // Text being typed in the hours box (null = show the committed value).
  const [hoursText, setHoursText] = useState<string | null>(null);
  // Result of a native (no-fetch) form post comes back as ?contacto=…: reopen the form to show it.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("contacto")) return;
    const id = requestAnimationFrame(() => setFormOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const r = estimate({ mode, hours, complexity, extra, onSite, onSiteDays: days, extraDays });
  const total = useCountUp(r.total);
  const maxH = maxHoursFor(mode);
  // Hours box: digits only; over the max snaps to the max right away, 0/empty becomes 1 on blur.
  const onHoursText = (raw: string) => {
    const d = hoursDigits(raw);
    const n = Number(d);
    if (d && n > maxH) { setHoursText(String(maxH)); setHours(maxH); return; }
    setHoursText(d);
    if (n >= 1) setHours(clampHours(mode, n));
  };
  const commitHoursText = () => {
    if (hoursText !== null) setHours(clampHours(mode, Number(hoursText)));
    setHoursText(null);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setHours(PRICING.defaults[m].hours);
    setHoursText(null);
  };

  return (
    <div className="hire" data-mode={mode} data-cx={complexity}>
      <p className="hire-intro">{c.intro}</p>

      <fieldset className="hire-field">
        <legend className="hire-label">{c.mode}</legend>
        <div className="hire-seg" role="radiogroup" aria-label={c.mode}>
          {(["hourly", "project"] as Mode[]).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} className="hire-seg-btn" onClick={() => switchMode(m)}>
              {c.modes[m]}
            </button>
          ))}
        </div>
        <p className="hire-hint">{c.modeHint[mode]}</p>
      </fieldset>

      <fieldset className="hire-field">
        <legend className="hire-label">
          {c.hours} <output className="hire-hours">{hours}h</output>
        </legend>
        {mode === "project" ? (
          <div className="hire-chips">
            {(Object.keys(PRICING.sizes) as (keyof typeof PRICING.sizes)[]).map((k) => (
              <button key={k} type="button" className="hire-chip" aria-pressed={hours === PRICING.sizes[k]} onClick={() => setHours(PRICING.sizes[k])}>
                {c.sizes[k]} <span>~{PRICING.sizes[k]}h</span>
              </button>
            ))}
          </div>
        ) : null}
        <div className="hire-hours-row">
        <input
          className="hire-range"
          type="range"
          min={1}
          max={maxH}
          step={1}
          value={Math.min(hours, maxH)}
          aria-label={c.hours}
          style={{ ["--range-p" as string]: `${((Math.min(hours, maxH) - 1) / (maxH - 1)) * 100}%` }}
          onChange={(e) => { setHoursText(null); setHours(Number(e.target.value)); }}
        />
        <input
          className="hire-hours-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          enterKeyHint="done"
          autoComplete="off"
          aria-label={c.hoursInput(maxH)}
          value={hoursText ?? String(Math.min(hours, maxH))}
          onChange={(e) => onHoursText(e.target.value)}
          onBlur={commitHoursText}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
          onFocus={(e) => { const el = e.currentTarget; el.select(); const vv = window.visualViewport; const fit = () => { if (document.activeElement === el) el.scrollIntoView({ block: "center" }); }; vv?.addEventListener("resize", fit); el.addEventListener("blur", () => vv?.removeEventListener("resize", fit), { once: true }); }}
        />
        </div>
      </fieldset>

      <fieldset className="hire-field">
        <legend className="hire-label">{c.complexity}</legend>
        <div className="hire-cx" role="radiogroup" aria-label={c.complexity}>
          {(["low", "medium", "high"] as Complexity[]).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={complexity === k} className={`hire-cx-card hire-cx-${k}`} onClick={() => setComplexity(k)}>
              <span className="hire-cx-name">{c.cx[k][0]}</span>
              <span className="hire-cx-rate">US$ {PRICING.rates[k]}{c.perHour}</span>
              <span className="hire-cx-desc">{c.cx[k][1]}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="hire-field">
        <legend className="hire-label">{c.conditions}</legend>
        <div className="hire-toggles">
          <Toggle
            on={onSite}
            set={setOnSite}
            label={mode === "project" ? c.projectOnSite : c.onSite}
            sub={`+US$ ${PRICING.onSiteSurcharge} · ${c.travel} +US$ ${PRICING.travel}${mode === "project" ? ` / ${c.dayUnit[0]}` : ""}`}
          />
          {mode === "project" && onSite ? (
            <div className="hire-stepper" role="group" aria-label={c.days}>
              <span className="hire-stepper-label">{c.days}</span>
              <button type="button" aria-label="−" disabled={days <= 1} onClick={() => setDays((d) => Math.max(1, d - 1))}>−</button>
              <output aria-live="polite">{days}</output>
              <button type="button" aria-label="+" disabled={days >= PRICING.maxOnSiteDays} onClick={() => setDays((d) => Math.min(PRICING.maxOnSiteDays, d + 1))}>+</button>
            </div>
          ) : null}
          <Toggle on={extra} set={setExtra} label={c.extra} sub={`+US$ ${PRICING.extra}${mode === "project" ? ` × ${c.dayUnit[0]}` : ""}`} />
          {mode === "project" && extra ? (
            <div className="hire-stepper" role="group" aria-label={c.extraDays}>
              <span className="hire-stepper-label">{c.extraDays}</span>
              <button type="button" aria-label="−" disabled={extraDays <= 1} onClick={() => setExtraDays((d) => Math.max(1, d - 1))}>−</button>
              <output aria-live="polite">{extraDays}</output>
              <button type="button" aria-label="+" disabled={extraDays >= PRICING.maxUrgencyDays} onClick={() => setExtraDays((d) => Math.min(PRICING.maxUrgencyDays, d + 1))}>+</button>
            </div>
          ) : null}
        </div>
      </fieldset>

      <section className="hire-receipt" aria-live="polite">
        <div className="hire-receipt-top">
          <h3 className="hire-receipt-title">{c.estimate}</h3>
          <span className="hire-receipt-mode">{c.modes[mode]}</span>
        </div>
        <ul className="hire-lines">
          {r.lines.map((l) => (
            <li key={l.id}>
              <span>
                {c.lines[l.id]}
                {l.id === "work" ? <em> {hours}h × US$ {PRICING.rates[complexity]}</em> : null}
                {l.id === "discount" ? <em> -{l.pct}%</em> : null}
                {l.days && mode === "project" ? <em> {l.days} {c.dayUnit[l.days === 1 ? 0 : 1]} × US$ {l.amount / l.days}</em> : null}
              </span>
              <span>{money(l.amount)}</span>
            </li>
          ))}
        </ul>
        <div className="hire-total">
          <span>{c.total}</span>
          <strong>~{money(total)}</strong>
        </div>
        <div className="hire-deposit">
          <span>{c.deposit}</span>
          <span>{money(r.deposit)}</span>
        </div>
        {r.lines.some((l) => l.id === "travel") ? <p className="hire-note">{c.travelNote}</p> : null}
        <p className="hire-note">{c.note}</p>
        <p className="hire-formula">
          <span>{c.formula}:</span>
          <code>{mode === "project" ? c.fProject : c.fHourly}</code>
        </p>
      </section>

      <div className="hire-ctas">
        <button type="button" className="hire-btn hire-act" aria-expanded={formOpen} aria-controls="hire-form-panel" onClick={() => setFormOpen((o) => !o)} data-testid="hire-write">
          {c.write}
          <span className="hire-btn-rainbow" aria-hidden />
        </button>
        <HireForm
          open={formOpen}
          c={c}
          budget={{ mode, hours: Math.min(hours, maxH), complexity, onSite, days, extra, extraDays: mode === "project" ? extraDays : 1 }}
          rows={[
            [c.total, money(r.total)],
            [c.mode, c.modes[mode]],
            [c.hours, `${Math.min(hours, maxH)}h · ${c.cx[complexity][0]} (US$ ${PRICING.rates[complexity]}${c.perHour})`],
            [c.onSite, onSite ? (mode === "project" ? `${c.form.yes}, ${days} ${c.dayUnit[days === 1 ? 0 : 1]}` : c.form.yes) : c.form.no],
            [c.extra, extra ? (mode === "project" ? `${c.form.yes}, ${extraDays} ${c.dayUnit[extraDays === 1 ? 0 : 1]}` : c.form.yes) : c.form.no],
          ]}
        />
        <a className="hire-act hire-act-call" href={CALL_BOOKING_URL} target="_blank" rel="noopener noreferrer" data-testid="hire-call-cta">
          {c.cta}
        </a>
        <Link className="hire-act hire-act-contact" href="/contacto">
          {c.contact}
        </Link>
      </div>

    </div>
  );
}

function Toggle({ on, set, label, sub, disabled }: { on: boolean; set: (v: boolean) => void; label: string; sub: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} className="hire-toggle" onClick={() => set(!on)}>
      <span className="hire-toggle-knob" aria-hidden />
      <span className="hire-toggle-text">
        <span>{label}</span>
        <small>{sub}</small>
      </span>
    </button>
  );
}

type Copy = (typeof copy)["es"];

function HireForm({ open, c, budget, rows }: { open: boolean; c: Copy; budget: Record<string, unknown>; rows: [string, string][] }) {
  const first = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  // Mobile: reveal first, then focus. Focusing a field that is still collapsed/below the fold
  // opens the keyboard over nothing. Wait for the expand transition (instant with reduced motion),
  // scroll the field to the top of the visual viewport, focus, and re-align once the keyboard resizes it.
  useEffect(() => {
    if (!open) return;
    const el = first.current;
    const pn = panel.current;
    if (!el || !pn) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vv = window.visualViewport;
    let done = false;
    const align = () => el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    const onResize = () => {
      if (document.activeElement === el) align();
    };
    const reveal = () => {
      if (done) return;
      done = true;
      align();
      el.focus({ preventScroll: true });
      vv?.addEventListener("resize", onResize);
    };
    const onEnd = (e: TransitionEvent) => {
      if (e.target === pn && e.propertyName === "grid-template-rows") reveal();
    };
    let t = 0;
    if (reduce) reveal();
    else {
      pn.addEventListener("transitionend", onEnd);
      t = window.setTimeout(reveal, 500);
    }
    const stop = window.setTimeout(() => vv?.removeEventListener("resize", onResize), 1500);
    return () => {
      pn.removeEventListener("transitionend", onEnd);
      window.clearTimeout(t);
      window.clearTimeout(stop);
      vv?.removeEventListener("resize", onResize);
    };
  }, [open]);
  const f = c.form;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [err, setErr] = useState("");
  const [limitHit, setLimitHit] = useState<{ kind: "trimmed" | "limit"; nonce: number } | null>(null);
  const msgRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const res = new URLSearchParams(window.location.search).get("contacto");
    if (!res) return;
    const id = requestAnimationFrame(() => {
      if (res === "ok") setState("ok");
      else { setState("error"); setErr(f.err[res] ?? f.err.default); }
    });
    return () => cancelAnimationFrame(id);
  }, [f]);
  const { box: tsBox, token, reset: resetTs } = useTurnstile(open);
  const used = charCount(message);
  const left = Math.max(0, MAX_MESSAGE - used);
  const atLimit = used >= MAX_MESSAGE;
  // Hard limit by code point (same as the server). No native maxLength: it counts UTF-16 units
  // (an emoji would count 2 there and 1 here). Going over or reaching it opens one modal; repeated
  // pastes restart that modal's countdown instead of stacking new ones.
  const onMessage = (v: string) => {
    const r = clampMessage(message, v);
    setMessage(r.value);
    if (r.event) { const kind = r.event; setLimitHit((h) => ({ kind, nonce: (h?.nonce ?? 0) + 1 })); }
  };
  const closeLimit = () => {
    setLimitHit(null);
    requestAnimationFrame(() => msgRef.current?.focus({ preventScroll: true }));
  };
  // Mobile: keep the focused field (and the limit alert under it) above the on-screen keyboard.
  const keepVisible = (e: React.FocusEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const vv = window.visualViewport;
    const fit = () => { if (document.activeElement === el) el.scrollIntoView({ block: "center" }); };
    vv?.addEventListener("resize", fit);
    el.addEventListener("blur", () => vv?.removeEventListener("resize", fit), { once: true });
  };

  const reveal = () =>
    requestAnimationFrame(() => status.current?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setErr("");
    try {
      const res = await fetch("/api/hire-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website, budget, turnstileToken: token }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      resetTs(); // tokens are single-use
      if (res.ok && j.ok) {
        setState("ok");
        reveal();
        setMessage("");
      } else {
        setState("error");
        setErr(f.err[j.error ?? ""] ?? f.err.default);
        reveal();
      }
    } catch {
      setState("error");
      setErr(f.err.default);
      reveal();
    }
  };

  return (
    <div ref={panel} id="hire-form-panel" className="hire-form-panel" data-open={open} inert={!open}>
    <form className="hire-form" onSubmit={submit} data-testid="hire-form" method="post" action="/api/hire-contact" aria-describedby="hire-form-agents">
      <p id="hire-form-agents" className="sr-only">{f.agents}</p>
      <div className="hire-form-row">
        <label className="hire-form-field" htmlFor="hire-name">
          <span>{f.name}</span>
          <input ref={first} id="hire-name" name="name" type="text" required maxLength={80} autoComplete="name" autoCapitalize="words" enterKeyHint="next" value={name} onFocus={keepVisible} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="hire-form-field" htmlFor="hire-email">
          <span>{f.email}</span>
          <input id="hire-email" name="email" required type="email" inputMode="email" autoCapitalize="none" spellCheck={false} enterKeyHint="next" maxLength={254} autoComplete="email" value={email} onFocus={keepVisible} onChange={(e) => setEmail(e.target.value)} />
        </label>
      </div>
      <label className="hire-form-field" htmlFor="hire-message">
        <span className="hire-form-msg-label">
          {f.message} <output id="hire-message-count" htmlFor="hire-message" className={`hire-form-count${atLimit ? " is-over" : left <= 20 ? " is-low" : ""}`}>{left}</output>
        </span>
        <textarea ref={msgRef} id="hire-message" name="message" required rows={4} autoComplete="off" enterKeyHint="send" placeholder={f.ph} value={message} aria-describedby="hire-message-count" onFocus={keepVisible} onChange={(e) => onMessage(e.target.value)} />
      </label>
      {/* Honeypot: odd name so browsers never autofill it. */}
      <label className="hire-hp" aria-hidden="true">
        Leave empty <input name="hire_hp" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>
      {/* Native (no-fetch) POST fallback: the server reads the same budget fields. */}
      {Object.entries(budget).map(([k, v]) => <input key={k} type="hidden" name={`budget.${k}`} value={String(v)} />)}
      <div className="hire-form-budget" role="group" aria-label={f.budget}>
        <span className="hire-form-budget-title">{f.budget}</span>
        <dl>
          {rows.map(([k, v], i) => (
            <div key={i} className={i === 0 ? "is-total" : undefined}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div ref={tsBox} className="hire-turnstile" />
      <MagicHr className="hire-form-hr" />
      <div className="hire-form-actions">
        <button type="submit" className="hire-btn hire-form-send" disabled={state === "sending" || used === 0 || !token}>
          {state === "sending" ? f.sending : f.send}
          <span className="hire-btn-rainbow" aria-hidden />
        </button>
        <p ref={status} className="hire-form-status" role="status">{state === "ok" ? f.ok : state === "error" ? err : ""}</p>
      </div>
    </form>
    {limitHit ? (
      <LimitModal
        nonce={limitHit.nonce}
        title={f.limitTitle}
        close={f.limitClose}
        onClose={closeLimit}
      />
    ) : null}
    </div>
  );
}

type TurnstileApi = {
  render: (el: HTMLElement, o: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window { turnstile?: TurnstileApi }
}

const TS_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let tsLoad: Promise<TurnstileApi> | null = null;
function loadTurnstile(): Promise<TurnstileApi> {
  tsLoad ??= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const s = document.createElement("script");
    s.src = TS_SRC;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    s.onerror = () => { tsLoad = null; reject(new Error("turnstile")); };
    document.head.appendChild(s);
  });
  return tsLoad;
}

/** Cloudflare Turnstile (managed) rendered once the form opens, matching the site theme. */
function useTurnstile(active: boolean) {
  const box = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);
  const [token, setToken] = useState("");
  useEffect(() => {
    if (!active || id.current || !box.current) return;
    let alive = true;
    loadTurnstile()
      .then((ts) => {
        if (!alive || !box.current || id.current) return;
        id.current = ts.render(box.current, {
          sitekey: site.turnstileSiteKey,
          theme: document.documentElement.classList.contains("light") ? "light" : "dark",
          language: document.documentElement.lang || "auto",
          size: "flexible",
          callback: (t: string) => setToken(t),
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [active]);
  useEffect(() => () => { if (id.current) window.turnstile?.remove(id.current); }, []);
  const reset = () => {
    setToken("");
    if (id.current) window.turnstile?.reset(id.current);
  };
  return { box, token, reset };
}
