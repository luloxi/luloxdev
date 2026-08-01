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
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
        >
          ← {t.ui.backHome}
          <span className="sr-only"> ({site.name})</span>
        </Link>
        <h1 className="font-display text-sm font-medium tracking-[0.16em] text-accent uppercase">
          <span className="mr-1.5 font-mono text-[10px] opacity-60">//</span>
          {title}
        </h1>
      </header>
      <div>{children}</div>
    </div>
  );
}
