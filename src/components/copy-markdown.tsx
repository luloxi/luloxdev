"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

/**
 * Site copy rendered as Markdown. No raw HTML (skipHtml), no automatic term
 * linking: only explicit [text](url) links. Single line break = <br>,
 * blank line = new paragraph, so plain text renders like before.
 */
function safeHref(href?: string): string | undefined {
  if (!href) return undefined;
  const h = href.trim();
  if (/^(https?:|mailto:|\/|#)/i.test(h)) return h;
  return undefined;
}

function makeComponents(pClass: string, inline: boolean): Components {
  const P = inline ? "span" : "p";
  return {
    h1: ({ children }) => <h2 className="md-h2">{children}</h2>,
    h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
    h4: ({ children }) => <h4 className="md-h4">{children}</h4>,
    h5: ({ children }) => <h4 className="md-h4">{children}</h4>,
    h6: ({ children }) => <h4 className="md-h4">{children}</h4>,
    p: ({ children }) => <P className={pClass}>{children}</P>,
    hr: () => <hr className="md-hr" />,
    ul: ({ children }) => <ul className="md-ul">{children}</ul>,
    ol: ({ children }) => <ol className="md-ol">{children}</ol>,
    blockquote: ({ children }) => <blockquote className="md-quote">{children}</blockquote>,
    strong: ({ children }) => <strong className="md-strong">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    img: () => null,
    a: ({ href, children }) => {
      const h = safeHref(href);
      if (!h || inline) return <span className={inline ? undefined : "md-link"}>{children}</span>;
      const external = /^https?:/i.test(h);
      return (
        <a
          href={h}
          className="cp-prose-link"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  };
}

/** "* text" at line start stays a literal asterisk (footnote style); bullets use "- ". */
function prep(text: string): string {
  return text.replace(/\r\n?/g, "\n").replace(/^([ \t]*)\*(?=[ \t])/gm, "$1\\*");
}

export function CopyMarkdown({
  text,
  copyKey,
  className = "",
  pClass = "cp-prose",
  inline = false,
}: {
  text: string;
  copyKey?: string;
  className?: string;
  pClass?: string;
  /** Inside a link/button: no block elements wrapper, links rendered as text. */
  inline?: boolean;
}) {
  const Wrap = inline ? "span" : "div";
  return (
    <Wrap data-copy-key={copyKey} data-copy-md={copyKey ? "1" : undefined} className={`md-copy ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        skipHtml
        components={makeComponents(pClass, inline)}
        allowedElements={inline ? ["p", "strong", "em", "a", "br", "del", "code"] : undefined}
        unwrapDisallowed
      >
        {prep(text)}
      </ReactMarkdown>
    </Wrap>
  );
}
