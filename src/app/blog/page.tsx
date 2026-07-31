"use client";

import { PageShell } from "@/components/page-shell";
import { useLocale } from "@/i18n/locale-provider";

export default function BlogPage() {
  const { t } = useLocale();

  return (
    <PageShell title={t.blog.title}>
      <div className="neon-panel rounded-2xl px-5 py-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          {t.blog.comingSoon}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t.blog.note}
        </p>
      </div>
    </PageShell>
  );
}
