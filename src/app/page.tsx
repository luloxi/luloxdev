"use client";

import Image from "next/image";
import { SectionNav } from "@/components/section-nav";
import { SiteControls } from "@/components/site-controls";
import { SocialNav } from "@/components/social-nav";
import { site } from "@/content/site";

export default function HomePage() {
  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden">
      <div className="absolute right-3 top-3 z-20 sm:right-5 sm:top-4">
        <SiteControls />
      </div>

      <main className="mx-auto flex h-full w-full max-w-md flex-col px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pb-4 sm:pt-5">
        <header className="flex shrink-0 flex-col items-center text-center">
          <div className="relative mb-2 sm:mb-2.5">
            <div
              aria-hidden
              className="absolute -inset-3 rounded-full bg-accent/20 blur-2xl"
            />
            <Image
              src={site.avatar}
              alt={site.name}
              width={128}
              height={128}
              priority
              className="relative h-28 w-28 rounded-full border border-accent/40 object-cover shadow-[0_0_32px_var(--glow-violet)] sm:h-32 sm:w-32"
            />
          </div>
          <h1 className="font-display neon-text text-xl font-semibold tracking-tight sm:text-2xl">
            {site.name}
          </h1>
          <div className="mt-1.5 sm:mt-2">
            <SocialNav />
          </div>
        </header>

        <div className="mt-2.5 flex min-h-0 flex-1 flex-col sm:mt-3">
          <SectionNav />
        </div>
      </main>
    </div>
  );
}
