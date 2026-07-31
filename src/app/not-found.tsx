"use client";

import Link from "next/link";
import { SiteControls } from "@/components/site-controls";
import { site } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

export default function NotFound() {
  const { t } = useLocale();

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="absolute right-4 top-4">
        <SiteControls />
      </div>
      <p className="font-mono text-xs text-accent">404</p>
      <p className="mt-2 text-sm text-muted">{t.ui.notFound}</p>
      <Link
        href="/"
        className="mt-6 text-sm text-accent transition-colors hover:text-accent-2"
      >
        ← {site.name}
      </Link>
    </div>
  );
}
