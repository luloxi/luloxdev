"use client";

import { useEffect, useRef, useState } from "react";

export const LIMIT_MODAL_SECONDS = 5;

type Props = {
  /** Changes on every trigger: restarts the single modal's countdown instead of stacking modals. */
  nonce: number;
  kind: "trimmed" | "limit";
  title: string;
  body: string;
  close: string;
  countdown: (n: number) => string;
  onClose: () => void;
};

/** Over-the-limit notice: crimson dialog with a rotating rainbow border and a 5 s countdown ring. */
export function LimitModal({ nonce, kind, title, body, close, countdown, onClose }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const [left, setLeft] = useState(LIMIT_MODAL_SECONDS);
  const done = useRef(onClose);
  useEffect(() => { done.current = onClose; }, [onClose]);

  // (Re)start the countdown on every trigger.
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const n = LIMIT_MODAL_SECONDS - Math.floor((Date.now() - start) / 1000);
      if (n <= 0) done.current();
      else setLeft(n);
    };
    const id = window.setInterval(tick, 250);
    const first = requestAnimationFrame(() => setLeft(LIMIT_MODAL_SECONDS));
    return () => { window.clearInterval(id); cancelAnimationFrame(first); };
  }, [nonce]);

  // Focus the close button, trap Tab inside, close on Esc.
  useEffect(() => {
    btn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); done.current(); return; }
      if (e.key !== "Tab" || !box.current) return;
      const items = box.current.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])");
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!box.current.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="limit-modal-backdrop" onPointerDown={(e) => { if (e.target === e.currentTarget) done.current(); }}>
      <div ref={box} className="limit-modal" role="dialog" aria-modal="true" aria-labelledby="limit-modal-title" aria-describedby="limit-modal-body" data-kind={kind}>
        <div className="limit-modal-inner">
          <div className="limit-modal-ring" style={{ "--p": left / LIMIT_MODAL_SECONDS } as React.CSSProperties} aria-hidden>
            <span className="limit-modal-ring-fill" />
            <span className="limit-modal-num">{left}</span>
          </div>
          <div className="limit-modal-text">
            <h2 id="limit-modal-title">{title}</h2>
            <p id="limit-modal-body">{body}</p>
            <p className="limit-modal-count" aria-live="polite">{countdown(left)}</p>
          </div>
          <button ref={btn} type="button" className="limit-modal-close" onClick={() => done.current()}>{close}</button>
        </div>
      </div>
    </div>
  );
}
