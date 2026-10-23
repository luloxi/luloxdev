import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata() {
  return pageMetadata("/sobre-mi", {
    es: { title: "Sobre mí", description: "Mi historia y experiencia en AI, blockchain y desarrollo." },
    en: { title: "About", description: "My story and experience in AI, blockchain and software." },
  });
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
