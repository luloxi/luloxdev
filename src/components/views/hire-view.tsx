"use client";

import { HireCalculator } from "@/components/hire-calculator";
import { PageShell } from "@/components/page-shell";
import { useLocale } from "@/i18n/locale-provider";
import type { Pricing } from "@/lib/pricing";

export function HireView({ pricing }: { pricing: Pricing }) {
  const { t } = useLocale();
  return (
    <PageShell title={t.sections.hire}>
      <HireCalculator pricing={pricing} />
    </PageShell>
  );
}
