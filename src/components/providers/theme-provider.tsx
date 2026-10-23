"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  THEME_COOKIE,
  THEME_STORAGE_KEY,
  normalizeTheme,
  readCookie,
  readStorage,
  writePrefCookie,
  type Theme,
} from "@/lib/prefs-shared";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readDomTheme(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

/** Theme from prefers-color-scheme (dark when unknown). */
export function systemTheme(mq?: { matches: boolean } | null): Theme {
  return mq?.matches ? "light" : "dark";
}

/** True when the user picked a theme by hand (cookie, or a legacy explicit value). */
function hasSavedTheme() {
  if (normalizeTheme(readCookie(THEME_COOKIE))) return true;
  const raw = readStorage(THEME_STORAGE_KEY)?.replace(/"/g, "").trim();
  return raw === "light" || raw === "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  // Avoid every element animating colors during the switch.
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  // "only light" stops Android Chrome auto-dark from darkening the light theme.
  root.style.colorScheme = theme === "light" ? "only light" : "dark";
  void window.getComputedStyle(document.body).opacity;
  setTimeout(() => style.remove(), 1);
}

/**
 * Theme lives on <html class> (server-rendered from the cookie, corrected
 * before paint by the head script). The DOM is the source of truth.
 */
export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme;
  children: ReactNode;
}) {
  const theme = useSyncExternalStore(subscribe, readDomTheme, () => initialTheme);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    writePrefCookie(THEME_COOKIE, next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  // Safety net if the head script didn't run: apply the saved theme (cookie,
  // else legacy next-themes value). Never writes the server default.
  useEffect(() => {
    const fromCookie = normalizeTheme(readCookie(THEME_COOKIE));
    const raw = readStorage(THEME_STORAGE_KEY);
    const mq = window.matchMedia?.("(prefers-color-scheme: light)");
    const wanted = fromCookie ?? normalizeTheme(raw, mq?.matches) ?? systemTheme(mq);
    if (readDomTheme() !== wanted) applyTheme(wanted);
    // Only migrate an explicit legacy pick; the system theme is never persisted.
    if (!fromCookie && hasSavedTheme()) {
      writePrefCookie(THEME_COOKIE, wanted);
    }
  }, []);

  // No saved choice: follow the system live (OS switches dark/light while the page is open).
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: light)");
    if (!mq) return;
    const onChange = () => {
      if (hasSavedTheme()) return; // a manual pick always wins
      applyTheme(systemTheme(mq));
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme: theme, setTheme }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
