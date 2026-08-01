import { cn } from "@/lib/utils";

type FlagProps = { className?: string; title?: string };

/** Argentina — square monogram flag for HUD chrome */
export function FlagAR({ className, title = "Argentina" }: FlagProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("block", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <rect width="16" height="16" fill="#74ACDF" />
      <rect y="5.2" width="16" height="5.6" fill="#fff" />
      <circle cx="8" cy="8" r="1.55" fill="#F6B40E" />
      <circle cx="8" cy="8" r="0.85" fill="#DB7A00" />
    </svg>
  );
}

/** United States — square monogram flag for HUD chrome */
export function FlagUS({ className, title = "United States" }: FlagProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("block", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <rect width="16" height="16" fill="#fff" />
      {/* stripes */}
      <rect y="0" width="16" height="1.23" fill="#B22234" />
      <rect y="2.46" width="16" height="1.23" fill="#B22234" />
      <rect y="4.92" width="16" height="1.23" fill="#B22234" />
      <rect y="7.38" width="16" height="1.23" fill="#B22234" />
      <rect y="9.85" width="16" height="1.23" fill="#B22234" />
      <rect y="12.31" width="16" height="1.23" fill="#B22234" />
      <rect y="14.77" width="16" height="1.23" fill="#B22234" />
      {/* canton */}
      <rect width="7.2" height="7.6" fill="#3C3B6E" />
      {/* simplified stars as dots */}
      <g fill="#fff">
        <circle cx="1.4" cy="1.4" r="0.45" />
        <circle cx="3.6" cy="1.4" r="0.45" />
        <circle cx="5.8" cy="1.4" r="0.45" />
        <circle cx="2.5" cy="2.8" r="0.45" />
        <circle cx="4.7" cy="2.8" r="0.45" />
        <circle cx="1.4" cy="4.2" r="0.45" />
        <circle cx="3.6" cy="4.2" r="0.45" />
        <circle cx="5.8" cy="4.2" r="0.45" />
        <circle cx="2.5" cy="5.6" r="0.45" />
        <circle cx="4.7" cy="5.6" r="0.45" />
      </g>
    </svg>
  );
}
