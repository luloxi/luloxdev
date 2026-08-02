"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { authClient } from "@/lib/auth/client";
import { useLocale } from "@/i18n/locale-provider";

function SignInInner() {
  const { t } = useLocale();
  const params = useSearchParams();
  const error = params.get("error");

  async function signInGoogle() {
    const origin = window.location.origin;
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${origin}/admin/blog`,
        errorCallbackURL: `${origin}/auth/sign-in?error=oauth`,
      });
    } catch (err) {
      console.error("[auth] Google sign-in failed", err);
      window.location.href = `/auth/sign-in?error=oauth`;
    }
  }

  return (
    <PageShell title={t.blog.signInTitle}>
      <div
        className="cp-panel"
        style={{ ["--cp-accent" as string]: "var(--section-blog)" }}
      >
        <span className="cp-nav-frame" aria-hidden>
          <span className="cp-nav-corner cp-nav-corner-tl" />
          <span className="cp-nav-corner cp-nav-corner-br" />
        </span>
        <div className="cp-panel-inner space-y-4 py-2">
          <p className="cp-prose">{t.blog.signInNote}</p>
          <p className="cp-prose text-[0.85rem] opacity-90">
            {t.blog.signInProviders}
          </p>

          {error === "auth_not_configured" ? (
            <p className="font-mono text-xs text-[color:var(--section-tastes)]">
              {t.blog.authNotConfigured}
            </p>
          ) : null}
          {error === "oauth" ? (
            <p className="font-mono text-xs text-[color:var(--section-tastes)]">
              {t.blog.oauthError}
            </p>
          ) : null}
          {error === "forbidden" ? (
            <p className="font-mono text-xs text-[color:var(--section-tastes)]">
              {t.blog.forbidden}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void signInGoogle()}
            className="blog-admin-btn"
          >
            {t.blog.signInGoogle}
          </button>
        </div>
      </div>
    </PageShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <PageShell title="…">
          <div className="cp-prose">…</div>
        </PageShell>
      }
    >
      <SignInInner />
    </Suspense>
  );
}
