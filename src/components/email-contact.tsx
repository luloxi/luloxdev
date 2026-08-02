"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { site } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

/** Cyberpunk-styled email row with copy action (layout matches social CpRows) */
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
    <div className="cp-email">
      <span className="cp-nav-frame" aria-hidden>
        <span className="cp-nav-corner cp-nav-corner-tl" />
        <span className="cp-nav-corner cp-nav-corner-br" />
      </span>

      <a href={`mailto:${site.email}`} className="cp-email-main">
        <span className="cp-row-icon inline-flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9">
          <Mail className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="cp-row-body min-w-0 flex-1">
          <span className="cp-row-label">{t.contact.emailLabel}</span>
          <span className="cp-row-detail cp-email-address">{site.email}</span>
        </span>
      </a>

      <button
        type="button"
        onClick={copyEmail}
        aria-label={copied ? t.contact.copied : t.contact.copy}
        className={cn("cp-email-copy", copied && "min-w-0")}
      >
        <span className="inline-flex h-3.5 w-3.5 items-center justify-center">
          {copied ? (
            <Check className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          ) : (
            <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          )}
        </span>
        <span>{copied ? t.contact.copied : t.contact.copy}</span>
      </button>
    </div>
  );
}
