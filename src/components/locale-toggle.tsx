"use client";

import { FlagAR, FlagUS } from "@/components/icons/flags";
import { useLocale } from "@/i18n/locale-provider";
import type { Locale } from "@/i18n/types";
import { cn } from "@/lib/utils";

const options: {
  code: Locale;
  label: string;
  Flag: typeof FlagAR;
}[] = [
  {
    code: "es",
    label: "Español",
    Flag: FlagAR,
  },
  {
    code: "en",
    label: "English",
    Flag: FlagUS,
  },
];

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t.ui.langLabel}
      className={cn("cp-lang", className)}
    >
      <span className="cp-lang-label">{t.ui.langLabel}</span>
      <div className="cp-lang-flags">
        {options.map(({ code, label, Flag }) => {
          const active = locale === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              aria-pressed={active}
              aria-label={label}
              title={label}
              className={cn("cp-lang-btn", active && "cp-lang-btn-active")}
            >
              <span className="cp-lang-flag-wrap" aria-hidden>
                <Flag className="cp-lang-flag" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
