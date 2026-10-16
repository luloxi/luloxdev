"use client";

import { useId, useState } from "react";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { splitSections } from "@/lib/md-sections";
import { useLocale } from "@/i18n/locale-provider";
import { InflowPencil, requestCopyEdit, useIsAdmin } from "@/components/admin-context";

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
  sections = false,
}: {
  text: string;
  copyKey?: string;
  className?: string;
  pClass?: string;
  /** Inside a link/button: no block elements wrapper, links rendered as text. */
  inline?: boolean;
  /** Each "## " section becomes a collapsible accordion (intro stays visible). */
  sections?: boolean;
}) {
  if (sections && !inline) {
    const parts = toSections(prep(text));
    if (parts.sections.length > 0) {
      return (
        <div className={`md-copy md-acc ${className}`.trim()}>
          {parts.intro.trim() ? (
            <IntroBlock text={parts.intro} pClass={pClass} copyKey={copyKey} />
          ) : null}
          <Accordion sections={parts.sections} pClass={pClass} copyKey={copyKey} />
        </div>
      );
    }
  }
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

function MdBlock({ text, pClass }: { text: string; pClass: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} skipHtml components={makeComponents(pClass, false)}>
      {text}
    </ReactMarkdown>
  );
}

type Section = { title: string; body: string };

function toSections(md: string): { intro: string; sections: Section[] } {
  const sp = splitSections(md);
  return {
    intro: sp.intro.join("\n"),
    sections: sp.sections.map((x) => ({
      title: x.title.replace(/[*_`]/g, "").replace(/\\(.)/g, "$1"),
      body: x.lines.join("\n"),
    })),
  };
}

function IntroBlock({ text, pClass, copyKey }: { text: string; pClass: string; copyKey?: string }) {
  const admin = useIsAdmin() && Boolean(copyKey);
  return (
    <div className={admin ? "md-intro-admin" : undefined} data-copy-inflow={copyKey ? "1" : undefined}>
      <MdBlock text={text} pClass={pClass} />
      {admin ? (
        <InflowPencil label="Edit intro" onClick={() => requestCopyEdit({ key: copyKey!, section: "intro", md: true })} />
      ) : null}
    </div>
  );
}

function Accordion({ sections, pClass, copyKey }: { sections: Section[]; pClass: string; copyKey?: string }) {
  const base = useId();
  const admin = useIsAdmin() && Boolean(copyKey);
  const { locale } = useLocale();
  const [open, setOpen] = useState<boolean[]>(() => sections.map(() => false));
  let last = -1;
  open.forEach((o, i) => { if (o) last = i; });
  let hint = -1;
  for (let i = last + 1; i < sections.length; i++) if (!open[i]) { hint = i; break; }
  return (
    <div className="md-acc-list" data-copy-inflow={copyKey ? "1" : undefined}>
      {sections.map((sec, i) => {
        const isOpen = open[i] ?? false;
        const id = `${base}-s${i}`;
        return (
          <section key={id} className={`md-acc-item${isOpen ? " is-open" : ""}`}>
            <h2 className={`md-acc-h${admin ? " md-acc-h-admin" : ""}`}>
              <button
                type="button"
                id={`${id}-btn`}
                className={`md-acc-btn${hint === i ? " md-acc-hint" : ""}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-panel`}
                onClick={() => setOpen((prev) => prev.map((v, j) => (j === i ? !v : v)))}
              >
                <span className="md-acc-title">{sec.title}</span>
                <svg className="md-acc-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {admin ? (
                <InflowPencil label={`Edit section ${i + 1}`} onClick={() => requestCopyEdit({ key: copyKey!, section: i, md: true })} />
              ) : null}
            </h2>
            <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-btn`} className="md-acc-panel" inert={!isOpen}>
              <div className="md-acc-inner">
                <div className="md-acc-body">
                  <MdBlock text={sec.body} pClass={pClass} />
                </div>
              </div>
            </div>
          </section>
        );
      })}
      {admin ? (
        <button type="button" className="ie-add-section" onClick={() => requestCopyEdit({ key: copyKey!, section: "new", md: true })}>
          {locale === "es" ? "+ sección" : "+ section"}
        </button>
      ) : null}
    </div>
  );
}
