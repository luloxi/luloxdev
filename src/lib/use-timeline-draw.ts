"use client";

import { useEffect, useRef } from "react";

/**
 * Experiencia timeline: a line between the logos that draws as you scroll,
 * and each logo "lights up" once the drawing reaches it.
 * Off under prefers-reduced-motion (line shown full, logos lit).
 */
export function useTimelineDraw<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    list.classList.add("tl-draw");
    if (reduce) list.classList.add("tl-static");
    let raf = 0;
    const update = () => {
      raf = 0;
      const logos = [...list.querySelectorAll<HTMLElement>(".tl-logo")];
      if (logos.length === 0) return;
      const lr = list.getBoundingClientRect();
      const centres = logos.map((l) => {
        const r = l.getBoundingClientRect();
        return { x: r.left + r.width / 2 - lr.left, y: r.top + r.height / 2 - lr.top };
      });
      const top = centres[0].y;
      const height = Math.max(0, centres[centres.length - 1].y - top);
      list.style.setProperty("--tl-x", `${centres[0].x}px`);
      list.style.setProperty("--tl-top", `${top}px`);
      list.style.setProperty("--tl-h", `${height}px`);
      if (reduce) {
        list.style.setProperty("--tl-p", "1");
        logos.forEach((l) => l.classList.add("is-lit"));
        return;
      }
      // The "pen" sits at 65% of the viewport height.
      const pen = window.innerHeight * 0.65 - lr.top;
      const p = height <= 0 ? (pen >= top ? 1 : 0) : Math.max(0, Math.min(1, (pen - top) / height));
      list.style.setProperty("--tl-p", p.toFixed(4));
      centres.forEach((c, i) => logos[i].classList.toggle("is-lit", pen >= c.y - 4));
    };
    const req = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(req) : null;
    ro?.observe(list);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", req);
      window.removeEventListener("resize", req);
      ro?.disconnect();
      list.classList.remove("tl-draw", "tl-static");
    };
  }, []);
  return ref;
}
