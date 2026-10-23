/** Language + theme preference, shared by server, client and the inline head script. */
import type { Locale } from "@/i18n/types";

export type Theme = "light" | "dark";

export const LOCALE_COOKIE = "lulox-locale";
export const THEME_COOKIE = "lulox-theme";
/** localStorage keys used before cookies existed (kept in sync). */
export const LOCALE_STORAGE_KEY = "lulox-locale";
export const THEME_STORAGE_KEY = "theme"; // next-themes' old key
export const DEFAULT_THEME: Theme = "dark";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function isLocale(v: unknown): v is Locale {
  return v === "es" || v === "en";
}

export function isTheme(v: unknown): v is Theme {
  return v === "light" || v === "dark";
}

/** Client only: write a preference cookie (readable by the server on next request). */
export function writePrefCookie(name: string, value: string) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${secure}`;
}

/** Lenient parse of a stored language: "es", "\"es\"" (JSON), "es-AR", " ES " -> es. */
export function normalizeLocale(v: unknown): "es" | "en" | null {
  if (typeof v !== "string") return null;
  const s = v.trim().replace(/^"|"$/g, "").trim().toLowerCase();
  if (s.startsWith("es")) return "es";
  if (s.startsWith("en")) return "en";
  return null;
}

/** Lenient parse of a stored theme (next-themes writes plain "light" | "dark" | "system"). */
export function normalizeTheme(v: unknown, prefersLight = false): Theme | null {
  if (typeof v !== "string") return null;
  const s = v.trim().replace(/^"|"$/g, "").trim().toLowerCase();
  if (s === "light" || s === "dark") return s;
  if (s === "system") return prefersLight ? "light" : "dark";
  return null;
}

export function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Blocking <head> script, runs before first paint. Theme only: the language
 * comes from the URL (see src/lib/routes.ts), so nothing to fix up here.
 * Legacy key written by the pre-cookie site (verified in its source):
 *   localStorage "theme" = "light" | "dark" | "system"  (next-themes 0.4.6 default storageKey, plain string)
 * - theme: cookie, else legacy value (light/dark migrated into the cookie),
 *   else the system theme: light only if (prefers-color-scheme: light) matches;
 *   no-preference or no matchMedia -> dark. Applied but never persisted
 * Sets <html data-prefs> to what happened, for debugging.
 */
export const PREFS_HEAD_SCRIPT = `(function(){var d=document.documentElement,st='default';try{
function gc(n){var m=document.cookie.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return m?decodeURIComponent(m[1]):null}
function sc(n,v){document.cookie=n+'='+v+'; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'')}
function ls(k){try{return localStorage.getItem(k)}catch(e){return null}}
function cl(v){return typeof v==='string'?v.trim().replace(/^"|"$/g,'').trim().toLowerCase():''}
function nt(v){v=cl(v);if(v==='light'||v==='dark')return v;if(v==='system'){try{return typeof matchMedia==='function'&&matchMedia('(prefers-color-scheme: light)').matches===true?'light':'dark'}catch(e){return 'dark'}}return null}
var t=nt(gc('${THEME_COOKIE}'));
if(t){st='cookie'}else{var lr=cl(ls('${THEME_STORAGE_KEY}'));t=nt(lr);if(t){st='legacy';if(lr==='light'||lr==='dark')sc('${THEME_COOKIE}',t)}}
if(!t){t=nt('system');st='system'}
if(t){d.classList.remove('light','dark');d.classList.add(t);d.style.colorScheme=t==='light'?'only light':'dark'}
}catch(e){st='error'}d.setAttribute('data-prefs',st)})();`;
