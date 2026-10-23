import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata() {
  return pageMetadata("/blog", {
    es: { title: "Blog", description: "Artículos sobre AI, blockchain, tokenización y comercio agéntico." },
    en: { title: "Blog", description: "Articles on AI, blockchain, tokenization and agentic commerce." },
  });
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
