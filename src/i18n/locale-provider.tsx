"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMessages, type Messages } from "./messages";
import type { Locale } from "./types";
import {
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
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
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

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
    () => ({ locale, setLocale, toggleLocale, t: getMessages(locale) }),
    [locale, setLocale, toggleLocale],
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
