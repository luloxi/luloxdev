import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata() {
  return pageMetadata("/referidos", {
    es: { title: "Referidos", description: "Traé un cliente y quedate con el 15% de lo que abone. Creá tu código y compartí tu link." },
    en: { title: "Referrals", description: "Bring a client and keep 15% of what they pay. Create your code and share your link." },
  });
}

export default function ReferralsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
