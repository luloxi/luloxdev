"use client";

import { Children, isValidElement, cloneElement, useRef, useState, type ReactNode, type ReactElement } from "react";

/** Carlitox's laugh. Static file in /public/audio (lazy: fetched on first click). */
export const LAUGH_SRC = "/audio/carlitox-jojojo.mp3";
const LAUGH_RE = /(jojojo|hohoho)/i;

/** "jojojo" in the story: a word-styled button that plays the laugh inline. */
export function LaughButton({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "playing" | "missing">("idle");
  const play = () => {
    if (!audio.current) {
      const a = new Audio(LAUGH_SRC);
      a.preload = "auto";
      a.addEventListener("ended", () => setState("idle"));
      a.addEventListener("error", () => setState("missing"));
      audio.current = a;
    }
    const a = audio.current;
    a.currentTime = 0;
    setState("playing");
    a.play().catch(() => setState("missing"));
  };
  return (
    <span
      role="button"
      tabIndex={0}
      className={`laugh-btn is-${state}`}
      title="Carlitox ▶"
      aria-label={`${typeof children === "string" ? children : "jojojo"} (▶ audio)`}
      onClick={play}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          play();
        }
      }}
    >
      {children}
      <span className="laugh-btn-icon" aria-hidden>
        {state === "playing" ? "♪" : "▸"}
      </span>
    </span>
  );
}

/** Wraps every "jojojo" (or "hohoho") in rendered text with a LaughButton. */
export function withLaugh(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      if (!LAUGH_RE.test(child)) return child;
      return child.split(LAUGH_RE).map((part, i) => (i % 2 === 1 ? <LaughButton key={i}>{part}</LaughButton> : part));
    }
    if (isValidElement(child)) {
      const el = child as ReactElement<{ children?: ReactNode }>;
      if (el.props.children === undefined) return child;
      return cloneElement(el, undefined, withLaugh(el.props.children));
    }
    return child;
  });
}
