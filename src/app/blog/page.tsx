"use client";

import { PageShell } from "@/components/page-shell";
import { useLocale } from "@/i18n/locale-provider";

export default function BlogPage() {
  const { t } = useLocale();

  return (
    <PageShell title={t.blog.title}>
      <div
        className="cp-panel"
        style={{ ["--cp-accent" as string]: "var(--section-blog)" }}
      >
        <span className="cp-nav-frame" aria-hidden>
          <span className="cp-nav-corner cp-nav-corner-tl" />
          <span className="cp-nav-corner cp-nav-corner-br" />
          <span className="cp-nav-scan" style={{ opacity: 0.4 }} />
        </span>

        <div className="cp-panel-inner py-6 text-center sm:py-8">
          <p className="cp-nav-meta justify-center">
            <span className="cp-nav-code">00</span>
            <span className="cp-nav-slash">//</span>
            <span className="uppercase tracking-[0.18em]">
              {t.blog.comingSoon}
            </span>
          </p>
          <p className="cp-headline mt-4 text-[1rem] sm:text-[1.1rem]">
            {t.blog.title}
          </p>
          <p className="cp-prose mx-auto mt-3 max-w-sm">{t.blog.note}</p>
        </div>
      </div>
    </PageShell>
  );
}
