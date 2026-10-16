import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How lulox.dev handles data: no tracking, Google sign-in only for the site owner.",
  alternates: { canonical: "/privacidad" },
};

const CONTACT = "lucianoolivabianco@gmail.com";

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy">
      <div
        className="cp-panel"
        style={{ ["--cp-accent" as string]: "var(--section-about)" }}
      >
        <span className="cp-nav-frame" aria-hidden>
          <span className="cp-nav-corner cp-nav-corner-tl" />
          <span className="cp-nav-corner cp-nav-corner-br" />
        </span>
        <div className="cp-panel-inner space-y-4">
          <p className="cp-prose">
            lulox.dev is the personal site of Luciano Oliva Bianco. This page
            explains what data the site uses. Last updated: October 10, 2026.
          </p>
          <p className="cp-prose">
            <strong>Visitors.</strong> You can read everything on this site
            without an account. We don&apos;t run ads, analytics trackers or
            third-party cookies, and we don&apos;t sell or share personal data
            with anyone.
          </p>
          <p className="cp-prose">
            <strong>Google sign-in.</strong> &quot;Sign in with Google&quot; is
            only used by the site owner to reach the private admin area where
            posts and projects are edited. When used, the site receives the
            Google account&apos;s name, email address and profile picture, and
            only the owner&apos;s email is allowed in. Other accounts are
            rejected and not stored.
          </p>
          <p className="cp-prose">
            <strong>Cookies.</strong> Signing in sets a single session cookie
            needed to keep the admin logged in. The site also remembers your
            language and theme choice in your browser&apos;s local storage.
            Nothing else is stored about visitors.
          </p>
          <p className="cp-prose">
            <strong>Hosting.</strong> The site runs on Cloudflare, which
            processes standard request data (such as IP address) to deliver and
            protect the site, under its own privacy policy.
          </p>
          <p className="cp-prose">
            <strong>Contact.</strong> Questions or deletion requests:{" "}
            <a href={`mailto:${CONTACT}`} className="cp-prose-link">
              {CONTACT}
            </a>
            .
          </p>
        </div>
      </div>
    </PageShell>
  );
}
