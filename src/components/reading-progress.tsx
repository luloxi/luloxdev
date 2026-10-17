"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Thin reading-progress bar pinned just under the fixed top bar. */
export function ReadingProgress({ target }: { target: RefObject<HTMLElement | null> }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = target.current;
      const b = bar.current;
      if (!el || !b) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height - vh * 0.6;
      const p = total <= 0 ? 1 : Math.max(0, Math.min(1, (vh * 0.4 - r.top) / total));
      b.style.transform = `scaleX(${p.toFixed(4)})`;
      b.parentElement?.classList.toggle("is-on", p > 0.002);
    };
    const req = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(req) : null;
    if (target.current) ro?.observe(target.current);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", req);
      window.removeEventListener("resize", req);
      ro?.disconnect();
    };
  }, [target]);
  return (
    <div className="read-progress" aria-hidden data-inline-editor="skip">
      <div ref={bar} className="read-progress-bar" />
    </div>
  );
}
