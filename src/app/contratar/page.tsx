"use client";

import { HireCalculator } from "@/components/hire-calculator";
import { PageShell } from "@/components/page-shell";
import { useLocale } from "@/i18n/locale-provider";

export default function HirePage() {
  const { t } = useLocale();
  return (
    <PageShell title={t.sections.hire}>
      <HireCalculator />
    </PageShell>
  );
}
