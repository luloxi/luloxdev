"use client";

import { PageShell } from "@/components/page-shell";
import { useLocale } from "@/i18n/locale-provider";

export default function AboutPage() {
  const { t } = useLocale();
  const about = t.about;

  return (
    <PageShell title={about.title}>
      <div className="space-y-8">
        <p className="font-display neon-text text-xl font-medium tracking-tight sm:text-2xl">
          {about.headline}
        </p>

        <div className="space-y-4">
          {about.paragraphs.map((p) => (
            <p
              key={p.slice(0, 40)}
              className="text-[15px] leading-relaxed text-muted"
            >
              {p}
            </p>
          ))}
        </div>

        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            {t.ui.experience}
          </h2>
          <ul className="space-y-6">
            {about.timeline.map((item) => (
              <li key={item.title + item.org} className="neon-panel rounded-2xl p-4">
                <p className="font-mono text-[11px] text-accent-2">
                  {item.period}
                </p>
                <p className="mt-1 text-sm font-medium">{item.title}</p>
                <p className="text-sm text-muted">{item.org}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <p className="border-t border-border pt-6 font-display text-base font-medium tracking-tight text-accent">
          {about.philosophy}
        </p>
      </div>
    </PageShell>
  );
}
