"use client";

import Image from "next/image";
import { SectionNav } from "@/components/section-nav";
import { SocialNav } from "@/components/social-nav";
import { site } from "@/content/site";

/**
 * Home is locked to the visible viewport (no page scroll).
 * Mobile: stacked, large photo + name.
 * Desktop: hero photo left, title + links right.
 * Theme/lang controls live in layout (fixed).
 */
export default function HomePage() {
  return (
    <div className="fixed inset-0 z-10 flex flex-col overflow-hidden">
      <main className="home-main">
        <div className="home-layout">
          <div className="home-hero">
            <div className="avatar-hud">
              <span className="avatar-hud-frame" aria-hidden>
                <span className="avatar-hud-corner avatar-hud-corner-tl" />
                <span className="avatar-hud-corner avatar-hud-corner-tr" />
                <span className="avatar-hud-corner avatar-hud-corner-bl" />
                <span className="avatar-hud-corner avatar-hud-corner-br" />
                <span className="avatar-hud-tick avatar-hud-tick-t" />
                <span className="avatar-hud-tick avatar-hud-tick-b" />
                <span className="avatar-hud-tick avatar-hud-tick-l" />
                <span className="avatar-hud-tick avatar-hud-tick-r" />
              </span>

              <div className="avatar-hud-photo">
                <Image
                  src={site.avatar}
                  alt={site.name}
                  width={400}
                  height={400}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="home-copy">
            <h1 className="home-title neon-text font-display font-semibold uppercase">
              {site.name}
            </h1>
            <div className="home-title-rule" aria-hidden />

            <div className="home-socials">
              <SocialNav />
            </div>

            <div className="home-sections">
              <SectionNav />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
