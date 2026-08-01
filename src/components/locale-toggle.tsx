"use client";

import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t.ui.langLabel}
      className={cn("cp-ctrl", className)}
    >
      {(["es", "en"] as const).map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={cn("cp-ctrl-seg", active && "cp-ctrl-seg-active")}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
