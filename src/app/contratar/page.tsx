import { HireView } from "@/components/views/hire-view";
import { getPricing } from "@/lib/pricing-db";

// Rendered per request: amounts saved by the admin show up on the next load, no stale copy.
export const dynamic = "force-dynamic";

/** /contratar (/en/hire): the calculator gets the stored pricing (D1 over the code defaults). */
export default async function HirePage() {
  const pricing = await getPricing();
  return <HireView pricing={pricing} />;
}
