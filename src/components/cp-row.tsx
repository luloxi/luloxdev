import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CpRowProps = {
  href: string;
  code: string;
  label: string;
  /** Secondary line (handle, blurb, etc.) */
  detail?: string;
  accent?: string;
  Icon?: ComponentType<{ className?: string }>;
  iconClass?: string;
  external?: boolean;
  className?: string;
  trailing?: ReactNode;
};

/**
 * Full-width cyberpunk menu row — same language as home section tiles.
 */
export function CpRow({
  href,
  code,
  label,
  detail,
  accent = "var(--accent)",
  Icon,
  iconClass,
  external = true,
  className,
  trailing,
}: CpRowProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn("cp-row group", className)}
      style={{ ["--cp-accent" as string]: accent }}
    >
      <span className="cp-nav-frame" aria-hidden>
        <span className="cp-nav-corner cp-nav-corner-tl" />
        <span className="cp-nav-corner cp-nav-corner-br" />
        <span className="cp-nav-scan" />
      </span>

      <span className="cp-nav-meta">
        <span className="cp-nav-code">{code}</span>
        <span className="cp-nav-slash" aria-hidden>
          //
        </span>
      </span>

      {Icon ? (
        <span
          className={cn(
            "cp-row-icon inline-flex h-5 w-5 shrink-0 items-center justify-center",
            iconClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      ) : null}

      <span className="cp-row-body min-w-0">
        <span className="cp-row-label">{label}</span>
        {detail ? <span className="cp-row-detail">{detail}</span> : null}
      </span>

      {trailing ?? (
        <span className="cp-nav-chevron cp-row-chevron" aria-hidden>
          ▸
        </span>
      )}

      <span className="cp-nav-bar cp-row-bar" aria-hidden />
    </a>
  );
}
