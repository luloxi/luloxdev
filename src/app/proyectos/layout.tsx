import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata() {
  return pageMetadata("/proyectos", {
    es: { title: "Proyectos", description: "Lo que construí en AI, blockchain y tokenización." },
    en: { title: "Projects", description: "What I've built in AI, blockchain and tokenization." },
  });
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
