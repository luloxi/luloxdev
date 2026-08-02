import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar blog",
};

export default function AdminBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
