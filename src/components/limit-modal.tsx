"use client";

import { useEffect, useRef, useState } from "react";

export const LIMIT_MODAL_SECONDS = 5;

type Props = {
  /** Changes on every trigger (e.g. another paste): resets the single modal's lock to 5 s. */
  nonce: number;
  title: string;
  close: string;
  onClose: () => void;
};

/**
 * 280-character notice: crimson dialog, rotating CTA-rainbow border, countdown ring.
 * Locked for 5 s (no button, Esc or outside tap); then "Entendido"/"Got it" enables and any of
 * the three closes it. Centered on the visual viewport so it stays in view with the keyboard open.
 */
export function LimitModal({ nonce, title, close, onClose }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const [left, setLeft] = useState(LIMIT_MODAL_SECONDS);
  const [vp, setVp] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const locked = left > 0;
  const lockedRef = useRef(true);
  useEffect(() => { lockedRef.current = locked; }, [locked]);
  const done = useRef(onClose);
  useEffect(() => { done.current = onClose; }, [onClose]);
  const tryClose = () => { if (!lockedRef.current) done.current(); };

  // (Re)start the 5 s lock on every trigger.
  useEffect(() => {
    const start = Date.now();
    const tick = () => setLeft(Math.max(0, LIMIT_MODAL_SECONDS - Math.floor((Date.now() - start) / 1000)));
    const first = requestAnimationFrame(tick);
    const id = window.setInterval(tick, 200);
    return () => { cancelAnimationFrame(first); window.clearInterval(id); };
  }, [nonce]);

  // Locked: focus the dialog itself. Unlocked: focus the button.
  useEffect(() => {
    (locked ? box.current : btn.current)?.focus({ preventScroll: true });
  }, [locked, nonce]);

  // Follow the visual viewport (on-screen keyboard) so the dialog stays centered in what's visible.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const fit = () => setVp({ top: vv.offsetTop, left: vv.offsetLeft, width: vv.width, height: vv.height });
    fit();
    vv.addEventListener("resize", fit);
    vv.addEventListener("scroll", fit);
    return () => { vv.removeEventListener("resize", fit); vv.removeEventListener("scroll", fit); };
  }, []);

  // Esc closes only when unlocked; Tab never leaves the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); tryClose(); return; }
      if (e.key !== "Tab" || !box.current) return;
      e.preventDefault();
      (lockedRef.current ? box.current : btn.current)?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="limit-modal-backdrop"
      style={vp ? { top: vp.top, left: vp.left, width: vp.width, height: vp.height, right: "auto", bottom: "auto" } : undefined}
      onPointerDown={(e) => { if (e.target === e.currentTarget) tryClose(); }}
    >
      <div ref={box} tabIndex={-1} className="limit-modal" role="dialog" aria-modal="true" aria-labelledby="limit-modal-title" data-locked={locked}>
        <div className="limit-modal-inner">
          <div className="limit-modal-ring" style={{ "--limit-p": left / LIMIT_MODAL_SECONDS } as React.CSSProperties} aria-hidden>
            <span className="limit-modal-ring-fill" />
            <span className="limit-modal-num">{left}</span>
          </div>
          <h2 id="limit-modal-title">{title}</h2>
          <button ref={btn} type="button" className="limit-modal-close" disabled={locked} aria-label={locked ? `${close} (${left})` : close} onClick={tryClose}>
            {locked ? left : close}
          </button>
        </div>
      </div>
    </div>
  );
}
