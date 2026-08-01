"use client";

import Image from "next/image";
import { SectionNav } from "@/components/section-nav";
import { SocialNav } from "@/components/social-nav";
import { site } from "@/content/site";

/**
 * Home is locked to the visible viewport (no page scroll).
 * Uses fixed inset-0 so parent layout cannot push content past the window edges.
 * Theme/lang controls live in layout (fixed) — not duplicated here.
 */
export default function HomePage() {
  return (
    <div className="fixed inset-0 z-10 flex flex-col overflow-hidden">
      <main className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-3 pt-12 sm:max-w-lg sm:px-8 sm:py-4 sm:pt-14">
        <div className="flex w-full min-h-0 max-h-full flex-col items-center">
          <header className="flex shrink-0 flex-col items-center text-center">
            <div className="avatar-hud mb-3 sm:mb-3.5">
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
                  width={128}
                  height={128}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <h1 className="font-display neon-text text-xl font-semibold uppercase sm:text-2xl md:text-[1.75rem]">
              {site.name}
            </h1>
            <div
              aria-hidden
              className="mt-1.5 h-px w-12 bg-gradient-to-r from-transparent via-accent to-transparent opacity-60 sm:w-16"
            />

            <div className="mt-2.5 sm:mt-3">
              <SocialNav />
            </div>
          </header>

          <div className="mt-4 w-full shrink-0 sm:mt-5 md:mt-6">
            <SectionNav />
          </div>
        </div>
      </main>
    </div>
  );
}
