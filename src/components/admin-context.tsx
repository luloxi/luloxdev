"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocale } from "@/i18n/locale-provider";

type AdminState = { isAdmin: boolean; editOn: boolean };
const AdminContext = createContext<AdminState>({ isAdmin: false, editOn: false });

/**
 * Admin flag (decided server-side per request) plus the edit-mode toggle.
 * Edit mode makes allowlisted body content editable in place; the page looks
 * exactly the same, no pencils or outlines.
 */
export function AdminProvider({ isAdmin, children }: { isAdmin: boolean; children: ReactNode }) {
  const { locale } = useLocale();
  const [editOn, setEditOn] = useState(true);
  useEffect(() => {
    const v = window.localStorage.getItem("lulox-edit-mode");
    if (v === "off") setEditOn(false); // eslint-disable-line react-hooks/set-state-in-effect -- restore saved preference
  }, []);
  const es = locale === "es";
  return (
    <AdminContext.Provider value={{ isAdmin, editOn: isAdmin && editOn }}>
      {children}
      {isAdmin ? (
        <button
          type="button"
          className="ie-toggle"
          aria-pressed={editOn}
          aria-label={es ? "Modo edición" : "Edit mode"}
          title={es ? "Modo edición: editar el contenido en la página" : "Edit mode: edit content in place"}
          onClick={() =>
            setEditOn((v) => {
              window.localStorage.setItem("lulox-edit-mode", v ? "off" : "on");
              return !v;
            })
          }
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
