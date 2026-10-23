import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/views/blog-post-view";
import { canSeeDraftsRequest } from "@/lib/admin-request";
import { getPostBySlug, getPublishedPost } from "@/lib/blog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  // Admin with edit mode ON opens drafts (edited in place); edit OFF = visitor (404).
  const post = (await canSeeDraftsRequest())
    ? await getPostBySlug(slug, { includeDrafts: true })
    : await getPublishedPost(slug);
  if (!post) notFound();
  return <BlogPostView post={post} />;
}
