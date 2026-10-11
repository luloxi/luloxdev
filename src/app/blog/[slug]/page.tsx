import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/views/blog-post-view";
import { getPublishedPost } from "@/lib/blog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  // Drafts and unknown slugs: real 404 (not-found page).
  if (!post) notFound();
  return <BlogPostView post={post} />;
}
