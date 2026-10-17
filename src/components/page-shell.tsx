"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

type PageShellProps = {
  title: string;
  /** Hide the section title visually (kept for screen readers), e.g. project detail. */
  hideTitle?: boolean;
  children: ReactNode;
  /** Override top back link (default: home) */
  backHref?: string;
  backLabel?: string;
  /** Override footer CTA (defaults to home CTA) */
  footerHref?: string;
  footerLabel?: string;
};

export function PageShell({
  title,
  hideTitle = false,
  children,
  backHref = "/",
  backLabel,
  footerHref,
  footerLabel,
}: PageShellProps) {
  const { t } = useLocale();
  const topLabel = backLabel ?? t.ui.backHome;
  const bottomHref = footerHref ?? backHref;
  const bottomLabel = footerLabel ?? (footerHref || backHref !== "/" ? topLabel : t.ui.backHomeCta);

  return (
    <div className="cp-shell mx-auto min-h-dvh w-full max-w-xl px-6 pb-16 pt-16 sm:pt-20">
      {/* Back link lives in the fixed top bar, opposite the language/theme controls */}
      <div className="cp-topbar-back" data-inline-editor="skip">
        <Link
          href={backHref}
          className="cp-back-link group shrink-0"
          aria-label={`${topLabel} (${site.name})`}
        >
          <span className="cp-back-chevron" aria-hidden>
            &lt;
          </span>
          <span>{topLabel}</span>
        </Link>
      </div>
      {hideTitle ? (
        <h1 className="sr-only">{title}</h1>
      ) : (
        <header className="cp-shell-header mb-10 flex items-center justify-center">
          <h1 className="cp-page-title cp-page-title-center">
            <span className="cp-page-title-text">{title}</span>
            <span className="cp-page-title-mark" aria-hidden />
          </h1>
        </header>
      )}

      <div>{children}</div>

      <div className="mt-12">
        <Link href={bottomHref} className="cp-back-footer group">
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <span className="cp-back-footer-chevron" aria-hidden>
            &lt;
          </span>
          <span className="cp-back-footer-label">{bottomLabel}</span>
        </Link>
      </div>
    </div>
  );
}
