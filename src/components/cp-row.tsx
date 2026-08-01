import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CpRowProps = {
  href: string;
  label: string;
  /** Secondary line (handle, blurb, etc.) */
  detail?: string;
  accent?: string;
  Icon?: ComponentType<{ className?: string }>;
  iconClass?: string;
  /** Default sm (1.25rem); lg ~1.6× (2rem) for tastes */
  iconSize?: "sm" | "lg";
  external?: boolean;
  className?: string;
  trailing?: ReactNode;
};

/**
 * Full-width cyberpunk menu row (no index codes — those are landing-only).
 */
export function CpRow({
  href,
  label,
  detail,
  accent = "var(--accent)",
  Icon,
  iconClass,
  iconSize = "sm",
  external = true,
  className,
  trailing,
}: CpRowProps) {
  const iconBox = iconSize === "lg" ? "h-8 w-8 sm:h-9 sm:w-9" : "h-5 w-5";
  const iconGlyph = iconSize === "lg" ? "h-8 w-8 sm:h-9 sm:w-9" : "h-5 w-5";

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

      {Icon ? (
        <span
          className={cn(
            "cp-row-icon inline-flex shrink-0 items-center justify-center",
            iconBox,
            iconClass,
          )}
        >
          <Icon className={iconGlyph} />
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
