"use client";

import { FlagAR, FlagUS } from "@/components/icons/flags";
import { useLocale } from "@/i18n/locale-provider";
import type { Locale } from "@/i18n/types";
import { cn } from "@/lib/utils";

const options: {
  code: Locale;
  short: string;
  label: string;
  Flag: typeof FlagAR;
}[] = [
  {
    code: "es",
    short: "ES",
    label: "Español",
    Flag: FlagAR,
  },
  {
    code: "en",
    short: "EN",
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
      {options.map(({ code, short, label, Flag }) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            aria-label={`${t.ui.langLabel}: ${label}`}
            title={`${label} (${short})`}
            className={cn("cp-lang-btn", active && "cp-lang-btn-active")}
          >
            <span className="cp-lang-flag-wrap" aria-hidden>
              <Flag className="cp-lang-flag" />
            </span>
            <span className="cp-lang-code">{short}</span>
          </button>
        );
      })}
    </div>
  );
}
