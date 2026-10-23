import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReferralsAdmin } from "@/components/views/referrals-admin";
import { getDb } from "@/lib/db";
import { listReferrersWithLeads, type ReferrerWithLeads } from "@/lib/referrals-db";
import { getViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Referidos (admin)",
  robots: { index: false, follow: false },
};

/**
 * Admin only. proxy.ts already answers 404 to anyone who isn't the allowlisted
 * admin; this re-checks on the server before reading anything.
 */
export default async function AdminReferralsPage() {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) notFound();
  let referrers: ReferrerWithLeads[] = [];
  let error = false;
  try {
    const db = await getDb();
    referrers = db ? await listReferrersWithLeads(db) : [];
  } catch (err) {
    console.error("[admin/referidos]", err);
    error = true;
  }
  return <ReferralsAdmin referrers={referrers} loadError={error} />;
}
