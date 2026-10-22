"use client";

import { useEffect, useRef, useState } from "react";
import { CALL_BOOKING_URL } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";
import { estimate, PRICING, type Complexity, type Mode } from "@/lib/pricing";

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
    complexity: "Complejidad",
    cx: {
      low: ["Baja", "Mucho tiempo, poco esfuerzo mental."],
      medium: ["Media", "Integraciones, decisiones técnicas, algo de investigación."],
      high: ["Alta", "Arquitectura, blockchain, agentes, problemas nuevos."],
    } as Record<Complexity, [string, string]>,
    conditions: "Condiciones",
    onSite: "Presencial",
    projectOnSite: "Requiere presencialidad",
    days: "Días presenciales",
    dayUnit: ["día", "días"],
    travel: "Viático*",
    travelNote: "*El viático puede variar según la distancia.",
    extra: "Condiciones especiales",
    extraHint: "Urgencia, plazos ajustados, integraciones de terceros…",
    lines: { work: "Trabajo", discount: "Descuento por volumen", onSite: "Recargo presencial", travel: "Viático*", extra: "Condiciones especiales" },
    estimate: "Estimación",
    total: "Total estimado",
    deposit: "Anticipo (50%)",
    perHour: "/h",
    note: `Estimación orientativa, no es un presupuesto final. Lo ajustamos juntos en la llamada. Presupuestos válidos ${PRICING.validityDays} días; 50% de anticipo y 50% contra entrega.`,
    formula: "Cómo calculo",
    fProject: "(horas × valor por complejidad) + extra",
    fHourly: "(horas × valor por complejidad) + presencial + viático + extra",
    cta: "Agendar una videollamada",
    write: "Escribime",
    form: { name: "Nombre", email: "Tu email", message: "Mensaje", ph: "Contame qué necesitás…", budget: "Presupuesto que se envía", send: "Enviar", sending: "Enviando…", ok: "¡Listo! Te respondo a tu email.", err: { invalid_name: "Falta tu nombre.", invalid_email: "Revisá el email.", invalid_message: "El mensaje debe tener entre 1 y 280 caracteres.", rate_limited: "Demasiados envíos. Probá en un rato.", default: "No se pudo enviar. Probá de nuevo." } as Record<string, string>, yes: "sí", no: "no" },
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
    complexity: "Complexity",
    cx: {
      low: ["Low", "Time-heavy, light on mental effort."],
      medium: ["Medium", "Integrations, technical decisions, some research."],
      high: ["High", "Architecture, blockchain, agents, new problems."],
    } as Record<Complexity, [string, string]>,
    conditions: "Conditions",
    onSite: "On-site",
    projectOnSite: "Requires on-site work",
    days: "On-site days",
    dayUnit: ["day", "days"],
    travel: "Travel*",
    travelNote: "*Travel may vary with distance.",
    extra: "Special conditions",
    extraHint: "Urgency, tight deadlines, third-party integrations…",
    lines: { work: "Work", discount: "Volume discount", onSite: "On-site surcharge", travel: "Travel*", extra: "Special conditions" },
    estimate: "Estimate",
    total: "Estimated total",
    deposit: "Deposit (50%)",
    perHour: "/h",
    note: `Ballpark estimate, not a final quote. We fine-tune it together on the call. Quotes are valid for ${PRICING.validityDays} days; 50% upfront, 50% on delivery.`,
    formula: "How I calculate",
    fProject: "(hours × rate by complexity) + extra",
    fHourly: "(hours × rate by complexity) + on-site + travel + extra",
    cta: "Book a video call",
    write: "Write me",
    form: { name: "Name", email: "Your email", message: "Message", ph: "Tell me what you need…", budget: "Quote that will be sent", send: "Send", sending: "Sending…", ok: "Done! I'll reply to your email.", err: { invalid_name: "Your name is missing.", invalid_email: "Check the email.", invalid_message: "Message must be 1–280 characters.", rate_limited: "Too many sends. Try again later.", default: "Couldn't send. Try again." } as Record<string, string>, yes: "yes", no: "no" },
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
  const [mode, setMode] = useState<Mode>("project");
  const [hours, setHours] = useState(PRICING.sizes.m);
  const [complexity, setComplexity] = useState<Complexity>("medium");
  const [onSite, setOnSite] = useState(false);
  const [days, setDays] = useState(1);
  const [extra, setExtra] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const r = estimate({ mode, hours, complexity, extra, onSite, onSiteDays: days });
  const total = useCountUp(r.total);
  const maxH = mode === "project" ? PRICING.maxProjectHours : PRICING.maxHourlyHours;

  const switchMode = (m: Mode) => {
    setMode(m);
    setHours(m === "project" ? PRICING.sizes.m : 4);
  };

  return (
    <div className="hire" data-mode={mode} data-cx={complexity}>
      <p className="hire-intro">{c.intro}</p>

      <fieldset className="hire-field">
        <legend className="hire-label">{c.mode}</legend>
        <div className="hire-seg" role="radiogroup" aria-label={c.mode}>
          {(["project", "hourly"] as Mode[]).map((m) => (
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
        <input
          className="hire-range"
          type="range"
          min={1}
          max={maxH}
          step={1}
          value={Math.min(hours, maxH)}
          aria-label={c.hours}
          style={{ ["--p" as string]: `${((Math.min(hours, maxH) - 1) / (maxH - 1)) * 100}%` }}
          onChange={(e) => setHours(Number(e.target.value))}
        />
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
          <Toggle on={extra} set={setExtra} label={c.extra} sub={`+US$ ${PRICING.extra} · ${c.extraHint}`} />
        </div>
      </fieldset>

      <section className="hire-receipt" aria-live="polite">
        <div className="hire-receipt-top">
          <span className="hire-badge">{c.estimate}</span>
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
      <a className="call-cta" href={CALL_BOOKING_URL} target="_blank" rel="noopener noreferrer" data-testid="hire-call-cta">
        <span className="call-cta-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
            <path d="M15.5 10.5 21.5 7v10l-6-3.5" />
          </svg>
        </span>
        <span className="call-cta-text">
          <span className="call-cta-title">{c.cta}</span>
        </span>
        <span className="call-cta-arrow" aria-hidden="true">→</span>
      </a>
        <button type="button" className="hire-write" aria-expanded={formOpen} aria-controls="hire-form-panel" onClick={() => setFormOpen((o) => !o)} data-testid="hire-write">
          <span className="call-cta-title">{c.write}</span>
          <span className="call-cta-arrow" aria-hidden="true">↓</span>
        </button>
      </div>

      <HireForm
        open={formOpen}
        c={c}
        budget={{ mode, hours: Math.min(hours, maxH), complexity, onSite, days, extra }}
        rows={[
          [c.mode, c.modes[mode]],
          [c.hours, `${Math.min(hours, maxH)}h · ${c.cx[complexity][0]} (US$ ${PRICING.rates[complexity]}${c.perHour})`],
          [c.onSite, onSite ? (mode === "project" ? `${c.form.yes}, ${days} ${c.dayUnit[days === 1 ? 0 : 1]}` : c.form.yes) : c.form.no],
          [c.extra, extra ? c.form.yes : c.form.no],
          [c.total, money(r.total)],
        ]}
      />
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
  useEffect(() => {
    if (open) first.current?.focus({ preventScroll: true });
  }, [open]);
  const f = c.form;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [err, setErr] = useState("");
  const left = 280 - [...message].length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setErr("");
    try {
      const res = await fetch("/api/hire-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website, budget }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && j.ok) {
        setState("ok");
        setMessage("");
      } else {
        setState("error");
        setErr(f.err[j.error ?? ""] ?? f.err.default);
      }
    } catch {
      setState("error");
      setErr(f.err.default);
    }
  };

  return (
    <div id="hire-form-panel" className="hire-form-panel" data-open={open} inert={!open}>
    <form className="hire-form" onSubmit={submit} data-testid="hire-form">
      <div className="hire-form-row">
        <label className="hire-form-field">
          <span>{f.name}</span>
          <input ref={first} required maxLength={80} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="hire-form-field">
          <span>{f.email}</span>
          <input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      </div>
      <label className="hire-form-field">
        <span className="hire-form-msg-label">
          {f.message} <output className={`hire-form-count${left < 0 ? " is-over" : left <= 20 ? " is-low" : ""}`} aria-live="polite">{left}</output>
        </span>
        <textarea required rows={4} placeholder={f.ph} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <label className="hire-hp" aria-hidden="true">
        Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>
      <div className="hire-form-budget" role="group" aria-label={f.budget}>
        <span className="hire-form-budget-title">{f.budget}</span>
        <dl>
          {rows.map(([k, v], i) => (
            <div key={i} className={i === rows.length - 1 ? "is-total" : undefined}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="hire-form-actions">
        <button type="submit" className="hire-form-send" disabled={state === "sending" || left < 0}>
          {state === "sending" ? f.sending : f.send}
        </button>
        <p className="hire-form-status" role="status">{state === "ok" ? f.ok : state === "error" ? err : ""}</p>
      </div>
    </form>
    </div>
  );
}
