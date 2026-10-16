import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/sobre-mi" },
  title: "Sobre mí",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
