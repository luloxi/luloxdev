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
      <div className="absolute right-3 top-3 z-20 sm:right-5 sm:top-5">
        <SiteControls />
      </div>

      <main className="mx-auto flex h-full w-full max-w-md flex-col justify-center overflow-hidden px-5 py-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:max-w-lg sm:px-8 sm:py-8">
        <header className="flex shrink-0 flex-col items-center text-center">
          <div className="relative mb-3 sm:mb-4">
            <div
              aria-hidden
              className="absolute -inset-3 rounded-full bg-accent/20 blur-2xl"
            />
            <Image
              src={site.avatar}
              alt={site.name}
              width={144}
              height={144}
              priority
              className="relative h-28 w-28 rounded-full border border-accent/40 object-cover shadow-[0_0_32px_var(--glow-violet)] sm:h-36 sm:w-36"
            />
          </div>
          <h1 className="font-display neon-text text-2xl font-semibold tracking-tight sm:text-3xl">
            {site.name}
          </h1>
          <div className="mt-3 sm:mt-4">
            <SocialNav />
          </div>
        </header>

        <div className="mt-6 w-full shrink-0 sm:mt-8">
          <SectionNav />
        </div>
      </main>
    </div>
  );
}
