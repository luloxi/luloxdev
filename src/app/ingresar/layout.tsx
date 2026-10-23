import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata() {
  return pageMetadata("/ingresar", {
    es: { title: "Acceso", description: "Acceso de administrador del sitio." },
    en: { title: "Sign in", description: "Site admin sign-in." },
  });
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
