import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/contacto" },
  title: "Contacto",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
