import { cookies, headers } from "next/headers";
import type { Locale } from "@/i18n/types";
import { DEFAULT_THEME, THEME_COOKIE, isTheme, type Theme } from "@/lib/prefs-shared";
import { LOCALE_HEADER } from "@/lib/routes";

/**
 * Language of this request = language of its URL, as set by proxy.ts in the
 * x-lulox-locale header (/en/... -> en, the rest -> es). Never the cookie or
 * Accept-Language: the same URL always renders (and shares) the same language.
 */
export async function getRequestLocale(): Promise<Locale> {
  const h = await headers();
  return h.get(LOCALE_HEADER) === "en" ? "en" : "es";
}

/** Reading cookies/headers makes every page dynamic (per-request, never shared). */
export async function getServerPrefs(): Promise<{ locale: Locale; theme: Theme }> {
  const [jar, locale] = await Promise.all([cookies(), getRequestLocale()]);
  const t = jar.get(THEME_COOKIE)?.value;
  return { locale, theme: isTheme(t) ? t : DEFAULT_THEME };
}
