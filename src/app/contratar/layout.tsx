import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata() {
  return pageMetadata("/contratar", {
    es: { title: "Contratar", description: "Presupuesto en segundos para trabajar conmigo." },
    en: { title: "Hire me", description: "Get a quote in seconds to work with me." },
  });
}

export default function HireLayout({ children }: { children: React.ReactNode }) {
  return children;
}
