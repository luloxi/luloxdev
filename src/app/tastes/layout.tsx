import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gustos",
};

export default function TastesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
