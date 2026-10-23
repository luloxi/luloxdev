"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/i18n/locale-provider";
import { EDIT_MODE_KEY, editModeCookie, editModeFromCookie } from "@/lib/edit-mode";

type AdminState = { isAdmin: boolean; editOn: boolean; signedIn: boolean };
const AdminContext = createContext<AdminState>({ isAdmin: false, editOn: false, signedIn: false });

/**
 * Admin flag (decided server-side per request) plus the edit-mode toggle.
 * Edit mode makes allowlisted body content editable in place; the page looks
 * exactly the same, no pencils or outlines.
 */
export function AdminProvider({ isAdmin, signedIn = isAdmin, children }: { isAdmin: boolean; signedIn?: boolean; children: ReactNode }) {
  const { locale } = useLocale();
  const router = useRouter();
  const [editOn, setEditOn] = useState(true);
  useEffect(() => {
    const v = window.localStorage.getItem(EDIT_MODE_KEY);
    if (v === "off") setEditOn(false); // eslint-disable-line react-hooks/set-state-in-effect -- restore saved preference
    // Mirror to the cookie the server reads (blog drafts); re-render if it was out of sync.
    if (isAdmin && editModeFromCookie(document.cookie) !== (v !== "off")) {
      document.cookie = editModeCookie(v !== "off");
      router.refresh();
    }
  }, [isAdmin, router]);
  const es = locale === "es";
  return (
    <AdminContext.Provider value={{ isAdmin, editOn: isAdmin && editOn, signedIn: signedIn || isAdmin }}>
      {children}
      {isAdmin ? (
        <button
          type="button"
          className="ie-toggle"
          aria-pressed={editOn}
          aria-label={es ? "Modo edición" : "Edit mode"}
          title={es ? "Modo edición: editar el contenido en la página" : "Edit mode: edit content in place"}
          onClick={() => {
            const next = !editOn;
            window.localStorage.setItem(EDIT_MODE_KEY, next ? "on" : "off");
            document.cookie = editModeCookie(next);
            setEditOn(next);
            router.refresh(); // server pages (blog) re-read the cookie: drafts hide/show
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>{" "}
          <span>{editOn ? "ON" : "OFF"}</span>
        </button>
      ) : null}
    </AdminContext.Provider>
  );
}

export function useIsAdmin() {
  return useContext(AdminContext).isAdmin;
}

/** Any Google session (admin or not): decided server-side by the root layout. */
export function useSignedIn() {
  return useContext(AdminContext).signedIn;
}

export function useEditMode() {
  return useContext(AdminContext).editOn;
}

/** Save one site_copy value for the current locale (admin-only API). */
export async function saveCopy(key: string, locale: string, value: string): Promise<string | null> {
  const res = await fetch("/api/copy", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, locale, value }),
  });
  if (res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return res.status === 401 ? "session" : (data.error ?? String(res.status));
}
