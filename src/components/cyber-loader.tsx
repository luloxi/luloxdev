"use client";

import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

type CyberLoaderProps = {
  className?: string;
  label?: string;
};

/**
 * Minimal cyberpunk HUD loading state, vertically centered.
 */
export function CyberLoader({ className, label }: CyberLoaderProps) {
  const { t } = useLocale();
  const text = label ?? t.blog.loading;

  return (
    <div
      className={cn("cp-loader", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="cp-loader-core">
        <p className="cp-loader-label">
          <span className="cp-loader-bracket" aria-hidden>
            [
          </span>
          {text}
          <span className="cp-loader-bracket" aria-hidden>
            ]
          </span>
          <span className="cp-loader-cursor" aria-hidden />
        </p>
        <div className="cp-loader-bar" aria-hidden>
          <span className="cp-loader-bar-fill" />
        </div>
      </div>
    </div>
  );
}
