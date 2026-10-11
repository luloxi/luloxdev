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

/**
 * Blocking <head> script, runs before first paint:
 * - theme: cookie, else old localStorage value (migrated into the cookie)
 * - lang: cookie, else old localStorage value; if it differs from what the
 *   server rendered, set the cookie and reload once so text matches (one-time
 *   migration for visitors who only have localStorage).
 */
export const PREFS_HEAD_SCRIPT = `(function(){try{
var d=document.documentElement;
function gc(n){var m=document.cookie.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return m?decodeURIComponent(m[1]):null}
function sc(n,v){document.cookie=n+'='+v+'; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'')}
function ls(k){try{return localStorage.getItem(k)}catch(e){return null}}
var t=gc('${THEME_COOKIE}');
if(t!=='light'&&t!=='dark'){var lt=ls('${THEME_STORAGE_KEY}');if(lt==='light'||lt==='dark'){t=lt;sc('${THEME_COOKIE}',t)}}
if(t==='light'||t==='dark'){d.classList.remove('light','dark');d.classList.add(t);d.style.colorScheme=t}
var l=gc('${LOCALE_COOKIE}');
if(l!=='es'&&l!=='en'){var ll=ls('${LOCALE_STORAGE_KEY}');if(ll==='es'||ll==='en'){sc('${LOCALE_COOKIE}',ll);
if(ll!==d.getAttribute('data-ssr-locale')&&gc('${LOCALE_COOKIE}')===ll&&!sessionStorage.getItem('lulox-lang-reload')){sessionStorage.setItem('lulox-lang-reload','1');location.replace(location.href);return}
d.lang=ll}}
}catch(e){}})();`;
