"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useLocale } from "@/i18n/locale-provider";

/** Any signed-in user (admin or not): sign out and reload to the public view. */
export function LogoutButton() {
  const { locale } = useLocale();
  const [busy, setBusy] = useState(false);
  const label = locale === "es" ? "Cerrar sesión" : "Log out";
  return (
    <button
      type="button"
      className="cp-logout"
      data-inline-editor="skip"
      aria-label={label}
      title={label}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await authClient.signOut();
        } finally {
          window.location.reload();
        }
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
      <span>{locale === "es" ? "Salir" : "Log out"}</span>
    </button>
  );
}

/** Visitors: minimalist link to the admin sign-in, same look as Salir. */
export function LoginLink() {
  const { locale, href } = useLocale();
  const label = locale === "es" ? "Entrar" : "Log in";
  return (
    <Link href={href("/ingresar")} className="cp-logout" data-inline-editor="skip" aria-label={label} title={label}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
      </svg>
      <span>{label}</span>
    </Link>
  );
}
