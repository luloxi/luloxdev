"use client";

import type { ComponentType } from "react";
import { CpRow } from "@/components/cp-row";
import { EmailContact } from "@/components/email-contact";
import {
  InstagramBrandIcon,
  LinkedInIcon,
  TelegramIcon,
  XIcon,
} from "@/components/icons/social";
import { PageShell } from "@/components/page-shell";
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

      <div className="mt-6">
        <EmailContact />
      </div>
    </PageShell>
  );
}

function displayHandle(href: string) {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
