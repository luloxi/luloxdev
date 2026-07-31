"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { site } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

/** Same row height as social links (px-4 py-3.5 text-sm); orange CTA tokens for light/dark */
export function EmailContact() {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copyEmail = useCallback(async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
    } catch {
      const input = document.createElement("input");
      input.value = site.email;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
    }
  }, []);

  return (
    <div className="email-cta flex items-center gap-3 rounded-2xl px-4 py-3.5">
      <a
        href={`mailto:${site.email}`}
        className="flex min-w-0 flex-1 items-center gap-3 truncate text-sm transition-opacity hover:opacity-85"
      >
        <Mail className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="min-w-0 truncate">
          <span className="mr-2 opacity-75">{t.contact.emailLabel}</span>
          <span className="font-mono text-[13px] sm:text-sm">{site.email}</span>
        </span>
      </a>

      <button
        type="button"
        onClick={copyEmail}
        aria-label={copied ? t.contact.copied : t.contact.copy}
        className={cn(
          "email-cta-btn group/copy inline-flex h-7 shrink-0 items-center justify-center rounded-lg",
          "transition-all duration-200 hover:brightness-110",
          copied ? "min-w-7 gap-1 px-2" : "w-7 hover:w-auto hover:gap-1 hover:px-2",
        )}
      >
        <span className="inline-flex h-3.5 w-3.5 items-center justify-center">
          {copied ? (
            <Check className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          ) : (
            <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          )}
        </span>
        <span
          className={cn(
            "text-[11px] font-medium whitespace-nowrap",
            copied ? "inline" : "hidden group-hover/copy:inline",
          )}
        >
          {copied ? t.contact.copied : t.contact.copy}
        </span>
      </button>
    </div>
  );
}
