"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { site } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

/** Cyberpunk-styled email row with copy action */
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
        <Mail className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="min-w-0 truncate">
          <span className="cp-row-label mr-2 inline text-[0.85rem]">
            {t.contact.emailLabel}
          </span>
          <span className="font-mono text-[12px] opacity-90 sm:text-[13px]">
            {site.email}
          </span>
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
