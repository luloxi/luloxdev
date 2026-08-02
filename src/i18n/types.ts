export type Locale = "es" | "en";

export const LOCALES: Locale[] = ["es", "en"];
/** SSR / first paint default; client may override from storage or browser language */
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "lulox-locale";
