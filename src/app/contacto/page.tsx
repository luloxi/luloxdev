"use client";

import type { ComponentType } from "react";
import { CpRow } from "@/components/cp-row";
import {
  InstagramBrandIcon,
  LinkedInIcon,
  TelegramIcon,
  XIcon,
} from "@/components/icons/social";
import { PageShell } from "@/components/page-shell";
import Link from "next/link";
import { contactSocials } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

const socialIcons: Record<
  (typeof contactSocials)[number]["id"],
  { Icon: ComponentType<{ className?: string }>; className?: string; accent: string }
> = {
  x: {
    Icon: XIcon,
    className: "text-foreground",
    accent: "var(--foreground)",
  },
  instagram: {
    Icon: InstagramBrandIcon,
    accent: "#e1306c",
  },
  telegram: {
    Icon: TelegramIcon,
    className: "text-[#26A5E4]",
    accent: "#26A5E4",
  },
  linkedin: {
    Icon: LinkedInIcon,
    className: "text-[#0A66C2]",
    accent: "#0A66C2",
  },
};

export default function ContactPage() {
  const { t } = useLocale();

  return (
    <PageShell title={t.contact.title}>
      <div className="cp-list cp-list-2col">
        {contactSocials.map((s) => {
          const { Icon, className: iconClass, accent } = socialIcons[s.id];
          return (
            <CpRow
              key={s.id}
              href={s.href}
              label={s.label}
              detail={displayHandle(s.href)}
              accent={accent}
              Icon={Icon}
              iconClass={iconClass}
              iconSize="lg"
            />
          );
        })}
      </div>

      <Link
        className="call-cta"
        href="/contratar"
        data-testid="call-cta"
      >
        <span className="call-cta-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
            <path d="M15.5 10.5 21.5 7v10l-6-3.5" />
          </svg>
        </span>
        <span className="call-cta-text">
          <span className="call-cta-title">{t.contact.callTitle}</span>
          <span className="call-cta-sub">{t.contact.callSub}</span>
        </span>
        <span className="call-cta-arrow" aria-hidden="true">→</span>
      </Link>
    </PageShell>
  );
}

function displayHandle(href: string) {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
