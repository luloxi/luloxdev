"use client";

import Image from "next/image";
import { SectionNav } from "@/components/section-nav";
import { SiteControls } from "@/components/site-controls";
import { SocialNav } from "@/components/social-nav";
import { site } from "@/content/site";

/** Home is a single locked viewport - never scrollable */
export default function HomePage() {
  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden">
      <div className="absolute right-3 top-3 z-20 sm:right-5 sm:top-4">
        <SiteControls />
      </div>

      <main className="mx-auto flex h-full w-full max-w-md flex-col justify-center overflow-hidden px-5 py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-6">
        <header className="flex shrink-0 flex-col items-center text-center">
          <div className="relative mb-2 sm:mb-3">
            <div
              aria-hidden
              className="absolute -inset-2 rounded-full bg-accent/20 blur-xl sm:-inset-3 sm:blur-2xl"
            />
            <Image
              src={site.avatar}
              alt={site.name}
              width={112}
              height={112}
              priority
              className="relative h-20 w-20 rounded-full border border-accent/40 object-cover shadow-[0_0_28px_var(--glow-violet)] sm:h-24 sm:w-24"
            />
          </div>
          <h1 className="font-display neon-text text-lg font-semibold tracking-tight sm:text-xl">
            {site.name}
          </h1>
          <div className="mt-1.5 sm:mt-2">
            <SocialNav />
          </div>
        </header>

        <div className="mt-4 w-full shrink-0 sm:mt-5">
          <SectionNav />
        </div>
      </main>
    </div>
  );
}
