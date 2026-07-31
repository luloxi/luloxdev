"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SiteControls } from "@/components/site-controls";
import { site } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

type PageShellProps = {
  title: string;
  children: ReactNode;
};

export function PageShell({ title, children }: PageShellProps) {
  const { t } = useLocale();

  return (
    <div className="mx-auto min-h-dvh w-full max-w-xl px-6 py-8 sm:py-12">
      <header className="mb-10 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm text-muted transition-colors hover:text-accent"
        >
          ← {t.ui.backHome}
          <span className="sr-only"> ({site.name})</span>
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-sm font-medium tracking-[0.12em] text-muted uppercase">
            {title}
          </h1>
          <SiteControls />
        </div>
      </header>
      <div className="pb-16">{children}</div>
    </div>
  );
}
