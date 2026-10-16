import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/proyectos" },
  title: "Proyectos",
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
