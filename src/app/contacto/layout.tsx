import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata() {
  return pageMetadata("/contacto", {
    es: { title: "Contacto", description: "Escribime o encontrame en redes." },
    en: { title: "Contact", description: "Write to me or find me on social media." },
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
