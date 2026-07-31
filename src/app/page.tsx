"use client";

import Image from "next/image";
import { SectionNav } from "@/components/section-nav";
import { SiteControls } from "@/components/site-controls";
import { SocialNav } from "@/components/social-nav";
import { site } from "@/content/site";

/**
 * Home is locked to the visible viewport (no page scroll).
 * Uses fixed inset-0 so parent layout cannot push content past the window edges.
 */
export default function HomePage() {
  return (
    <div className="fixed inset-0 z-10 flex flex-col overflow-hidden">
      <div className="absolute right-3 top-3 z-20 sm:right-5 sm:top-4">
        <SiteControls />
      </div>

      <main className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-3 sm:max-w-lg sm:px-8 sm:py-4">
        <div className="flex w-full min-h-0 max-h-full flex-col items-center">
          <header className="flex shrink-0 flex-col items-center text-center">
            <div className="relative mb-2.5 sm:mb-3">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-2 rounded-full bg-accent/20 blur-xl sm:-inset-3 sm:blur-2xl"
              />
              <Image
                src={site.avatar}
                alt={site.name}
                width={128}
                height={128}
                priority
                className="relative h-24 w-24 rounded-full border border-accent/40 object-cover shadow-[0_0_28px_var(--glow-violet)] sm:h-28 sm:w-28 md:h-32 md:w-32"
              />
            </div>
            <h1 className="font-display neon-text text-xl font-semibold tracking-tight sm:text-2xl md:text-[1.75rem]">
              {site.name}
            </h1>
            <div className="mt-2 sm:mt-2.5">
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
