"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

type PageShellProps = {
  title: string;
  children: ReactNode;
};

export function PageShell({ title, children }: PageShellProps) {
  const { t } = useLocale();

  return (
    <div className="mx-auto min-h-dvh w-full max-w-xl px-6 pb-16 pt-16 sm:pt-20">
      <header className="mb-10 flex items-center justify-between gap-4 pr-20 sm:pr-24">
        <Link
          href="/"
          className="cp-back-link group shrink-0"
          aria-label={`${t.ui.backHome} (${site.name})`}
        >
          <span className="cp-back-chevron" aria-hidden>
            &lt;
          </span>
          <span>{t.ui.backHome}</span>
        </Link>
        <h1 className="cp-page-title shrink-0">
          <span className="cp-page-title-text">{title}</span>
          <span className="cp-page-title-mark" aria-hidden />
        </h1>
      </header>

      <div>{children}</div>

      <div className="mt-12">
        <Link href="/" className="cp-back-footer group">
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <span className="cp-back-footer-chevron" aria-hidden>
            &lt;
          </span>
          <span className="cp-back-footer-label">{t.ui.backHomeCta}</span>
        </Link>
      </div>
    </div>
  );
}
