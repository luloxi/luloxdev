import { cookies, headers } from "next/headers";
import type { Locale } from "@/i18n/types";
import {
  DEFAULT_THEME,
  LOCALE_COOKIE,
  THEME_COOKIE,
  isLocale,
  isTheme,
  metadataLocale,
  type Theme,
} from "@/lib/prefs-shared";

/** Same rule as the old client detection: any Spanish in Accept-Language -> es, else en. */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return "en";
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase() ?? "";
    if (tag === "es" || tag.startsWith("es-")) return "es";
  }
  return "en";
}

/** Reading cookies/headers makes every page dynamic (per-request, never shared). */
export async function getServerPrefs(): Promise<{ locale: Locale; theme: Theme }> {
  const [jar, h] = await Promise.all([cookies(), headers()]);
  const c = jar.get(LOCALE_COOKIE)?.value;
  const t = jar.get(THEME_COOKIE)?.value;
  return {
    locale: isLocale(c) ? c : localeFromAcceptLanguage(h.get("accept-language")),
    theme: isTheme(t) ? t : DEFAULT_THEME,
  };
}

/** Locale for share metadata only: always ES, no cookie/header read (see metadataLocale). */
export async function getMetadataLocale(): Promise<Locale> {
  return metadataLocale();
}
