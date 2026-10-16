import { Fragment, type ReactNode } from "react";

/** Blank line = new <p>, single line break = <br>. Plain text only (React escapes it). */
export function RichText({
  text,
  className,
  render = (s: string) => s,
}: {
  text: string;
  className?: string;
  render?: (s: string) => ReactNode;
}) {
  const paras = text
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t]*\n\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} className={className}>
          {p.split("\n").map((line, j) => (
            <Fragment key={j}>
              {j > 0 ? <br /> : null}
              {render(line.trim())}
            </Fragment>
          ))}
        </p>
      ))}
    </>
  );
}
