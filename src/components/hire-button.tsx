"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/locale-provider";

/** Hero CTA: violet pill, neon snot-green glow, rainbow line sweeping along the bottom edge. */
export function HireButton({ className = "" }: { className?: string }) {
  const { t, href } = useLocale();
  return (
    <Link href={href("/contratar")} className={`hire-btn ${className}`.trim()} data-testid="hire-btn">
      <span className="hire-btn-label">{t.sections.hire}</span>
      <span className="hire-btn-arrow" aria-hidden>→</span>
      <span className="hire-btn-rainbow" aria-hidden />
    </Link>
  );
}
