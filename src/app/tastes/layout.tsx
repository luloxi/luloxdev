import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata() {
  return pageMetadata("/tastes", {
    es: { title: "Gustos", description: "Películas, música y lo que me gusta: Letterboxd, Last.fm y Spotify." },
    en: { title: "Tastes", description: "Movies, music and the stuff I like: Letterboxd, Last.fm and Spotify." },
  });
}

export default function TastesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
