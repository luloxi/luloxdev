"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMessages, type Messages } from "./messages";
import { applyCopy, type CopyOverrides } from "./copy-overrides";
import type { Locale } from "./types";
import {
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
  readCookie,
  readStorage,
  writePrefCookie,
} from "@/lib/prefs-shared";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function persist(locale: Locale) {
  document.documentElement.lang = locale;
  writePrefCookie(LOCALE_COOKIE, locale);
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

/**
 * The server picks the locale (cookie, else Accept-Language) and renders with
 * it, so first paint is already in the right language. Changes are saved to
 * the cookie (for the server) and localStorage (legacy).
 */
export function LocaleProvider({
  initialLocale,
  overrides,
  children,
}: {
  initialLocale: Locale;
  /** Admin-edited copy from D1 (server-provided); code messages are the fallback. */
  overrides?: CopyOverrides;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Safety net: if the server rendered a different language than the saved
  // preference (cookie, else legacy localStorage) — e.g. cookies blocked or
  // the one-time reload was already used this session — switch client-side.
  // Never writes the server default.
  useEffect(() => {
    const fromCookie = normalizeLocale(readCookie(LOCALE_COOKIE));
    const wanted = fromCookie ?? normalizeLocale(readStorage(LOCALE_STORAGE_KEY));
    if (!wanted) return;
    if (!fromCookie) writePrefCookie(LOCALE_COOKIE, wanted);
    document.documentElement.lang = wanted;
    if (wanted !== initialLocale) setLocaleState(wanted); // eslint-disable-line react-hooks/set-state-in-effect -- one-time correction after hydration
  }, [initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persist(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === "es" ? "en" : "es";
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: applyCopy(getMessages(locale), overrides?.[locale]),
    }),
    [locale, setLocale, toggleLocale, overrides],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
