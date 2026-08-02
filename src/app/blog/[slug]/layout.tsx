import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/blog";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Include drafts so admin preview still gets a real title
  const post = await getPostBySlug(slug, { includeDrafts: true });
  if (!post) {
    return { title: "Blog" };
  }
  return {
    title: post.title.es,
    description: post.summary.es,
    openGraph: {
      title: post.title.es,
      description: post.summary.es,
      type: "article",
    },
    twitter: {
      title: post.title.es,
      description: post.summary.es,
    },
  };
}

export default function BlogPostLayout({ children }: Props) {
  return children;
}
