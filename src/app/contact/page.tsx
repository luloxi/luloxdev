"use client";

import type { ComponentType } from "react";
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
import { cn } from "@/lib/utils";

const socialIcons: Record<
  (typeof socials)[number]["id"],
  { Icon: ComponentType<{ className?: string }>; className?: string }
> = {
  x: {
    Icon: XIcon,
    className: "text-foreground",
  },
  instagram: {
    Icon: InstagramBrandIcon,
  },
  telegram: {
    Icon: TelegramIcon,
    className: "text-[#26A5E4]",
  },
  linkedin: {
    Icon: LinkedInIcon,
    className: "text-[#0A66C2]",
  },
  github: {
    Icon: GitHubIcon,
    className: "text-foreground",
  },
};

export default function ContactPage() {
  const { t } = useLocale();

  return (
    <PageShell title={t.contact.title}>
      <h2 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-accent">
        {t.ui.social}
      </h2>
      <ul className="space-y-2">
        {socials.map((s) => {
          const { Icon, className: iconClass } = socialIcons[s.id];
          return (
            <li key={s.id}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="neon-panel flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-sm"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 shrink-0 items-center justify-center",
                      iconClass,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-medium">{s.label}</span>
                </span>
                <span className="truncate text-muted">
                  {displayHandle(s.href)}
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        <EmailContact />
      </div>
    </PageShell>
  );
}

function displayHandle(href: string) {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
