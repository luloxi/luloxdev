"use client";

import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t.ui.langLabel}
      className={cn(
        "inline-flex items-center rounded-full border border-border/80 bg-surface/40 p-0.5 font-mono text-[11px] backdrop-blur-sm",
        className,
      )}
    >
      {(["es", "en"] as const).map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={cn(
              "min-w-[2rem] rounded-full px-2 py-1 uppercase tracking-wider transition-all",
              active
                ? "bg-accent/20 text-accent shadow-[0_0_12px_color-mix(in_oklab,var(--accent)_35%,transparent)]"
                : "text-muted hover:text-foreground",
            )}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
