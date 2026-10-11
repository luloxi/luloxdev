"use client";

import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

/**
 * Foolproof theme control: small "tema"/"theme" label + two color chips
 * (light surface vs dark surface). Same chrome language as the flag toggles.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLocale();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="cp-theme"
      role="group"
      aria-label={t.ui.themeLabel}
    >
      <span className="cp-theme-label">{t.ui.themeLabel}</span>
      <div className="cp-theme-swatches">
        <button
          type="button"
          aria-pressed={!isDark}
          aria-label={t.ui.themeLight}
          title={t.ui.themeLight}
          onClick={() => setTheme("light")}
          className={cn("cp-lang-btn", !isDark && "cp-lang-btn-active")}
        >
          <span
            className="cp-lang-flag-wrap cp-theme-swatch cp-theme-swatch-light"
            aria-hidden
          />
        </button>
        <button
          type="button"
          aria-pressed={isDark}
          aria-label={t.ui.themeDark}
          title={t.ui.themeDark}
          onClick={() => setTheme("dark")}
          className={cn("cp-lang-btn", isDark && "cp-lang-btn-active")}
        >
          <span
            className="cp-lang-flag-wrap cp-theme-swatch cp-theme-swatch-dark"
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
