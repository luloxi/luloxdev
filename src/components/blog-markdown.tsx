"use client";

import Image from "next/image";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { linkifyBlogTerms } from "@/lib/blog-linkify";

function youtubeIdFromUrl(href: string): string | null {
  try {
    const u = new URL(href);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1) || null;
    }
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

const components: Components = {
  h2: ({ children }) => <h2 className="blog-h2">{children}</h2>,
  h3: ({ children }) => <h3 className="blog-h3">{children}</h3>,
  p: ({ children }) => <p className="blog-p">{children}</p>,
  ul: ({ children }) => <ul className="blog-ul">{children}</ul>,
  ol: ({ children }) => <ol className="blog-ol">{children}</ol>,
  li: ({ children }) => <li className="blog-li">{children}</li>,
  strong: ({ children }) => <strong className="blog-strong">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="blog-quote">{children}</blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className?.includes("language-")) || String(children).includes("\n");
    if (isBlock) {
      return (
        <pre className="blog-pre">
          <code className={className}>{children}</code>
        </pre>
      );
    }
    return <code className="blog-code">{children}</code>;
  },
  pre: ({ children }) => <>{children}</>,
  a: ({ href, children }) => {
    if (href) {
      const yt = youtubeIdFromUrl(href);
      if (yt) {
        return (
          <span className="blog-embed">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${yt}`}
              title={typeof children === "string" ? children : "YouTube"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="blog-embed-frame"
            />
          </span>
        );
      }
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="cp-prose-link"
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt }) => {
    if (!src || typeof src !== "string") return null;
    const isLocal = src.startsWith("/");
    return (
      <span className="blog-figure">
        {isLocal ? (
          <Image
            src={src}
            alt={alt ?? ""}
            width={640}
            height={360}
            className="blog-img"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt ?? ""} className="blog-img" />
        )}
        {alt ? <span className="blog-figcaption">{alt}</span> : null}
      </span>
    );
  },
  table: ({ children }) => (
    <div className="blog-table-wrap">
      <table className="blog-table">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="blog-th">{children}</th>,
  td: ({ children }) => <td className="blog-td">{children}</td>,
  hr: () => <hr className="blog-hr" />,
};

export function BlogMarkdown({ content }: { content: string }) {
  const linked = linkifyBlogTerms(content);

  return (
    <div className="blog-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {linked}
      </ReactMarkdown>
    </div>
  );
}
