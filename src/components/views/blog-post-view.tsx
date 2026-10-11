"use client";

import Image from "next/image";
import { Mail } from "lucide-react";
import { BlogMarkdown } from "@/components/blog-markdown";
import { PageShell } from "@/components/page-shell";
import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  TelegramIcon,
  XIcon,
} from "@/components/icons/social";
import type { BlogPost } from "@/content/blog/types";
import { localizePost } from "@/content/blog/types";
import { site, socials } from "@/content/site";
import { useLocale } from "@/i18n/locale-provider";

const authorSocialIcons = {
  x: XIcon,
  instagram: InstagramIcon,
  telegram: TelegramIcon,
  linkedin: LinkedInIcon,
  github: GitHubIcon,
} as const;

function formatDate(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

/** One published post, rendered on the server (D1) and hydrated for the ES/EN toggle. */
export function BlogPostView({ post }: { post: BlogPost }) {
  const { t, locale } = useLocale();
  const L = localizePost(post, locale);

  return (
    <PageShell
      title={t.blog.title}
      backHref="/blog"
      backLabel={t.blog.title}
      footerHref="/blog"
      footerLabel={t.blog.backToBlog}
    >
      <article className="space-y-6">
        <header
          className="cp-panel"
          style={{ ["--cp-accent" as string]: "var(--section-blog)" }}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner space-y-3">
            {post.coverImage ? (
              <div className="blog-cover">
                <Image
                  src={post.coverImage}
                  alt=""
                  width={120}
                  height={120}
                  className="blog-cover-img"
                  priority
                />
              </div>
            ) : null}
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--cp-accent)]">
              {formatDate(post.publishedAt, locale)}
            </p>
            <h1 className="blog-post-title">{L.title}</h1>
            <p className="cp-prose">{L.summary}</p>
          </div>
        </header>

        <div
          className="cp-panel"
          style={{ ["--cp-accent" as string]: "var(--section-blog)" }}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner">
            <BlogMarkdown content={L.body} />
          </div>
        </div>

        <aside
          className="cp-panel"
          style={{ ["--cp-accent" as string]: "var(--section-contact)" }}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--cp-accent)]">
              {t.blog.authorHeading}
            </p>
            <p className="cp-prose">{t.blog.authorBio}</p>
            <nav className="blog-author-socials" aria-label={t.ui.social}>
              <a
                href={`mailto:${site.email}`}
                title={site.email}
                aria-label={t.contact.emailLabel}
                className="blog-author-social-link"
              >
                <Mail
                  className="blog-author-social-icon"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </a>
              {socials.map((s) => {
                const Icon = authorSocialIcons[s.id];
                return (
                  <a
                    key={s.id}
                    href={s.href}
                    title={s.label}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="blog-author-social-link"
                  >
                    <Icon className="blog-author-social-icon" />
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>
      </article>
    </PageShell>
  );
}
