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

      {/* Purely decorative floating bits */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="deco-float absolute left-[12%] top-[18%] h-1.5 w-1.5" />
        <span className="deco-float deco-float-b absolute right-[14%] top-[28%] h-1 w-1" />
        <span className="deco-float absolute bottom-[22%] left-[18%] h-1 w-1 opacity-40" />
        <span className="deco-float deco-float-b absolute bottom-[30%] right-[20%] h-2 w-2" />
        <span className="deco-ring absolute left-[8%] top-[42%] h-16 w-16 opacity-30" />
        <span className="deco-ring absolute bottom-[12%] right-[6%] h-24 w-24 opacity-20" />
      </div>

      <main className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-3 sm:max-w-lg sm:px-8 sm:py-4">
        <div className="flex w-full min-h-0 max-h-full flex-col items-center">
          <header className="flex shrink-0 flex-col items-center text-center">
            <div className="relative mb-2.5 sm:mb-3">
              {/* Corner brackets - unnecessary, on purpose */}
              <span
                aria-hidden
                className="deco-bracket -left-2 -top-2 border-l border-t"
              />
              <span
                aria-hidden
                className="deco-bracket -right-2 -top-2 border-r border-t"
              />
              <span
                aria-hidden
                className="deco-bracket -bottom-2 -left-2 border-b border-l"
              />
              <span
                aria-hidden
                className="deco-bracket -bottom-2 -right-2 border-b border-r"
              />

              <div
                aria-hidden
                className="pointer-events-none absolute -inset-2 rounded-full bg-accent/20 blur-xl sm:-inset-3 sm:blur-2xl"
              />
              <div
                aria-hidden
                className="deco-ring -inset-3 opacity-50 sm:-inset-4"
              />
              <div
                aria-hidden
                className="deco-ring -inset-5 opacity-25 sm:-inset-6"
                style={{ borderStyle: "dashed" }}
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
