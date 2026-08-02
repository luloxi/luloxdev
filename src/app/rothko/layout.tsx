import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rothko",
};

export default function RothkoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
