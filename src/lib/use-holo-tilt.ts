"use client";

import { useEffect, useRef } from "react";

const MAX = 6; // degrees

/**
 * Subtle holographic tilt. Desktop: follows the mouse. Touch: follows the
 * finger while pressed and, where the browser exposes it without a permission
 * prompt (Android Chrome), gently follows the phone's tilt. iOS never prompts:
 * it just falls back to touch. Off under prefers-reduced-motion.
 * Writes --rx/--ry (deg) and --hx/--hy (%) on the element; CSS does the rest.
 */
export function useHoloTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq?.matches) return;
    let raf = 0;
    let pending: [number, number, boolean] | null = null;
    let pointerActive = false;
    const set = (nx: number, ny: number, on: boolean) => {
      // nx, ny in [-1, 1]
      pending = [nx, ny, on];
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!pending) return;
        const [x, y, active] = pending;
        el.style.setProperty("--ry", `${(x * MAX).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-y * MAX * 0.8).toFixed(2)}deg`);
        el.style.setProperty("--hx", `${((x + 1) * 50).toFixed(1)}%`);
        el.style.setProperty("--hy", `${((y + 1) * 50).toFixed(1)}%`);
        el.classList.toggle("is-holo", active);
      });
    };
    const fromPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      set(nx, ny, true);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || pointerActive) {
        pointerActive = true;
        fromPointer(e);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        pointerActive = true;
        fromPointer(e);
      }
    };
    const onLeave = () => {
      pointerActive = false;
      set(0, 0, false);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointercancel", onLeave);
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") onLeave();
    };
    el.addEventListener("pointerup", onUp);

    // Device tilt (only where no permission is needed).
    const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } }).DeviceOrientationEvent;
    const coarse = window.matchMedia?.("(pointer: coarse)").matches;
    let base: [number, number] | null = null;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (pointerActive || e.beta == null || e.gamma == null) return;
      if (!base) base = [e.beta, e.gamma];
      // Slowly re-centre so holding the phone at any angle reads as "flat".
      base = [base[0] * 0.985 + e.beta * 0.015, base[1] * 0.985 + e.gamma * 0.015];
      const nx = Math.max(-1, Math.min(1, (e.gamma - base[1]) / 20));
      const ny = Math.max(-1, Math.min(1, (e.beta - base[0]) / 20));
      set(nx, ny, Math.abs(nx) + Math.abs(ny) > 0.08);
    };
    const useOrientation = coarse && DOE && typeof DOE.requestPermission !== "function";
    if (useOrientation) window.addEventListener("deviceorientation", onOrient);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointercancel", onLeave);
      el.removeEventListener("pointerup", onUp);
      if (useOrientation) window.removeEventListener("deviceorientation", onOrient);
    };
  }, []);
  return ref;
}
