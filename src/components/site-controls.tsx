"use client";

import { LocaleToggle } from "@/components/locale-toggle";
import { LoginLink, LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

/** Fixed chrome — always same screen corner on every page */
export function SiteControls({ className, isAdmin = false }: { className?: string; isAdmin?: boolean }) {
  return (
    <div
      data-inline-editor="skip"
      className={cn(
        "fixed right-3 top-3 z-50 flex items-center gap-2 sm:right-5 sm:top-4",
        className,
      )}
    >
      <LocaleToggle />
      <ThemeToggle />
      {isAdmin ? <LogoutButton /> : <LoginLink />}
    </div>
  );
}
