"use client";

import { createContext, useContext, type ReactNode } from "react";

const AdminContext = createContext(false);

/** True only for the allowlisted admin (decided server-side per request). */
export function AdminProvider({ isAdmin, children }: { isAdmin: boolean; children: ReactNode }) {
  return <AdminContext.Provider value={isAdmin}>{children}</AdminContext.Provider>;
}

export function useIsAdmin() {
  return useContext(AdminContext);
}

export type CopyEditDetail = { key: string; section?: "intro" | number | "new"; md?: boolean };
export const COPY_EDIT_EVENT = "lulox:copy-edit";

/** In-flow pencils ask the InlineEditor to open via this event. */
export function requestCopyEdit(detail: CopyEditDetail) {
  window.dispatchEvent(new CustomEvent<CopyEditDetail>(COPY_EDIT_EVENT, { detail }));
}

export function InflowPencil({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="ie-inflow"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    </button>
  );
}
