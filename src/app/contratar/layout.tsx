import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/contratar" },
  title: "Contratarme",
  description: "Calculá un presupuesto estimado y agendá una videollamada con Lulox.",
};

export default function HireLayout({ children }: { children: React.ReactNode }) {
  return children;
}
