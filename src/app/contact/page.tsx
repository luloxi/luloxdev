"use client";

import type { ComponentType } from "react";
import { CpRow } from "@/components/cp-row";
import { EmailContact } from "@/components/email-contact";
import {
  GitHubIcon,
  InstagramBrandIcon,
  LinkedInIcon,
  TelegramIcon,
  XIcon,
} from "@/components/icons/social";
import { PageShell } from "@/components/page-shell";
import { socials } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

const socialIcons: Record<
  (typeof socials)[number]["id"],
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
  github: {
    Icon: GitHubIcon,
    className: "text-foreground",
    accent: "var(--foreground)",
  },
};

export default function ContactPage() {
  const { t } = useLocale();

  return (
    <PageShell title={t.contact.title}>
      <div className="cp-list">
        {socials.map((s, i) => {
          const { Icon, className: iconClass, accent } = socialIcons[s.id];
          return (
            <CpRow
              key={s.id}
              href={s.href}
              code={String(i + 1).padStart(2, "0")}
              label={s.label}
              detail={displayHandle(s.href)}
              accent={accent}
              Icon={Icon}
              iconClass={iconClass}
            />
          );
        })}
      </div>

      <div className="mt-6">
        <EmailContact code={String(socials.length + 1).padStart(2, "0")} />
      </div>
    </PageShell>
  );
}

function displayHandle(href: string) {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
